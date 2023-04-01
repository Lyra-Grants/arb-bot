import { Chain, Network } from '@lyrafinance/lyra-js'
import {
  ALCHEMY_PROJECT_ID_ARBITRUM,
  ALCHEMY_PROJECT_ID_ARBITRUM_TESTNET,
  ALCHEMY_PROJECT_ID_OPTIMISM,
  ALCHEMY_PROJECT_ID_OPTIMISM_TESTNET,
} from '../config'

export enum WalletType {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  CoinbaseWallet = 'CoinbaseWallet',
  GnosisSafe = 'GnosisSafe',
}

export type NetworkConfig = {
  name: string
  shortName: string
  chainId: number
  network: Network
  walletRpcUrl: string
  readRpcUrls: string[]
  blockExplorerUrl: string
  iconUrls: string[]
}

export const NETWORK_CONFIGS: Record<Chain, NetworkConfig> = {
  [Chain.Optimism]: {
    name: 'Optimistic Ethereum',
    shortName: 'Optimism',
    chainId: 10,
    network: Network.Optimism,
    walletRpcUrl: 'https://mainnet.optimism.io',
    readRpcUrls: [`https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID_OPTIMISM}`],
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
  },
  [Chain.OptimismGoerli]: {
    name: 'Optimistic Ethereum (Goerli)',
    shortName: 'Optimistic Goerli',
    chainId: 420,
    network: Network.Optimism,
    walletRpcUrl: 'https://goerli.optimism.io',
    readRpcUrls: [`https://opt-goerli.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID_OPTIMISM_TESTNET}`],
    blockExplorerUrl: 'https://goerli-optimism.etherscan.io/',
    iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
  },
  [Chain.Arbitrum]: {
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    chainId: 42161,
    network: Network.Arbitrum,
    walletRpcUrl: 'https://arb1.arbitrum.io/rpc',
    readRpcUrls: [`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID_ARBITRUM}`],
    blockExplorerUrl: 'https://arbiscan.io/',
    iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
  },
  [Chain.ArbitrumGoerli]: {
    name: 'Arbitrum Nitro Goerli Rollup Testnet',
    shortName: 'Arbitrum Goerli',
    chainId: 421613,
    network: Network.Arbitrum,
    walletRpcUrl: 'https://goerli-rollup.arbitrum.io/rpc',
    readRpcUrls: [`https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID_ARBITRUM_TESTNET}`],
    blockExplorerUrl: 'https://goerli.arbiscan.io/',
    iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
  },
}
