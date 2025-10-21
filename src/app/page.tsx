typescript
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const AGENT_ID = "f03bd0e5-582e-4306-a254-9f9d9a6f9ce1";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AgentResponse {
  answer: string;
  // Add other potential fields from your agent's response
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AgentResponse | null>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }
    if (status === "loading") return; // Prevent submission while session is loading

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const token = session?.user?.access_token; // Assuming access_token is available in session

      const response = await fetch(`${API_URL}/agents/${AGENT_ID}/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          input: query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      const data: AgentResponse = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error("Error submitting query:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [query, session, status]);

  return (
    <main className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        Google Maps Agent
      </motion.h1>

      <div className="w-full max-w-lg mb-8 flex space-x-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-grow"
        >
          <Input
            type="text"
            placeholder="Ask about locations or routes..."
            value={query}
            onChange={handleQueryChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            className="h-12 px-4 py-2 text-lg"
            aria-label="Google Maps Agent Query Input"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !query.trim() || status === "loading"}
            className="h-12 px-6 py-2 text-lg"
            aria-label="Submit Query to Google Maps Agent"
          >
            {isLoading ? <Spinner className="h-5 w-5" /> : "Search"}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center w-full max-w-lg"
          >
            <Card className="w-full p-6 text-center">
              <CardHeader>
                <CardTitle>Processing Your Request...</CardTitle>
              </CardHeader>
              <CardContent>
                <Spinner className="h-10 w-10 mx-auto" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <Card className="w-full bg-red-100 border-red-400 text-red-700">
              <CardHeader>
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Agent Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-lg leading-relaxed">{results.answer}</p>
              </CardContent>
              <CardFooter>
                <small className="text-muted-foreground">Results from Google Maps Agent</small>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}