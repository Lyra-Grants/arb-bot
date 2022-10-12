import { BigNumber, BigNumberish, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
export const DECIMALS_UNDERLYING = 8

export function fixedFromBigNumber(bn: BigNumber) {
  return bn.abs().shl(64).mul(bn.abs().div(bn))
}

export function fixedFromFloat(float: BigNumberish) {
  const [integer = '', decimal = ''] = float.toString().split('.')
  return fixedFromBigNumber(ethers.BigNumber.from(`${integer}${decimal}`)).div(
    ethers.BigNumber.from(`1${'0'.repeat(decimal.length)}`),
  )
}

export function fixedToNumber(fixed: BigNumber) {
  const isNeg = fixed.lt(0)
  if (isNeg) {
    fixed = fixed.mul(-1)
  }
  const integer = fixed.shr(64)
  const decimals = fixed.sub(integer.shl(64))

  const decimalsNumber = decimals.mul(1e10).div(BigNumber.from(1).shl(64))

  const result = Number(integer) + Number(decimalsNumber) / 1e10
  return isNeg ? -result : result
}

export function fixedToBn(bn64x64: BigNumber, decimals = 18): BigNumber {
  return bn64x64.mul(BigNumber.from(10).pow(decimals)).shr(64)
}

export function parseUnderlying(amount: string) {
  return parseUnits(Number(amount).toFixed(DECIMALS_UNDERLYING), DECIMALS_UNDERLYING)
}
