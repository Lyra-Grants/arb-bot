import { ArbDto } from '../types/lyra'
import { ProviderType } from '../types/arbs'
import { FN, FormattedDateShort } from './common'
import { StatSymbol } from './stats'

export function ArbTelegram(dto: ArbDto) {
  const post: string[] = []
  post.push(`${StatSymbol(dto.market)} $${dto.market.toUpperCase()} Arbs Deribit | Lyra\n\n`)
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
  return post.join('')
}
