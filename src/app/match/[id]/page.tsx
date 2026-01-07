"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Layout } from "@/components/ui/Layout";
import LiveMatchScorer from "@/components/match/LiveMatchScorer";
import CompletedMatchView from "@/components/match/CompletedMatchView";

export default function MatchPage() {
  const params = useParams();
  const { matches, isLoading } = useApp();
  const id = params.id as string;

  const match = matches.find((m) => m.id === id);

  if (isLoading) {
      return (
          <Layout className="flex items-center justify-center">
              <div className="text-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading match data...</p>
              </div>
          </Layout>
      );
  }

  if (!match) {
    return (
      <Layout className="flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
           <h2 className="text-xl font-bold text-red-500 mb-2">Match Not Found</h2>
           <p className="text-gray-600">The match with ID {id} does not exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  // If match is completed, show the Completed View (Read Only)
  if (match.status === "Completed") {
      return <CompletedMatchView match={match} />;
  }

  return (
    <Layout className="pb-0 bg-slate-100">
       <LiveMatchScorer match={match} />
    </Layout>
  );
}
