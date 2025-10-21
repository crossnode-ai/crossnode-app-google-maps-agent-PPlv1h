// src/types/index.ts

// General types
export interface AgentResponse<T> {
  data: T;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

// Agent-specific types
export interface LocationDetails {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  icon?: string;
}

export interface RouteDetails {
  summary: string;
  distance: string;
  duration: string;
  steps: string[];
}

// Union type for all possible data structures returned by the agent
export type AgentResponseData =
  | LocationDetails
  | RouteDetails
  | { type: "error"; message: string } // Example of another possible response type
  | any; // Fallback for any other unexpected response structure

// Interface for an assistant message that might include tool calls
export interface AssistantMessage extends Message {
  role: "assistant";
  content: string;
  tool_calls?: ToolCall[];
}

// Interface for a tool call
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}
