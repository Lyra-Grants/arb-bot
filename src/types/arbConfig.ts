import { OptionType, Underlying } from './arbs'

export type ArbConfig = {
  markets: Underlying[]
  optionTypes: OptionType[]
  profitThreshold: number
  colatPercent: ColatPercent
}

export enum ColatPercent {
  Fifty = 50,
  FiftyFive = 55,
  Sixty = 60,
  SixtyFive = 65,
  Seventy = 70,
  SeventyFive = 75,
  Eighty = 80,
  EightyFive = 85,
  Ninety = 90,
  NinetyFive = 95,
  Hundred = 100,
}
