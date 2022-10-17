import Lyra, { Trade, TradeEvent } from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import { UNIT } from '../constants/bn'
import { LyraTradeArgs } from '../types/lyra'
import approve from '../utils/approve'
import fromBigNumber from '../utils/fromBigNumber'
import printObject from '../utils/printObject'
import toBigNumber from '../utils/toBigNumber'

// Increase slippage for debugging
const SLIPPAGE = 0.1 / 100

export async function maketrade(lyra: Lyra, signer: ethers.Wallet, args: LyraTradeArgs) {
  const size = toBigNumber(args.amount)
  const isCall = args.call
  const isBuy = args.buy
  const setToCollateral = args.collat ? toBigNumber(args.collat) : undefined
  const strikeId = args.strike
  const marketAddressOrName = args.market
  const isBaseCollateral = args.base
  const owner = signer.address

  const market = await lyra.market(marketAddressOrName)
  const option = market.liveOption(strikeId, isCall)

  console.log(
    `${isBuy ? 'Buying' : 'Selling'} ${args.amount} ${market.name} ${isCall ? 'Calls' : 'Puts'} for $${fromBigNumber(
      option.strike().strikePrice,
    )} strike, ${option.board().expiryTimestamp} expiry`,
  )

  // Approve
  await approve(lyra, signer, market, market.quoteToken.address)

  // Prepare Trade
  const trade = await Trade.get(lyra, owner, market.address, option.strike().id, option.isCall, isBuy, size, {
    setToCollateral,
    isBaseCollateral,
    premiumSlippage: SLIPPAGE,
  })

  //console.log('------------------ PREPARED TRADE START ------------------')
  //printObject(trade)
  //console.log('------------------ PREPARED TRADE END ------------------')

  // Check if trade is disabled
  if (trade.disabledReason) {
    console.log('Disabled:', trade.disabledReason)
    return
  }

  const response = await signer.sendTransaction(trade.tx)
  console.log('Executed trade:', response.hash)
  const receipt = await response.wait()
  console.log('tx', receipt.transactionHash)

  try {
    const [tradeEvent] = await TradeEvent.getByHash(lyra, receipt.transactionHash)
    // Get trade result
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
}
