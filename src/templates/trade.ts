import { Arb } from '../types/lyra'
import { BuySellSymbol, FN, FormattedDateShort } from './common'
import { Strategy } from '../types/arbConfig'
import { TradeResult } from '../types/trade'

export function TradeTelegram(arb: Arb, tradeResult: TradeResult, strategy: Strategy, size: number, isBuy: boolean) {
  const post: string[] = []
  post.push(`${BuySellSymbol(isBuy)} ${isBuy ? 'Buy' : 'Sell'} $${strategy.market.toUpperCase()}\n`)
  post.push(`<i>Size:</i> ${size}\n`)
  post.push(`<i>Strike:</i> $${FN(arb.strike, 0)}\n`)
  post.push(`<i>Exp:</i> $${FormattedDateShort(new Date(arb.expiration))}\n`)
  post.push(`<i>Type:</i> ${arb.type}\n\n`)
  post.push(`<i>Success?:</i> ${tradeResult.isSuccess}\n`)
  post.push(`<i>Provider:</i> ${tradeResult.provider}\n`)
  post.push(`<i>Price Per Option:</i> ${tradeResult.pricePerOption}\n`)
  if (!tradeResult.isSuccess) {
    post.push(`<i>Fail Reason:</i> ${tradeResult.failReason}\n`)
  }
  return post.join('')
}
