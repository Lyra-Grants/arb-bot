import { Chain } from '../constants/chain'
import { Network } from '../constants/network'

export default function getLyraNetworkForChain(chain: Chain | 'ethereum'): Network {
  switch (chain) {
    case Chain.Arbitrum:
    case Chain.ArbitrumGoerli:
      return Network.Arbitrum
    case 'ethereum':
    case Chain.Optimism:
    case Chain.OptimismGoerli:
      return Network.Optimism
  }
}
