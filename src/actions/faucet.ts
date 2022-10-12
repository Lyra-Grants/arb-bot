import Lyra from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import fromBigNumber from '../utils/fromBigNumber'
import { TestWallet } from '../wallets/wallet'

export default async function faucet(lyra: Lyra, signer: ethers.Wallet) {
  const preAccount = lyra.account(signer.address)
  const balances = await preAccount.balances()
  if (balances.base('sETH').balance.isZero() || balances.stables.every((stableToken) => stableToken.balance.isZero())) {
    console.log('minting...', signer.address)
    const tx = await lyra.drip(signer.address)
    if (!tx) {
      throw new Error('Tx rejected')
    }
    const res = await signer.sendTransaction(tx)
    console.log('tx', res.hash)
    await res.wait()
    console.log('minted', signer.address)
  } else {
    console.log('already minted', signer.address)
  }
  const newBalances = await lyra.account(signer.address).balances()
  console.log('balances', {
    quote: newBalances.stables,
    base: fromBigNumber(newBalances.base('sETH').balance),
  })
}
