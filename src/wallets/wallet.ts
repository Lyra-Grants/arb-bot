import { ethers } from 'ethers'
import { wallet } from '../types/wallet'
import { ENTROPY, TEST_PRIVATE_KEY, TEST_PUBLIC_KEY, TEST_WALLET_ADDRESS } from '../secrets'

export function Generate(): wallet {
  const wallet = ethers.Wallet.createRandom({ extraEntropy: '' })
  const key = wallet._signingKey()
  return { address: wallet.address, privateKey: key.privateKey, publicKey: key.publicKey }
}

export function TestWallet(): wallet {
  const wallet: wallet = {
    address: TEST_WALLET_ADDRESS,
    privateKey: TEST_PRIVATE_KEY,
    publicKey: TEST_PUBLIC_KEY,
  }
  return wallet
}
