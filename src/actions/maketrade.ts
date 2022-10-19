import Lyra, { Market, Option, Trade, TradeDisabledReason, TradeEvent } from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import { UNIT } from '../constants/bn'
import { ProviderType } from '../types/arbs'
import { LyraTradeArgs } from '../types/lyra'
import { TradeResult } from '../types/trade'
import approve from '../utils/approve'
import fromBigNumber from '../utils/fromBigNumber'
import printObject from '../utils/printObject'
import toBigNumber from '../utils/toBigNumber'

// Increase slippage for debugging
const SLIPPAGE = 0.1 / 100

export const defaultResult = (provider: ProviderType): TradeResult => {
  return {
    isSuccess: false,
    pricePerOption: 0,
    failReason: '',
    provider: provider,
  }
}

export const makeTradeLyra = async (lyra: Lyra, signer: ethers.Wallet, args: LyraTradeArgs): Promise<TradeResult> => {
  const size = toBigNumber(args.size)
  const isCall = args.call
  const isBuy = args.buy
  const setToCollateral = args.collat ? toBigNumber(args.collat) : undefined
  const strikeId = args.strike
  const marketAddressOrName = args.market
  const isBaseCollateral = args.base
  const owner = signer.address

  const market = await lyra.market(marketAddressOrName)
  const option = market.liveOption(strikeId, isCall)
  const result = defaultResult(ProviderType.LYRA)
  const trys = 3

  console.log(
    `${isBuy ? 'Buying' : 'Selling'} ${args.size} ${market.name} ${isCall ? 'Calls' : 'Puts'} for $${fromBigNumber(
      option.strike().strikePrice,
    )} strike, ${option.board().expiryTimestamp} expiry`,
  )

  // Approve
  await approve(lyra, signer, market, market.quoteToken.address)

  // first stab
  let trade = await prepareTrade(lyra, owner, market, option, isBuy, size, setToCollateral, isBaseCollateral)

  if (trade.isDisabled) {
    // set collat to the minimum
    if (trade.disabledReason === TradeDisabledReason.NotEnoughCollateral) {
      console.log(
        `Retrying Trade with min collateral, new collat: ${fromBigNumber(
          trade?.collateral?.min as unknown as ethers.BigNumber,
        )}`,
      )
      trade = await prepareTrade(
        lyra,
        owner,
        market,
        option,
        isBuy,
        size,
        trade?.collateral?.min as unknown as ethers.BigNumber,
        isBaseCollateral,
      )
    } else if (trade.disabledReason === TradeDisabledReason.TooMuchCollateral) {
      console.log(
        `Retrying Trade with max collateral, new collat: ${fromBigNumber(
          trade?.collateral?.max as unknown as ethers.BigNumber,
        )}`,
      )
      trade = await prepareTrade(
        lyra,
        owner,
        market,
        option,
        isBuy,
        size,
        trade?.collateral?.max as unknown as ethers.BigNumber,
        isBaseCollateral,
      )
    } else {
      result.failReason = trade.disabledReason as string
      return result
    }
  }

  //console.log('------------------ PREPARED TRADE START ------------------')
  //printObject(trade)
  //console.log('------------------ PREPARED TRADE END ------------------')

  // Check if trade is disabled
  if (trade.disabledReason) {
    console.log('Disabled:', trade.disabledReason)
    result.failReason = trade.disabledReason as string
    return result
  }

  const response = await signer.sendTransaction(trade.tx)
  console.log('Executed trade:', response.hash)
  const receipt = await response.wait()
  console.log('tx', receipt.transactionHash)

  result.isSuccess = receipt.status === 1

  try {
    const [tradeEvent] = await TradeEvent.getByHash(lyra, receipt.transactionHash)
    result.pricePerOption = fromBigNumber(tradeEvent.pricePerOption)

    printObject('Result', {
      timestamp: tradeEvent.timestamp,
      blockNumber: tradeEvent.blockNumber,
      positionId: tradeEvent.positionId,
      premium: tradeEvent.premium,
      fee: tradeEvent.fee,
      feeComponents: tradeEvent.feeComponents,
      collateral: tradeEvent.collateralValue,
    })
    console.log('Slippage', 100 * (fromBigNumber(trade.quoted.mul(UNIT).div(tradeEvent.premium)) - 1), '%')
  } catch (ex) {
    console.log(ex)
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
) => {
  // Prepare Trade
  const trade = await Trade.get(lyra, owner, market.address, option.strike().id, option.isCall, isBuy, size, {
    setToCollateral,
    isBaseCollateral,
    premiumSlippage: SLIPPAGE,
  })

  return trade
}

export const makeTradeDeribit = async (): Promise<TradeResult> => {
  const result = defaultResult(ProviderType.DERIBIT)

  // todo -> implement DERIBIT BUY

  return result
}
