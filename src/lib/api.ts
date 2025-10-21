typescript
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

const AGENT_ID = "f03bd0e5-582e-4306-a254-9f9d9a6f9ce1";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AgentResponse<T> {
  data: T;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface AssistantMessage extends Message {
  role: "assistant";
  content: string | null;
  tool_calls?: ToolCall[];
}

interface UserMessage extends Message {
  role: "user";
  content: string;
}

export type ChatMessage = UserMessage | AssistantMessage;

export async function sendMessageToAgent(
  messages: ChatMessage[],
  session: Session | null
): Promise<AssistantMessage> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
  }

  const token = session?.user?.access_token;

  try {
    const response = await fetch(`${API_URL}/agents/${AGENT_ID}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${response.status} - ${errorData.message || response.statusText}`
      );
    }

    const data: AgentResponse<AssistantMessage> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error sending message to agent:", error);
    throw error;
  }
}

export async function getSessionAndSendMessage(
  messages: ChatMessage[]
): Promise<AssistantMessage> {
  const session = await getSession();
  if (!session) {
    throw new Error("User not authenticated.");
  }
  return sendMessageToAgent(messages, session);
}