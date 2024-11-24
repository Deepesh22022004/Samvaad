import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const botEmail = body.email;

    if (botEmail !== "deeps.ai.chat.bot@gmail.com") {
      return new Response("Invalid bot email", { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Fetch bot ID from Redis
    const botId = await fetchRedis("get", `user:email:${botEmail}`) as string;

    if (!botId) {
      return new Response("AI bot not found", { status: 400 });
    }

    // Check if the bot is already a friend
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${userId}:friends`,
      botId
    );

    if (isAlreadyFriends) {
      return new Response("Bot is already your friend", { status: 400 });
    }

    // Add the bot to the user's friend list
    await Promise.all([
      db.sadd(`user:${userId}:friends`, botId),
      db.sadd(`user:${botId}:friends`, userId),
      pusherServer.trigger(
        toPusherKey(`user:${userId}:friends`),
        "new_friend",
        { id: botId, email: botEmail }
      ),
    ]);

    return new Response(JSON.stringify({ botId }), { status: 200 });
  } catch (error) {
    console.error("Error adding AI bot:", error);
    return new Response("Failed to add AI bot", { status: 500 });
  }
}
