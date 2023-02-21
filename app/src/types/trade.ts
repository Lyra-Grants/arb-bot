import { ProviderType } from './arbs'
import { DeribitTradeResult } from './lyra'

export type TradeResult = {
  isSuccess: boolean
  pricePerOption: number
  failReason: string
  provider: ProviderType
  lyraResult: LyraResult | undefined
  deribitResult: DeribitTradeResult | undefined
}

export type LyraResult = {
  iv: number
  positionId: number
  premium: number
  fee: number
  trader: string
  collateral: number
  slippage: number
}
