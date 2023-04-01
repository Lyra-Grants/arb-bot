import { Telegraf } from 'telegraf'
import { TELEGRAM_ACCESS_TOKEN } from '../config'

export const TelegramClient = new Telegraf(TELEGRAM_ACCESS_TOKEN)
