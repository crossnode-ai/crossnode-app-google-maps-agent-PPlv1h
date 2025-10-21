"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
// import { Spinner } from "@/components/ui/spinner"; // Spinner is imported but not used
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { GoogleMapsAgentForm } from "@/components/GoogleMapsAgentForm";
import { AgentResponseCard } from "@/components/AgentResponseCard";
import { fetchAgentResponse } from "@/lib/api";
import { AgentResponseData } from "@/types";

const AGENT_ID = "f03bd0e5-582e-4306-a254-9f9d9a6f9ce1";
// Ensure NEXT_PUBLIC_API_URL is defined in your .env.local or .env file
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL is not defined. Please set it in your environment variables.");
  // In a real application, you might want to throw an error or handle this more gracefully.
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AgentResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const { data: session, status } = useSession(); // session and status are not used

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !API_URL) {
      setError("Please enter a query and ensure the API URL is configured.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await fetchAgentResponse(AGENT_ID, query, API_URL);
      setResponse(result);
    } catch (err) {
      console.error("Error fetching agent response:", err);
      setError("Failed to get a response from the agent. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  return (
    <main className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Google Maps Agent</h1>
      <GoogleMapsAgentForm query={query} setQuery={setQuery} onSubmit={handleSubmit} />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            {/* <Spinner className="w-16 h-16" /> */}
            <p className="text-white text-lg">Loading...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <Card className="mt-8 w-full max-w-md text-center bg-red-100 border-red-400 text-red-700">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <AgentResponseCard response={response} />
      )}
    </main>
  );
}
