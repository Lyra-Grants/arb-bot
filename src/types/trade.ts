import { ProviderType } from './arbs'

export type TradeResult = {
  isSuccess: boolean
  pricePerOption: number
  failReason: string
  provider: ProviderType
  lyraArgs: LyraResult | undefined
}

export type LyraResult = {
  positionId: number
  premium: number
  fee: number
  trader: string
  collateral: number
  slippage: number
}
