/* eslint-disable no-var */

declare global {
  var ETH_PRICE: number
  var BTC_PRICE: number
  var BALANCES: { [key: string]: number } = {}
}

declare module '*.json' {
  const value: any
  export default value
}

export {}
