import { OptionType, Underlying } from './arbs'

export type ArbConfig = {
  pollingInterval: number
  strategy: Strategy[]
}

export type Strategy = {
  market: Underlying
  optionTypes: OptionType[]
  maxCollat: number
  tradeSize: number
  colatPercent: number
  isBuyFirst: boolean
  profitThreshold: number
  minAPY: number
  sellLyraOnly: boolean
  spotStrikeDiff: number
  mostProfitableOnly: true
}
