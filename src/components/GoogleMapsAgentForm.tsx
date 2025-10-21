"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AGENT_ID, API_URL } from "@/lib/api";
import { Message } from "@/types";

interface GoogleMapsAgentFormProps {
  onResponse: (response: Message[]) => void;
}

export function GoogleMapsAgentForm({ onResponse }: GoogleMapsAgentFormProps) {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    if (status === "loading" || !session?.accessToken) {
      setError("Please log in to use the agent.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/agents/${AGENT_ID}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: query }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: { messages: Message[] } = await response.json();
      onResponse(data.messages);
      setQuery("");
    } catch (err) {
      console.error("Error submitting query:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, session?.accessToken, status, onResponse]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto my-8">
      <CardHeader>
        <CardTitle>Google Maps Agent</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask about locations or routes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || status === "loading"}
            aria-label="User query input"
          />
          <Button onClick={handleSubmit} disabled={isLoading || status === "loading" || !query.trim()}>
            {isLoading ? <Spinner className="h-4 w-4" /> : "Send"}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        {status === "unauthenticated" && (
          <p className="text-sm text-muted-foreground">Please log in to use the agent.</p>
        )}
      </CardFooter>
    </Card>
  );
}