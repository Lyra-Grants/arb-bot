import * as dotenv from 'dotenv'
import * as _ from 'lodash'
import { convertToBoolean } from '../utils/utils'

dotenv.config({ path: '.env' })
export const TESTNET: boolean = _.defaultTo(convertToBoolean(process.env.TESTNET as string), true) as boolean
export const REPORT_ONLY: boolean = _.defaultTo(convertToBoolean(process.env.REPORT_ONLY as string), true) as boolean

export const ALCHEMY_PROJECT_ID_OPTIMISM = _.defaultTo(process.env.ALCHEMY_PROJECT_ID_OPTIMISM, '')
export const ALCHEMY_PROJECT_ID_ARBITRUM = _.defaultTo(process.env.ALCHEMY_PROJECT_ID_ARBITRUM, '')
export const ALCHEMY_PROJECT_ID_OPTIMISM_TESTNET = _.defaultTo(process.env.ALCHEMY_PROJECT_ID_OPTIMISM_TESTNET, '')
export const ALCHEMY_PROJECT_ID_ARBITRUM_TESTNET = _.defaultTo(process.env.ALCHEMY_PROJECT_ID_ARBITRUM_TESTNET, '')
export const ALCHEMY_PROJECT_ID_MAINNET = _.defaultTo(process.env.ALCHEMY_PROJECT_ID_MAINNET, '')

export const LOG_TOKEN = _.defaultTo(process.env.LOG_TOKEN, '')
export const LOG_CHANNEL = _.defaultTo(process.env.LOG_CHANNEL, '')

export const WALLET_ADDRESS = _.defaultTo(process.env.WALLET_ADDRESS, '')
export const PRIVATE_KEY = _.defaultTo(process.env.PRIVATE_KEY, '')
export const PUBLIC_KEY = _.defaultTo(process.env.PUBLIC_KEY, '')

export const DERIBIT_TESTNET: boolean = _.defaultTo(
  convertToBoolean(process.env.DERIBIT_TESTNET as string),
  true,
) as boolean

export const TWITTER_ENABLED: boolean = _.defaultTo(
  convertToBoolean(process.env.TWITTER_ENABLED as string),
  false,
) as boolean

export const DERIBIT_CLIENT_ID = _.defaultTo(process.env.DERIBIT_CLIENT_ID, '')
export const DERIBIT_CLIENT_SECRET = _.defaultTo(process.env.DERIBIT_CLIENT_SECRET, '')
export const DERIBIT_TESTNET_CLIENT_ID = _.defaultTo(process.env.DERIBIT_TESTNET_CLIENT_ID, '')
export const DERIBIT_TESTNET_CLIENT_SECRET = _.defaultTo(process.env.DERIBIT_TESTNET_CLIENT_SECRET, '')

//TELEGRAM ADDRESS TO REPORT TO
export const TELEGRAM_ACCESS_TOKEN = _.defaultTo(process.env.TELEGRAM_ACCESS_TOKEN, '')
export const TELEGRAM_CHANNEL = _.defaultTo(process.env.TELEGRAM_CHANNEL, '')

export const TWITTER_APP_KEY = _.defaultTo(process.env.TWITTER_APP_KEY, '')
export const TWITTER_APP_SECRET = _.defaultTo(process.env.TWITTER_APP_SECRET, '')
export const TWITTER_ACCESS_TOKEN = _.defaultTo(process.env.TWITTER_ACCESS_TOKEN, '')
export const TWITTER_ACCESS_SECRET = _.defaultTo(process.env.TWITTER_ACCESS_SECRET, '')
