import Lyra, { Market, Option, Trade, TradeDisabledReason, TradeEvent } from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import { UNIT } from '../constants/bn'
import { ProviderType } from '../types/arbs'
import { LyraTradeArgs } from '../types/lyra'
import { TradeResult } from '../types/trade'
import approve from '../utils/approve'
import fromBigNumber from '../utils/fromBigNumber'
import getLyra from '../utils/getLyra'
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

export const makeTradeLyra = async (args: LyraTradeArgs): Promise<TradeResult> => {
  const lyra = getLyra()
  const signer = getSigner()
  const size = toBigNumber(args.size)
  const isCall = args.call
  const isBuy = args.buy
  const setToCollateral = args.collat ? toBigNumber(args.collat) : undefined
  const strikeId = args.strike
  const marketAddressOrName = args.market
  const isBaseCollateral = isBuy ? true : isCall ? true : false // for buys not relevant / sells: calls (base or stable)  puts: stable (isbase = false)
  const owner = signer.address
  const market = await lyra.market(marketAddressOrName)
  const result = defaultResult(ProviderType.LYRA, '')
  let option: Option | undefined = undefined
  const positionId = args.positionId

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

  // Approve
  await approve(lyra, signer, market, market.quoteToken.address)

  // first stab

  let trade = await prepareTrade(
    lyra,
    owner,
    market,
    option,
    isBuy,
    size,
    setToCollateral,
    isBaseCollateral,
    positionId,
  )

  // Error prepping the trade
  if (!trade) {
    return result
  }

  // trade is disabled
  if (trade.isDisabled) {
    // set collat to the minimum
    if (trade.disabledReason === TradeDisabledReason.NotEnoughCollateral) {
      console.log(
        `Retrying Trade with min collateral, new collat: ${fromBigNumber(
          trade?.collateral?.min as unknown as ethers.BigNumber,
        )}`,
      )
      try {
        trade = await prepareTrade(
          lyra,
          owner,
          market,
          option,
          isBuy,
          size,
          trade?.collateral?.min as unknown as ethers.BigNumber,
          isBaseCollateral,
          positionId,
        )
      } catch (ex) {
        result.isSuccess = false
        result.failReason = 'Failed.'
        return result
      }
    } else if (trade.disabledReason === TradeDisabledReason.TooMuchCollateral) {
      console.log(
        `Retrying Trade with max collateral, new collat: ${fromBigNumber(
          trade?.collateral?.max as unknown as ethers.BigNumber,
        )}`,
      )
      try {
        trade = await prepareTrade(
          lyra,
          owner,
          market,
          option,
          isBuy,
          size,
          trade?.collateral?.max as unknown as ethers.BigNumber,
          isBaseCollateral,
          positionId,
        )
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

  console.log('------------------ PREPARED TRADE START ------------------')
  printObject(trade)
  console.log('------------------ PREPARED TRADE END ------------------')

  // TODO trade preparation might still have failed. -> so return fail with fail reason
  if (!trade) {
    return result
  }

  // Check if trade is disabled
  if (trade.disabledReason) {
    console.log('Disabled:', trade.disabledReason)
    result.isSuccess = false
    result.failReason = trade.disabledReason as string
    return result
  }

  try {
    const response = await signer.sendTransaction(trade.tx)
    console.log('Executed trade:', response.hash)
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

export const prepareTrade = async (
  lyra: Lyra,
  owner: string,
  market: Market,
  option: Option,
  isBuy: boolean,
  size: ethers.BigNumber,
  setToCollateral: ethers.BigNumber | undefined,
  isBaseCollateral: boolean,
  positionId: number,
) => {
  try {
    if (positionId != 0) {
      console.log(`Position Trade, position: ${positionId}`)
      const position = await lyra.position(market.name, positionId)
      console.log(`Position found`)
      console.log(`--- Args: -----`)
      console.log(`--- IsBuy: ${isBuy}-----`)
      console.log(`--- Size: ${size} -----`)
      console.log(`--- SetCollateralTo: ${setToCollateral} -----`)
      console.log(`--- IsBaseCollateral: ${isBaseCollateral} -----`)

      const positionTrade = await position.trade(isBuy, size, SLIPPAGE, {
        setToCollateral,
        isBaseCollateral,
        premiumSlippage: SLIPPAGE,
      })
      return positionTrade
    }
  } catch (ex) {
    console.log(ex)
    return
  }

  try {
    const trade = await Trade.get(lyra, owner, market.address, option.strike().id, option.isCall, isBuy, size, {
      setToCollateral,
      isBaseCollateral,
      premiumSlippage: SLIPPAGE,
    })
    return trade
  } catch (ex) {
    console.log(ex)
  }
  return
}
