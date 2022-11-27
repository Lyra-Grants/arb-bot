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
  // spot: number
  // pollInterval: number
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

export type DeribitError = {
  message: string
  data?: {
    reason: string
    param: string
  }
  code: number
}

export type DeribitResult = {
  tradeError: boolean
  deribitError: DeribitError | undefined
  deribitTradeResult: DeribitTradeResult | undefined
}

// https://github.com/deribit/deribit-api-clients/blob/7ae49f6c4df5c231ed8b346925ee3539dbde46e9/typescript-node/model/userTrade.ts
export type DeribitTradeResult = {
  trades: [
    {
      underlying_price: number //1161.44
      trade_seq: number // 794
      trade_id: string // 'ETH-153628609'
      timestamp: number // 1669234696195
      tick_direction: TickDirectionEnum // 1
      state: StateEnum // 'filled'
      self_trade: boolean // false
      risk_reducing: boolean // false
      reduce_only: boolean // false
      profit_loss: number // 0
      price: number // 0.0105
      post_only: boolean // false
      order_type: OrderTypeEnum // 'market'
      order_id: string //'ETH-30522648197'
      mmp: boolean //false
      matching_id: string | null // null
      mark_price: number // 0.010259
      liquidity: LiquidityEnum // 'T'
      iv: number // 75.37
      instrument_name: string // 'ETH-2DEC22-1300-C'
      index_price: number // 1165.44
      fee_currency: FeeCurrencyEnum //'ETH'
      fee: number // 0.00027
      direction: DirectionEnum // 'buy'
      api: boolean // true
      amount: number // 1
    },
  ]
  order: {
    web: boolean // false
    time_in_force: TimeInForceEnum // 'good_til_cancelled'
    risk_reducing: boolean // false
    replaced: boolean // false
    reduce_only: boolean // false
    profit_loss: number // 0
    price: number // 0.0455
    post_only: boolean // false
    order_type: OrderTypeEnum // 'market'
    order_state: OrderStateEnum //'filled'
    order_id: string // 'ETH-30522648197'
    mmp: boolean // false
    max_show: number // 1
    last_update_timestamp: number // 1669234696195
    label: string // ''
    is_liquidation: boolean // false
    instrument_name: string // 'ETH-2DEC22-1300-C'
    filled_amount: number // 1
    direction: DirectionEnum // 'buy'
    creation_timestamp: number // 1669234696195
    commission: number // 0.00027
    average_price: number // 0.0105
    api: boolean // true
    amount: number // 1
  }
}

export enum DirectionEnum {
  Buy = 'buy',
  Sell = 'sell',
}

export enum FeeCurrencyEnum {
  BTC = 'BTC',
  ETH = 'ETH',
}

export enum OrderTypeEnum {
  Limit = 'limit',
  Market = 'market',
  Liquidation = 'liquidation',
}

export enum StateEnum {
  Open = 'open',
  Filled = 'filled',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  Untriggered = 'untriggered',
  Archive = 'archive',
}

export enum TickDirectionEnum {
  NUMBER_0 = 0,
  NUMBER_1 = 1,
  NUMBER_2 = 2,
  NUMBER_3 = 3,
}

export enum LiquidityEnum {
  M = 'M',
  T = 'T',
}

export enum TimeInForceEnum {
  GoodTilCancelled = 'good_til_cancelled',
  FillOrKill = 'fill_or_kill',
  ImmediateOrCancel = 'immediate_or_cancel',
}

export enum OrderStateEnum {
  Open = 'open',
  Filled = 'filled',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  Untriggered = 'untriggered',
  Triggered = 'triggered',
}
