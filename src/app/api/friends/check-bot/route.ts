import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
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

    return new Response(
      JSON.stringify({ botAlreadyAdded: !!isAlreadyFriends, botId }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking AI bot status:", error);
    return new Response("Failed to check AI bot status", { status: 500 });
  }
}
