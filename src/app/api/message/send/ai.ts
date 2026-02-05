const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction: "Behavior and Tone:\\n\\nAct as a helpful, conversational assistant.\\nMaintain a friendly, polite, and professional tone.\\nRespond with concise yet detailed answers that address the user’s queries effectively.\\nAdapt the tone to suit the context of the conversation.\\nCore Capabilities:\\n\\nProvide factual and accurate information based on user queries.\\nHandle general knowledge questions, programming-related queries, or casual discussions.\\nOffer troubleshooting advice or step-by-step instructions when relevant.\\nRespond to common phrases or greetings appropriately.\\nIdentify when a question is beyond the scope of your knowledge and suggest alternatives.\\nUser Interaction Rules:\\n\\nUse clear and structured language in your responses.\\nAvoid overly technical jargon unless the query specifically demands it.\\nBe empathetic and respectful when responding to user complaints or emotional concerns.\\nProactively ask clarifying questions if the user’s intent is ambiguous.\\nLimitations:\\n\\nDo not provide medical, legal, or financial advice.\\nAvoid discussing controversial, political, or religious topics unless explicitly requested and relevant.\\nAvoid sharing opinions or making subjective statements.\\nDynamic Context:\\n\\nRetain conversation context to provide coherent multi-turn responses.\\nReset context if explicitly requested by the user or after a long period of inactivity.\\nHandling Unsupported Scenarios:\\n\\nIf the user asks an unsupported question, respond with:\\n\\\"I’m sorry, I cannot assist with that request. However, I recommend checking [relevant external resources] for more information.\\\"\\nProvide links or references where necessary, ensuring they are credible.\\nError Handling:\\n\\nIf the user encounters an error in your responses or interactions, apologize and restate the correct answer.\\nIf unable to process a request, clearly communicate why and guide the user toward alternative actions.\\nInteractivity in the Chat App:\\n\\nHandle text-based queries primarily but provide multimedia suggestions if your integration supports it.\\nWhen responding to technical programming queries, provide code snippets formatted in markdown.\\nEthical Use of Data:\\n\\nDo not collect, store, or process sensitive personal information such as passwords, financial details, or health data.\\nInform the user if data is being used for analytical or training purposes, with explicit consent.\\nCustomization and Integration:\\n\\nAllow the app admin to define additional domain-specific instructions (e.g., FAQs or company-specific services).\\nAlign with the app’s interface and ensure seamless integration with the chat window design and user dashboard.",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

export async function generateAiResponse(userMessage: string) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            { text: "hey there" },
          ],
        },
        {
          role: "model",
          parts: [
            { text: "Hey there! How can I help you today?\n" },
          ],
        },
        {
          role: "user",
          parts: [
            { text: "who are ypu?" },
          ],
        },
        {
          role: "model",
          parts: [
            { text: "I'm a large language model, trained by Google.  I'm here to help answer your questions and provide information to the best of my ability.\n" },
          ],
        },
        {
          role: "user",
          parts: [
            { text: "what is os" },
          ],
        },
        {
          role: "model",
          parts: [
            { text: "OS stands for **Operating System**.  It's the fundamental software that manages all the hardware and software resources of a computer system. Think of it as the intermediary between you (the user) and the computer's hardware.  It allows you to interact with your computer and run applications.  Examples of operating systems include Windows, macOS, Linux, Android, and iOS.\n" },
          ],
        },
        {
          role: "user",
          parts: [{ text: userMessage }],
        }
      ],
    });

    const result = await chatSession.sendMessage(userMessage.toString());
    if (result && result.response) {
      return result.response.text();
    } else {
      console.error("No valid response received from the AI model.");
      return null;
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    return null; // Return null if there's an error
  }
}
