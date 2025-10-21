// src/components/AgentResponseCard.tsx

"use client";

import React, { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AGENT_ID, API_URL } from "@/lib/api";
import { Message } from "@/types";
import { useSession } from "next-auth/react";

interface AgentResponseCardProps {
  initialQuery?: string;
}

interface AgentResponseData {
  content: string;
}

const AgentResponseCard: React.FC<AgentResponseCardProps> = ({ initialQuery = "" }) => {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>(initialQuery);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    if (status === "loading" || !session?.user?.accessToken) {
      setError("Authentication required. Please log in.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/agents/${AGENT_ID}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: query } as Message,
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data: AgentResponse<AgentResponseData> = await res.json();
      setResponse(data.data.content);
    } catch (err) {
      console.error("Error fetching agent response:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, session?.user?.accessToken, status]);

  return (
    <Card className="w-full max-w-lg mx-auto my-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Google Maps Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="Ask me anything about Google Maps..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          disabled={isLoading}
          className="text-lg py-3 px-4"
        />
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Spinner className="h-8 w-8" />
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center py-4">
            Error: {error}
          </div>
        )}
        {response && (
          <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={handleSubmit} disabled={isLoading || !query.trim() || status === "loading" || !session?.user?.accessToken}>
          {isLoading ? "Processing..." : "Get Directions"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentResponseCard;