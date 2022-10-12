import { OptionType } from 'dayjs'
import { EventType } from '../constants/eventType'
import { Instrument } from './arbs'

export type BaseEvent = {
  eventType: EventType
}

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

export type ArbDto = BaseEvent & {
  arbs: Arb[]
  market: string
  isBtc: boolean
}
