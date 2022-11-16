import { Arb } from '../types/lyra'
import { BuySellSymbol, FN, FormattedDateShort } from './common'
import { Strategy } from '../types/arbConfig'
import { TradeResult } from '../types/trade'

export function TradeTelegram(arb: Arb, tradeResult: TradeResult, strategy: Strategy, size: number, isBuy: boolean) {
  const post: string[] = []
  post.push(`${BuySellSymbol(isBuy)} ${isBuy ? 'Buy' : 'Sell'} $${strategy.market.toUpperCase()}\n`)
  post.push(`Size: ${size} options\n`)
  post.push(`$${FN(arb.strike, 0)} ${FormattedDateShort(new Date(arb.expiration))} ${arb.type}\n`)
  post.push(`Provider: ${tradeResult.provider}\n`)
  post.push(`Price Per Option: ${tradeResult.pricePerOption}\n\n`)
  post.push(`Success?: ${tradeResult.isSuccess}\n`)
  if (!tradeResult.isSuccess) {
    post.push(`Fail Reason: ${tradeResult.failReason}\n`)
  }
  return post.join('')
}
