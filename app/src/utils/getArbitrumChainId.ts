import { Chain } from '@lyrafinance/lyra-js'
import getNetworkConfig from './getNetworkConfig'

export default function getArbitrumChainId(): number {
  return getNetworkConfig(Chain.Arbitrum).chainId
}
