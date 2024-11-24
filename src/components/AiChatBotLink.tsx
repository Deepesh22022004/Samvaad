"use client";

import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import axios from "axios";
import { chatHrefConstructor } from "@/lib/utils";

interface AiChatBotLinkProps {
  userId: string;
}

const AiChatBotLink: React.FC<AiChatBotLinkProps> = ({ userId }) => {
  const router = useRouter(); // For navigation
  const AiIcon = Icons["BotMessageSquare"];

  const handleAddAiBot = async () => {
    try {
      const botEmail = "deeps.ai.chat.bot@gmail.com"; // Bot's email address

     
      const checkResponse = await axios.post("/api/friends/check-bot", { email: botEmail });

      if (checkResponse.status === 200 && checkResponse.data.botAlreadyAdded) {
        // Redirect to the chat if the bot is already a friend
        const botId = checkResponse.data.botId;
        router.push(`/dashboard/chat/${chatHrefConstructor(userId, botId)}`);
        return;
      }

     
      const addResponse = await axios.post("/api/friends/add-bot", { email: botEmail });

      if (addResponse.status === 200) {
        const botId = addResponse.data.botId; // Bot's unique ID returned by the API
        router.push(`/dashboard/chat/${chatHrefConstructor(userId, botId)}`);
      } else {
        console.error("Failed to add AI bot:", addResponse.statusText);
      }
    } catch (error) {
      console.error("Error adding AI bot:", error);
    }
  };

  return (
    <button
      onClick={handleAddAiBot}
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <AiIcon className="h-4 w-4" />
      </span>

      <span className="truncate">Ask Ai</span>
    </button>
  );
};

export default AiChatBotLink;
