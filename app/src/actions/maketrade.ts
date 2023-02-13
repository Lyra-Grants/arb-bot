import { Option, Trade, TradeDisabledReason, TradeEvent, Network as LyraNetwork } from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import { UNIT } from '../constants/bn'
import { ProviderType } from '../types/arbs'
import { LyraTradeArgs } from '../types/lyra'
import { TradeResult } from '../types/trade'
import approve from '../utils/approve'
import fromBigNumber from '../utils/fromBigNumber'
import getLyraSDK from '../utils/getLyraSDK'
import getSigner from '../utils/getSigner'
import printObject from '../utils/printObject'
import toBigNumber from '../utils/toBigNumber'

// Increase slippage for debugging
const SLIPPAGE = 0.1 / 100

export const defaultResult = (provider: ProviderType, failReason: string): TradeResult => {
  return {
    isSuccess: false,
    pricePerOption: 0,
    failReason: failReason,
    provider: provider,
    lyraResult: undefined,
    deribitResult: undefined,
  }
}

export const makeTradeLyra = async (args: LyraTradeArgs, network: LyraNetwork): Promise<TradeResult> => {
  const lyra = getLyraSDK(network)
  const signer = getSigner(network)

  const marketAddressOrName = args.market
  const marketBalance = await lyra.account(signer.address).marketBalances(marketAddressOrName)
  const quoteToken = marketBalance.quoteAsset
  const size = toBigNumber(args.size)
  const isCall = !!args.call
  const isBuy = !!args.buy
  const setToCollateral = args.collat ? toBigNumber(args.collat, quoteToken.decimals) : undefined
  const strikeId = args.strike
  const isBaseCollateral = isBuy ? true : isCall ? true : false // for buys not relevant / sells: calls (base or stable)  puts: stable (isbase = false)

  const owner = signer.address
  const market = await lyra.market(marketAddressOrName)
  const result = defaultResult(ProviderType.LYRA, '')

  let option: Option | undefined = undefined

  try {
    console.log(`STRIKEID: ${strikeId}`)
    console.log(`ISCALL: ${isCall}`)

    option = market.liveOption(strikeId, isCall)
  } catch (ex) {
    console.log(ex)
    result.isSuccess = false
    result.failReason = 'Strike is expired or does not exist for market'
    return result
  }

  console.log(
    `${isBuy ? 'Buying' : 'Selling'} ${args.size} ${market.name} ${isCall ? 'Calls' : 'Puts'} for $${fromBigNumber(
      option.strike().strikePrice,
    )} strike, ${option.board().expiryTimestamp} expiry`,
  )

  let trade = await Trade.get(lyra, owner, market.address, option.strike().id, option.isCall, isBuy, size, {
    setToCollateral,
    isBaseCollateral,
    slippage: SLIPPAGE,
  })

  // Error prepping the trade
  if (!trade) {
    return result
  }

  // trade is disabled
  if (trade.isDisabled) {
    // set collat to the minimum
    if (trade.disabledReason === TradeDisabledReason.NotEnoughCollateral) {
      const minColat = trade?.collateral?.min
      console.log(`Retrying Trade with min collateral, new collat: ${minColat}`)

      try {
        trade = await Trade.get(lyra, owner, market.address, option.strike().id, option.isCall, isBuy, size, {
          setToCollateral: minColat,
          isBaseCollateral,
          slippage: SLIPPAGE,
        })
      } catch (ex) {
        result.isSuccess = false
        result.failReason = 'Failed.'
        return result
      }
    } else if (trade.disabledReason === TradeDisabledReason.TooMuchCollateral) {
      const maxColat = trade?.collateral?.min
      console.log(
        `Retrying Trade with max collateral, new collat: ${fromBigNumber(
          trade?.collateral?.max as unknown as ethers.BigNumber,
        )}`,
      )
      try {
        trade = await Trade.get(lyra, owner, market.address, option.strike().id, option.isCall, isBuy, size, {
          setToCollateral: maxColat,
          isBaseCollateral,
          slippage: SLIPPAGE,
        })
      } catch (ex) {
        result.isSuccess = false
        result.failReason = 'Failed.'
        return result
      }
    } else {
      result.isSuccess = false
      result.failReason = trade.disabledReason as string
      return result
    }
  }
  // TODO trade preparation might still have failed. -> so return fail with fail reason
  if (!trade) {
    return result
  }

  await approve(trade, network)

  printObject('Quote', {
    timestamp: trade.board().block.timestamp,
    blockNumber: trade.board().block.number,
    premium: trade.quoted,
    fee: trade.fee,
    feeComponents: trade.feeComponents,
    setCollateralTo: trade.collateral
      ? {
          amount: fromBigNumber(trade.collateral.amount),
          min: fromBigNumber(trade.collateral.min),
        }
      : null,
  })

  // Check if trade is disabled
  if (trade.disabledReason) {
    console.log('Disabled:', trade.disabledReason)
    result.isSuccess = false
    result.failReason = trade.disabledReason as string
    return result
  }

  try {
    const response = await signer.sendTransaction(trade.tx)
    const receipt = await response.wait()
    console.log('tx', receipt.transactionHash)

    result.isSuccess = receipt.status === 1

    const [tradeEvent] = await TradeEvent.getByHash(lyra, receipt.transactionHash)
    result.pricePerOption = fromBigNumber(tradeEvent.pricePerOption)

    result.lyraResult = {
      positionId: tradeEvent.positionId,
      premium: fromBigNumber(tradeEvent.premium),
      fee: fromBigNumber(tradeEvent.fee),
      trader: tradeEvent.trader,
      collateral: tradeEvent?.collateralValue ? fromBigNumber(tradeEvent.collateralValue) : 0,
      slippage: 100 * (fromBigNumber(trade.quoted.mul(UNIT).div(tradeEvent.premium)) - 1),
      iv: fromBigNumber(trade.iv),
    }
  } catch (ex) {
    console.log(ex)
    result.isSuccess = false
    result.failReason = 'Trade execution failed.'
  }

  return result
}
