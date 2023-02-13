import { ArbDto } from '../types/lyra'
import { ProviderType } from '../types/arbs'
import { BuySellSymbol, FN, FormattedDateShort, YesNoSymbol } from './common'
import { StatSymbol } from './common'
import { Strategy } from '../types/arbConfig'
import { REPORT_ONLY } from '../secrets'

export function ArbTelegram(dto: ArbDto, strategy: Strategy, spot: number, firstRun: boolean) {
  const post: string[] = []
  if (firstRun) {
    post.push(`<strong>📍 Polling for Arbs!</strong>\n\n`)
    post.push(`<strong>Strategy</strong>:\n`)
  }

  post.push(`${StatSymbol(dto.market)} <i>Market:</i> <strong>${dto.market.toUpperCase()}</strong>\n`)
  post.push(`🏦 <i>Provider:</i> <strong>Lyra | Deribit</strong>\n`)
  post.push(`📈 <i>Option Types:</i> <strong>${strategy.optionTypes.join(', ')}</strong>\n`)
  post.push(`💵 <i>Profit Threshold:</i> <strong>$${strategy.profitThreshold}</strong>\n`)
  post.push(`☄️ <i>Min APY:</i> <strong>${strategy.minAPY}%</strong>\n`)
  post.push(`✅ <i>Sell Lyra Only:</i> <strong>${strategy.sellLyraOnly}</strong>\n`)
  post.push(`💫 <i>Spot Strike Diff:</i> <strong>$${strategy.spotStrikeDiff}</strong>\n\n`)

  if (!REPORT_ONLY) {
    post.push(`<strong>Execution Settings</strong>:\n`)
    post.push(`🧮 <i>Trade Size:</i> <strong>${strategy.tradeSize}</strong>\n`)
    post.push(`🫙 <i>Lyra Colat Perc:</i> <strong>${strategy.colatPercent}%</strong>\n`)
    post.push(`🏷️ <i>Buy First?:</i> <strong>${strategy.isBuyFirst}</strong>\n`)
    post.push(`🤑 <i>Most Profitable Only?</i> <strong>${strategy.mostProfitableOnly}</strong>\n\n`)
  }

  post.push(`<strong>${dto.market.toUpperCase()} Spot Price</strong>\n$${spot}\n\n`)

  if (!firstRun) {
    post.push(`<strong>Arbs</strong>\n`)
    if (dto.arbs.length == 0) {
      post.push(`${YesNoSymbol(dto.arbs.length > 0)}No arb opportunities found for strategy.`)
    } else {
      dto.arbs.map((arb) => {
        post.push(
          `<strong>$${FN(arb.strike, 0)} ${FormattedDateShort(new Date(arb.expiration))} ${arb.type}</strong>\n`,
        )
        post.push(
          `${BuySellSymbol(true)} Buy $${FN(arb.buy.askPrice as number, 2)} ${
            arb.buy.provider === ProviderType.DERIBIT ? 'DB' : 'LY'
          }\n`,
        )
        post.push(
          `${BuySellSymbol(false)} Sell $${FN(arb.sell.bidPrice as number, 2)} ${
            arb.sell.provider === ProviderType.DERIBIT ? 'DB' : 'LY'
          }\n`,
        )
        post.push(`Discount $${FN(arb.amount, 2)} (${FN(arb.discount, 2)}%)\n`)
        post.push(`APY ${FN(arb.apy, 2)}%\n\n`)
      })
    }
  }

  return post.join('')
}
