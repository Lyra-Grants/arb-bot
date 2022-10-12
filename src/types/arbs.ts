export enum BuySellModes {
  BUY = 'Buy',
  SELL = 'Sell',
}

export const DealsFields: Record<BuySellModes, 'askPrice' | 'bidPrice'> = {
  [BuySellModes.BUY]: 'askPrice',
  [BuySellModes.SELL]: 'bidPrice',
}

export enum ProviderType {
  LYRA = 'LYRA',
  DERIBIT = 'DERIBIT',
  PREMIA = 'PREMIA',
  HEGIC = 'HEGIC',
}

export enum OptionType {
  CALL = 'CALL',
  PUT = 'PUT',
}

export type InstrumentMeta = {
  provider: ProviderType
  expiration: number
  term: string
  strike: number
}

export type Instrument = {
  type: OptionType
  askPrice?: number
  bidPrice?: number
  midPrice?: number
} & InstrumentMeta

export type CallOption = Instrument & { type: OptionType.CALL }
export type PutOption = Instrument & { type: OptionType.PUT }

export type InstrumentCouple = {
  [OptionType.CALL]?: CallOption
  [OptionType.PUT]?: PutOption
}

export type OptionsMap = InstrumentMeta & InstrumentCouple

export enum Underlying {
  ETH = 'ETH',
  BTC = 'BTC',
}

export type DealPart = { price: number; provider: ProviderType }
export type Deal = Pick<OptionsMap, 'term' | 'strike'> & {
  amount: number
  expiration: number
  type: OptionType
  buy: Instrument
  sell: Instrument
}

export type ActivePosition = {
  id: number
  strike: number
  size: number
  expiration: number
  isOpen: boolean
  isCall: boolean
  isLong: boolean
  isSettled: boolean
  numTrades: number
  avgCostPerOption: number
  pricePerOption: number
  realizedPnl: number
  realizedPnlPercent: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  collateral?: number
  isBaseCollateral?: boolean
}
