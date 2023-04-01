import { TESTNET, TWITTER_ENABLED } from '../config'
import getTwitter from '../utils/getTwitter'

export async function SendTweet(tweet: string) {
  if (TESTNET) {
    console.log(tweet)
  } else {
    if (TWITTER_ENABLED) {
      try {
        const twitterApi = getTwitter
        twitterApi.readWrite

        const response = await twitterApi.v1.tweet(tweet)
        console.log(response.id)
      } catch (e: any) {
        console.log(e)
      }
    }
  }
}
