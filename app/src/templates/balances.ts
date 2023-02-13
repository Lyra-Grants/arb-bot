import { FN } from './common'

export function BalancesTelegram(balances: { [key: string]: number }) {
  const post: string[] = []
  post.push('<strong>Balances:</strong>\n')

  Object.values(balances).map((balance, index) => {
    if (balance > 0) {
      post.push(`${Object.keys(balances)[index]}: <strong>${FN(balance, 4)}</strong>\n`)
    }
  })

  return post.join('')
}
