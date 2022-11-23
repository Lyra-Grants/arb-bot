import { Arb } from '../types/lyra'
import { BuySellSymbol, FN, FormattedDateShort, YesNoSymbol } from './common'
import { Strategy } from '../types/arbConfig'
import { TradeResult } from '../types/trade'

export function TradeTelegram(arb: Arb, tradeResult: TradeResult, strategy: Strategy, size: number, isBuy: boolean) {
  const post: string[] = []
  post.push(`strong>Trade Executed!</strong>\n`)
  post.push(
    `${BuySellSymbol(isBuy)} <i>${isBuy ? 'Buy' : 'Sell'}:</i> <strong>$${strategy.market.toUpperCase()}</strong>\n`,
  )
  post.push(`🧮 <i>Size:</i> <strong>${size} options</strong>\n`)
  post.push(`🎯 <i>Strike:</i> <strong>$${FN(arb.strike, 0)}</strong>\n`)
  post.push(`📈 <i>Option Type:</i> <strong>${arb.type}</strong>`)
  post.push(`📅 <i>Expiry:</i> <strong>${FormattedDateShort(new Date(arb.expiration))}</strong>`)
  post.push(`🏦 <i>Provider:</i> <strong>${tradeResult.provider}</strong>\n`)
  post.push(`🏷️ <i>Price Per Option:</i> <strong>${tradeResult.pricePerOption}</strong>\n\n`)
  post.push(`${YesNoSymbol(tradeResult.isSuccess)} <i>Success?:</i> <strong>${tradeResult.isSuccess}</strong>\n`)
  if (!tradeResult.isSuccess) {
    post.push(`😭 <i>Fail Reason:<i> <strong>${tradeResult.failReason}<strong>\n`)
  }
  return post.join('')
}
