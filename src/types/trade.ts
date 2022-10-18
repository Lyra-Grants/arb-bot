import { ProviderType } from './arbs'

export type TradeResult = {
  isSuccess: boolean
  pricePerOption: number
  failReason: string
  provider: ProviderType
}
