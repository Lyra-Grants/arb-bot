import * as dotenv from 'dotenv'
import * as _ from 'lodash'
import { convertToBoolean } from '../utils/utils'

dotenv.config({ path: '.env' })

export const ALCHEMY_ID = _.defaultTo(process.env.ALCHEMY_ID, '')
export const REPORT_ONLY: boolean = _.defaultTo(convertToBoolean(process.env.REPORT_ONLY as string), true) as boolean

export const WALLET_ADDRESS = _.defaultTo(process.env.WALLET_ADDRESS, '')
export const PRIVATE_KEY = _.defaultTo(process.env.PRIVATE_KEY, '')
export const PUBLIC_KEY = _.defaultTo(process.env.PUBLIC_KEY, '')

export const DERIBIT_TESTNET: boolean = _.defaultTo(
  convertToBoolean(process.env.DERIBIT_TESTNET as string),
  true,
) as boolean

export const DERIBIT_CLIENT_ID = _.defaultTo(process.env.DERIBIT_CLIENT_ID, '')
export const DERIBIT_CLIENT_SECRET = _.defaultTo(process.env.DERIBIT_CLIENT_SECRET, '')
export const DERIBIT_TESTNET_CLIENT_ID = _.defaultTo(process.env.DERIBIT_TESTNET_CLIENT_ID, '')
export const DERIBIT_TESTNET_CLIENT_SECRET = _.defaultTo(process.env.DERIBIT_TESTNET_CLIENT_SECRET, '')

//TELEGRAM ADDRESS TO REPORT TO
export const TELEGRAM_ACCESS_TOKEN = _.defaultTo(process.env.TELEGRAM_ACCESS_TOKEN, '')
export const TELEGRAM_CHANNEL = _.defaultTo(process.env.TELEGRAM_CHANNEL, '')
