import { Instrument, OptionType, Underlying } from './arbs'

export type Arb = {
  apy: number
  discount: number
  term: string
  strike: number
  amount: number
  expiration: number
  type: OptionType
  buy: Instrument
  sell: Instrument
}

export type ArbDto = {
  arbs: Arb[]
  market: Underlying
}

export type LyraTradeArgs = {
  size: number
  market: Underlying
  call: boolean
  buy: boolean
  strike: number
  collat: number
  base: boolean
  stable: string
}

export type DeribitTradeArgs = {
  amount: number
  instrumentName: string
  buy: boolean
}
