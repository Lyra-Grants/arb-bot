import { ArbDto } from '../types/lyra'
import { ProviderType } from '../types/arbs'
import { FN, FormattedDateShort } from './common'
import { StatSymbol } from './stats'
import { Strategy } from '../types/arbConfig'

export function ArbTelegram(dto: ArbDto, strategy: Strategy) {
  const post: string[] = []
  post.push(`${StatSymbol(dto.market)} $${dto.market.toUpperCase()} Arbs Deribit | Lyra\n\n`)
  post.push(`<strong>Strategy</strong>:\n`)
  post.push(`<i>Options:</i> ${strategy.optionTypes.join(', ')}\n`)
  post.push(`<i>Colat Perc:</i> ${strategy.colatPercent}\n`)
  post.push(`<i>Buy First?:</i> ${strategy.isBuyFirst}\n`)
  post.push(`<i>Profit Threshold:</i> ${strategy.profitThreshold}\n`)
  post.push(`<i>Min APY:</i> ${strategy.minAPY}\n`)
  post.push(`<i>Sell Lyra Only:</i> ${strategy.sellLyraOnly}\n`)
  post.push(`<i>Spot Strike Diff:</i> ${strategy.spotStrikeDiff}\n\n`)
  post.push(`<strong>Spot Price:</strong>\n $${dto.spot}\n\n`)
  post.push(`<strong>Arbs</strong>\n`)

  if (dto.arbs.length == 0) {
    post.push('No arb opportunities found for strategy.')
  } else {
    dto.arbs.slice(0, 10).map((arb) => {
      post.push(`<strong>$${FN(arb.strike, 0)} ${FormattedDateShort(new Date(arb.expiration))} ${arb.type}</strong>\n`)
      post.push(
        `🔹 Buy $${FN(arb.buy.askPrice as number, 2)} ${arb.buy.provider === ProviderType.DERIBIT ? 'DB' : 'LY'}\n`,
      )
      post.push(
        `🔸 Sell $${FN(arb.sell.bidPrice as number, 2)} ${arb.sell.provider === ProviderType.DERIBIT ? 'DB' : 'LY'}\n`,
      )
      post.push(`Discount $${FN(arb.amount, 2)} (${FN(arb.discount, 2)}%)\n`)
      post.push(`APY ${FN(arb.apy, 2)}%\n\n`)
    })
  }
  return post.join('')
}
