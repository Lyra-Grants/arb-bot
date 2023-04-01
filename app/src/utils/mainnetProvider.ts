import { JsonRpcProvider } from '@ethersproject/providers'
import { ALCHEMY_PROJECT_ID_MAINNET } from '../config'
import CachedStaticJsonRpcProvider from './CachedStaticJsonRpcProvider'

export const MAINNET_NETWORK_CONFIG = {
  name: 'Mainnet',
  shortName: 'Mainnet',
  chainId: 1,
  network: 'ethereum',
  walletRpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID_MAINNET}`,
  readRpcUrls: [`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID_MAINNET}`],
  blockExplorerUrl: 'https://etherscan.io/',
  iconUrls: [],
}

const mainnetProvider = new CachedStaticJsonRpcProvider(
  MAINNET_NETWORK_CONFIG.readRpcUrls,
  MAINNET_NETWORK_CONFIG.chainId,
)

export default mainnetProvider
