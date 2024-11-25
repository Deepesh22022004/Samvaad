import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { Message, messageValidator } from "@/lib/validations/messages";
import { nanoid } from "nanoid";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { generateAiResponse } from "@/app/api/message/send/ai";

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];

    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawSender = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;

    const sender = JSON.parse(rawSender) as User;

    // All valid, store user message
    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    // Notify all connected clients
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming-message",
      message
    );

    pusherServer.trigger(
      toPusherKey(`user:${friendId}:chats`),
      'new-message',
      {
        ...message,
        senderImg: sender.image,
        senderName: sender.name
      }
    )


    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    // If chat partner is the AI bot, generate AI response
    if (friendId === "bd8eea61-96b7-4a13-b0c7-e42559c2bc88") {
      const textObj = { text };
      const aiResponse = await generateAiResponse(textObj.text);
      if (aiResponse) {
        const aiMessageData: Message = {
          id: nanoid(),
          senderId: "AI_BOT", // Use a unique ID for the bot
          text: aiResponse,
          timestamp: Date.now(),
        };

        const aiMessage = messageValidator.parse(aiMessageData);

        // Notify all connected clients about the bot's response
        pusherServer.trigger(
          toPusherKey(`chat:${chatId}`),
          "incoming-message",
          aiMessage
        );

        pusherServer.trigger(
          toPusherKey(`user:${friendId}:chats`),
          'new-message',
          {
            ...message,
            senderImg: sender.image,
            senderName: sender.name
          }
        )

        await db.zadd(`chat:${chatId}:messages`, {
          score: aiMessage.timestamp,
          member: JSON.stringify(aiMessage),
        });
      }
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
