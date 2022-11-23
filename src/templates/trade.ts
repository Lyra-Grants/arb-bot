import { Arb } from '../types/lyra'
import { BuySellSymbol, FN, FormattedDateShort, PositionLink, YesNoSymbol } from './common'
import { Strategy } from '../types/arbConfig'
import { TradeResult } from '../types/trade'
import { ProviderType, Underlying } from '../types/arbs'
import { PostTelegram } from '../integrations/telegram'

export function TradeTelegram(arb: Arb, tradeResult: TradeResult, strategy: Strategy, size: number, isBuy: boolean) {
  const post: string[] = []
  post.push(`<strong>Trade Executed!</strong>\n`)
  post.push(
    `${BuySellSymbol(isBuy)} <i>${isBuy ? 'Buy' : 'Sell'}:</i> <strong>$${strategy.market.toUpperCase()}</strong>\n`,
  )
  post.push(`🧮 <i>Size:</i> <strong>${size} options</strong>\n`)
  post.push(`🎯 <i>Strike:</i> <strong>$${FN(arb.strike, 0)}</strong>\n`)
  post.push(`📈 <i>Option Type:</i> <strong>${arb.type}</strong>\n`)
  post.push(`📅 <i>Expiry:</i> <strong>${FormattedDateShort(new Date(arb.expiration))}</strong>\n`)
  post.push(`🏦 <i>Provider:</i> <strong>${tradeResult.provider}</strong>\n`)

  post.push(`\n${YesNoSymbol(tradeResult.isSuccess)} <i>Success?:</i> <strong>${tradeResult.isSuccess}</strong>\n`)

  if (!tradeResult.isSuccess) {
    post.push(`😭 <i>Fail Reason:<i> <strong>${tradeResult.failReason}<strong>\n`)
  }

  if (tradeResult.provider === ProviderType.LYRA) {
    if (tradeResult.lyraArgs) {
      post.push(`\n<strong>LYRA Trade Details:</strong>\n`)
      if (tradeResult.pricePerOption > 0) {
        post.push(`<i>Price Per Option:</i> <strong>$${FN(tradeResult.pricePerOption, 2)}</strong>\n`)
      }
      if (tradeResult?.lyraArgs?.collateral > 0) {
        post.push(`<i>Collateral Value:</i> <strong>$${FN(tradeResult.lyraArgs?.collateral, 2)}</strong>\n`)
      }
      post.push(`<i>Premium:</i> <strong>$${FN(tradeResult.lyraArgs.premium, 2)}</strong>\n`)
      post.push(`<i>Fee:</i> <strong>$${FN(tradeResult.lyraArgs.fee, 2)}</strong>\n`)
      // post.push(`<i>Trader:</i> <strong>${tradeResult.lyraArgs.trader}</strong>\n`)
      post.push(`<i>Slippage:</i> <strong>${FN(tradeResult.lyraArgs.slippage, 2)}%</strong>\n`)
      post.push(
        `<a href="${PositionLink(
          strategy.market,
          tradeResult.lyraArgs.trader,
          tradeResult.lyraArgs.positionId,
        )}">View Position</a>\n`,
      )
    }
  }
  return post.join('')
}
