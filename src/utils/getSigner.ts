import { ethers } from 'ethers'
import { Wallet } from '../wallets/wallet'
import getLyra from './getLyra'

export default function getSigner() {
  const lyra = getLyra()
  const signer = new ethers.Wallet(Wallet().privateKey, lyra.provider)
  return signer
}
