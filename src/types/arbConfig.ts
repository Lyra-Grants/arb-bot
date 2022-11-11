import { OptionType, Underlying } from './arbs'

export type ArbConfig = {
  reportOnly: boolean
  pollingInterval: number
  strategy: Strategy[]
}

export type Strategy = {
  market: Underlying
  optionTypes: OptionType[]
  maxCollat: number
  defaultTradeSize: number
  minTradeSize: number
  maxTradeSize: number
  colatPercent: number
  isBuyFirst: boolean
  profitThreshold: number
  minAPY: number
}
