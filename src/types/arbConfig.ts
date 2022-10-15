import { OptionType, Underlying } from './arbs'

export type ArbConfig = {
  markets: Underlying[]
  optionTypes: OptionType[]
  profitThreshold: number
}
