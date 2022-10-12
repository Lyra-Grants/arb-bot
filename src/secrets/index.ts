import * as dotenv from 'dotenv'
import * as _ from 'lodash'
import { convertToBoolean } from '../utils/utils'

dotenv.config({ path: '.env' })

export const INFURA_ID = _.defaultTo(process.env.INFURA_ID, '')
export const INFURA_ID_OPTIMISM = _.defaultTo(process.env.INFURA_ID_OPTIMISM, '')
export const TESTNET: boolean = _.defaultTo(convertToBoolean(process.env.TESTNET as string), true) as boolean
export const ENTROPY = _.defaultTo(process.env.ENTROPY, '')

export const TEST_WALLET_ADDRESS = _.defaultTo(process.env.TEST_WALLET_ADDRESS, '')
export const TEST_PRIVATE_KEY = _.defaultTo(process.env.TEST_PRIVATE_KEY, '')
export const TEST_PUBLIC_KEY = _.defaultTo(process.env.TEST_PUBLIC_KEY, '')
