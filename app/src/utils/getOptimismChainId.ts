import { Chain } from '@lyrafinance/lyra-js'
import getNetworkConfig from './getNetworkConfig'

export default function getOptimismChainId(): number {
  return getNetworkConfig(Chain.Optimism).chainId
}
