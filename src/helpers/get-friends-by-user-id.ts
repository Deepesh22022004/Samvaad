import { db } from '@/lib/db'
import { fetchRedis } from './redis'
import {v4 as uuid} from 'uuid'

export const getFriendsByUserId = async (userId: string) => {
  
  const friendIds = (await db.smembers(`user:${userId}:friends`)) as string []



  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = await fetchRedis('get', `user:${friendId}`) as string
      const parsedFriend = JSON.parse(friend) as User
      return parsedFriend
    })
  )

  return friends
};

