

import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/messages'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Messages from '@/components/Messages'
import ChatInput from '@/components/ChatInput'
import Button from '@/components/ui/Button'
import { Icons } from '@/components/Icons'
import CallButton from '@/components/CallButton'



interface PageProps {
    params: {
        chatId: string //we can freely name here
    }
}



async function getChatMessages(chatId: string) {
    try {
        const results: string[] = await fetchRedis(
            'zrange',
            `chat:${chatId}:messages`,
            0,
            -1
        )
        const dbMessages = results.map((message) => JSON.parse(message) as Message)

        const reversedDbMessages = dbMessages.reverse()

        const messages = messageArrayValidator.parse(reversedDbMessages)

        return messages
    } catch (error) {
        notFound()
    }
}
const page = async ({ params }: PageProps) => {
    const { chatId } = params
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const { user } = session

    const [userId1, userId2] = chatId.split('--')

    if (user.id !== userId1 && user.id !== userId2) {
        notFound()
    }

    const chatPartnerId = user.id === userId1 ? userId2 : userId1

    //new
    const chatPartnerRaw = (await fetchRedis(
        'get',
        `user:${chatPartnerId}`
    )) as string
    const chatPartner = JSON.parse(chatPartnerRaw) as User
    const initialMessages = await getChatMessages(chatId)

    return (
        <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)] '>
            <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
                <div className='relative flex items-center space-x-4'>
                    <div className='relative'>
                        <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
                            <Image
                                fill
                                referrerPolicy='no-referrer'
                                src={chatPartner.image ? chatPartner.image : ''}
                                alt={`${chatPartner.name} profile image`}
                                className='rounded-full'
                            />
                        </div>
                    </div>
                    <div className='flex flex-col leading-tight'>
                        <div className='text-xl flex items-center'>
                            <span className='text-gray-700 mr-3 font-semibold'>
                                {chatPartner.name}
                            </span>
                        </div>
                        <span className='text-sm text-gray-600 '>
                            {chatPartner.email}
                        </span>
                    </div>
                </div>
                {chatPartner.email === 'deeps.ai.chat.bot@gmail.com' ? null :<CallButton chatUser={user as User} chatPartner={chatPartner} roomId={chatId} />}
            </div>
            <Messages chatId={chatId} chatPartner={chatPartner} sessionImg={session.user.image} initialMessages={initialMessages} sessionId={session.user.id}/>
            <ChatInput chatId={chatId} chatPartner={chatPartner}/>
        </div>
    )
}

export default page