import { ethers } from 'ethers'
import { ALCHEMY_ID } from '../secrets'

export const alchemyProvider = new ethers.providers.AlchemyProvider(10, ALCHEMY_ID)
