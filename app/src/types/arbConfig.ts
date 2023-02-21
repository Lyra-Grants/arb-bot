import { Network } from '@lyrafinance/lyra-js'
import { OptionType, Underlying } from './arbs'

export type ArbConfig = {
  pollingInterval: number
  strategy: Strategy[]
}

export type Strategy = {
  networks: Network[]
  market: Underlying
  optionTypes: OptionType[]
  tradeSize: number
  colatPercent: number
  isBuyFirst: boolean
  profitThreshold: number
  minAPY: number
  sellLyraOnly: boolean
  spotStrikeDiff: number
  mostProfitableOnly: true
}
