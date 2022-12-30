import { ethers } from 'ethers'
import { wallet } from '../types/wallet'
import { PRIVATE_KEY, PUBLIC_KEY, WALLET_ADDRESS } from '../secrets'

export function Generate(): wallet {
  const wallet = ethers.Wallet.createRandom({ extraEntropy: '' })
  const key = wallet._signingKey()
  return { address: wallet.address, privateKey: key.privateKey, publicKey: key.publicKey }
}

export function Wallet(): wallet {
  const wallet: wallet = {
    address: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY,
    publicKey: PUBLIC_KEY,
  }
  return wallet
}
