import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { AgentResponse, Message, ToolCall, LocationDetails, RouteDetails } from "@/types"; // Import AgentResponse and Message from types

const AGENT_ID = "f03bd0e5-582e-4306-a254-9f9d9a6f9ce1";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Removed local interface definitions as they are now imported from @/types
// interface AgentResponse<T> {
//   data: T;
// }

// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }

// interface ToolCall {
//   id: string;
//   type: string;
//   function: {
//     name: string;
//     arguments: string;
//   };
// }

// interface AssistantMessage extends Message {
//   role: "assistant";
//   content: string;
//   tool_calls?: ToolCall[];
// }

export async function fetchAgentResponse(
  agentId: string,
  query: string,
  apiUrl: string = API_URL as string // Provide a default or ensure API_URL is always defined
): Promise<AgentResponse<LocationDetails | RouteDetails | any>> {
  if (!apiUrl) {
    throw new Error("API_URL is not defined. Please set NEXT_PUBLIC_API_URL environment variable.");
  }

  // const session = await getSession(); // getSession is imported but not used
  // const token = session?.accessToken;

  const response = await fetch(`${apiUrl}/agents/${agentId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "user", content: query } as Message,
      ],
      // stream: false, // Assuming non-streaming for simplicity
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error Response:", errorData);
    throw new Error(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
  }

  const data: AgentResponse<LocationDetails | RouteDetails | any> = await response.json();
  return data;
}
