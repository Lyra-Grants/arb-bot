import { Provider } from '@ethersproject/providers'
import { ERC20__factory } from '@lyrafinance/lyra-js'
import { BigNumber, ethers } from 'ethers'
import { TOKENS } from '../constants/token'
import fromBigNumber from '../utils/fromBigNumber'

export const getBalance = async (address: string, provider: Provider) => {
  const balance = await provider.getBalance(address)
  const balanceInEth = fromBigNumber(balance)
  return balanceInEth
}

export const getTokenBalance = async (address: string, provider: Provider, signer: ethers.Wallet) => {
  const decimals = TOKENS[address][2] as number
  const contract = new ethers.Contract(address, ERC20__factory.abi, provider)
  const bgBalance = (await contract.balanceOf(signer.address)) as unknown as BigNumber
  const balance = fromBigNumber(bgBalance, decimals)
  return balance
}
