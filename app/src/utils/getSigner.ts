import { Network } from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import { Wallet } from '../wallets/wallet'
import getLyraSDK from './getLyraSDK'

export default function getSigner(network: Network) {
  const lyra = getLyraSDK(network)
  const signer = new ethers.Wallet(Wallet().privateKey, lyra.provider)
  return signer
}
