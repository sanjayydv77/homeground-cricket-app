"use client";

import React from "react";
import { Layout } from "@/components/ui/Layout";
import Link from "next/link";
import { ArrowLeft, Trophy, Layers, Medal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateModeSelector() {
  const router = useRouter();

  return (
    <Layout>
      <header className="p-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-secondary">Create New</h1>
      </header>

      <main className="p-6 flex flex-col gap-4 mt-4">
        <ModeCard 
            href="/match/create/single" 
            title="Single Match" 
            description="One-off match between two teams." 
            icon={<Trophy className="w-8 h-8 text-primary" />} 
        />
        <ModeCard 
            href="/match/create/series" 
            title="Series" 
            description="Best of X matches between two teams." 
            icon={<Layers className="w-8 h-8 text-blue-600" />} 
        />
        <ModeCard 
            href="/match/create/tournament" 
            title="Tournament" 
            description="League or Knockout tournament with multiple teams." 
            icon={<Medal className="w-8 h-8 text-amber-500" />} 
        />
      </main>
    </Layout>
  );
}

function ModeCard({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
    return (
        <Link href={href} className="block group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/20 active:scale-95">
                <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 leading-snug">{description}</p>
                </div>
            </div>
        </Link>
    )
}
