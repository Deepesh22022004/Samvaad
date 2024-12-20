import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { email: emailToAdd } = addFriendValidator.parse(body.email)

        const idToAdd = (await fetchRedis(
            'get' ,
             `user:email:${emailToAdd}`
            )) as string

        if(!idToAdd){
            return new Response('This Person does not exist.',{status:400})
        }

        const session = await getServerSession(authOptions)

        if(!session){
            return new Response('Unauthorized' , {status: 401})
        }

        if(idToAdd === session.user.id){
            return new Response("You cannot add yourself as a friend" , {status:400})
        }

        // check if user already added
        const isAlreadyAdded = await fetchRedis(
            'sismember' ,
            `user:${idToAdd}:incoming_friend_requests`, 
            session.user.id
        ) as 0 | 1


         if(isAlreadyAdded){
            return new Response('Already added this user', {status : 400})
         }

        const isAlreadyFriends = await (db.sismember(`user:${session.user.id}:friends` , idToAdd))

         if(isAlreadyFriends){
            return new Response('This user is already your Friend', {status : 400})
         }
        //valid request
         pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests',
                {
                    senderId : session.user.id,
                    senderEmail : session.user.email,
                }
         )

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
    
    } catch (error) {
        if(error instanceof z.ZodError){
            return new Response('Invaid request payload',{status :400})
        }

        return new Response('Invaid request',{status :400})
    }
}