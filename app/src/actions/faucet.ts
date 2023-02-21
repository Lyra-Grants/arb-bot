import Lyra from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import fromBigNumber from '../utils/fromBigNumber'

export default async function faucet(lyra: Lyra, signer: ethers.Wallet) {
  const preAccount = lyra.account(signer.address)
  const balances = await preAccount.balances()
  if (
    balances.find((x) => x.baseAsset.symbol == 'sETH')?.baseAsset.balance.isZero() ||
    balances.every((stableToken) => stableToken.baseAsset.balance.isZero())
  ) {
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
  const sETH = newBalances.find((x) => x.baseAsset.symbol == 'sETH')?.baseAsset?.balance

  console.log('balances', {
    newBalances: newBalances,
    base: sETH ? fromBigNumber(sETH) : undefined,
  })
}
