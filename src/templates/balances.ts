export function BalancesTelegram(balances: { [key: string]: number }) {
  const post: string[] = []
  post.push('<strong>Web3 Balances</strong>\n')

  Object.values(balances).map((balance, index) => {
    post.push(`${Object.keys(balances)[index]}: ${balance}\n`)
  })

  return post.join('')
}
