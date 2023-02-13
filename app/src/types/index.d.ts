/* eslint-disable no-var */

declare global {
  var ETH_PRICE_ARB: number
  var BTC_PRICE_ARB: number
  var ETH_PRICE_OPT: number
  var BTC_PRICE_OPT: number
  var BALANCES: { [key: string]: number } = {}
}

declare module '*.json' {
  const value: any
  export default value
}

export {}
