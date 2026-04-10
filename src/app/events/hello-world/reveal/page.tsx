"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { helloWorldConfig } from "@/config/events/hello-world";

const { houses, reveal } = helloWorldConfig;

type HouseKey = "spade" | "heart" | "diamond" | "club";

export default function RevealPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealedHouse, setRevealedHouse] = useState<HouseKey | null>(null);
  const [shuffleIndex, setShuffleIndex] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/events/hello-world/reveal");
    }
  }, [status, router]);

  const shuffleAnimation = useCallback(() => { setShuffleIndex((prev) => (prev + 1) % houses.items.length); }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isShuffling) { interval = setInterval(shuffleAnimation, 150); }
    return () => clearInterval(interval);
  }, [isShuffling, shuffleAnimation]);

  const handleReveal = async () => {
    setError(""); setIsLoading(true);
    try {
      const res = await fetch("/api/house-reveal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to find house");
      const house = data.house as HouseKey;
      setIsLoading(false); setIsShuffling(true);
      setTimeout(() => { setIsShuffling(false); setRevealedHouse(house); }, 3000);
    } catch (err) { setIsLoading(false); setError(err instanceof Error ? err.message : "Something went wrong"); }
  };

  const houseData = revealedHouse ? houses.items.find((h) => h.key === revealedHouse) : null;
  const shuffleHouse = houses.items[shuffleIndex];

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (revealedHouse && houseData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-900">
        <div className="text-center animate-scale-in">
          <div className={`inline-flex items-center justify-center w-40 h-40 rounded-3xl bg-gradient-to-br ${houseData.revealGradient} mb-8 shadow-2xl`}>
            <span className="text-7xl text-white">{houseData.symbol}</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">House {houseData.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{reveal.revealedMessage}</p>
          <button onClick={() => setRevealedHouse(null)} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">{reveal.revealAgainButton}</button>
        </div>
      </div>
    );
  }

  if (isShuffling) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-900">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-40 h-40 rounded-3xl bg-gradient-to-br ${shuffleHouse.revealGradient} mb-8 animate-shuffle shadow-2xl`}>
            <span className="text-7xl text-white">{shuffleHouse.symbol}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white animate-pulse">{reveal.shufflingTitle}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{reveal.shufflingSubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="text-6xl mb-6">{reveal.emoji}</div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{reveal.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2">เข้าสู่ระบบในชื่อ <span className="font-medium text-slate-700 dark:text-slate-300">{session?.user?.email}</span></p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">{reveal.description}</p>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{error}</p>
          )}
          <Button variant="primary" size="lg" loading={isLoading} onClick={handleReveal} className="w-full !bg-gradient-to-r !from-purple-500 !to-pink-500 !shadow-lg !shadow-purple-500/20">
            {reveal.button}
          </Button>
        </div>

        <div className="mt-10 flex justify-center gap-8">
          {houses.items.map((h) => (<span key={h.name} className={`text-3xl opacity-30 ${h.revealTextColor}`} title={h.name}>{h.symbol}</span>))}
        </div>
      </div>
    </div>
  );
}
