"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const houses = [
  { name: "Spade", symbol: "♠", color: "text-slate-600", bg: "from-slate-600 to-slate-800", border: "border-slate-400" },
  { name: "Heart", symbol: "♥", color: "text-red-500", bg: "from-red-500 to-pink-600", border: "border-red-400" },
  { name: "Diamond", symbol: "♦", color: "text-blue-500", bg: "from-blue-500 to-cyan-500", border: "border-blue-400" },
  { name: "Club", symbol: "♣", color: "text-green-500", bg: "from-green-500 to-emerald-600", border: "border-green-400" },
];

type HouseKey = "spade" | "heart" | "diamond" | "club";

export default function RevealPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealedHouse, setRevealedHouse] = useState<HouseKey | null>(null);
  const [shuffleIndex, setShuffleIndex] = useState(0);

  const shuffleAnimation = useCallback(() => { setShuffleIndex((prev) => (prev + 1) % 4); }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isShuffling) { interval = setInterval(shuffleAnimation, 150); }
    return () => clearInterval(interval);
  }, [isShuffling, shuffleAnimation]);

  const handleReveal = async () => {
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email"); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await fetch("/api/house-reveal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to find house");
      const house = data.house as HouseKey;
      setIsLoading(false); setIsShuffling(true);
      setTimeout(() => { setIsShuffling(false); setRevealedHouse(house); }, 3000);
    } catch (err) { setIsLoading(false); setError(err instanceof Error ? err.message : "Something went wrong"); }
  };

  const houseData = revealedHouse ? houses.find((h) => h.name.toLowerCase() === revealedHouse) : null;
  const shuffleHouse = houses[shuffleIndex];

  if (revealedHouse && houseData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center animate-scale-in">
          <div className={`inline-flex items-center justify-center w-40 h-40 rounded-3xl bg-gradient-to-br ${houseData.bg} mb-8 shadow-2xl`}>
            <span className="text-7xl text-white">{houseData.symbol}</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">House {houseData.name}</h1>
          <p className="text-slate-500 mb-8">Welcome to your new house! Wear your colors with pride.</p>
          <button onClick={() => { setRevealedHouse(null); setEmail(""); }} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm">Try Another Email</button>
        </div>
      </div>
    );
  }

  if (isShuffling) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-40 h-40 rounded-3xl bg-gradient-to-br ${shuffleHouse.bg} mb-8 animate-shuffle shadow-2xl`}>
            <span className="text-7xl text-white">{shuffleHouse.symbol}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Sorting...</h2>
          <p className="text-slate-500 mt-2">Finding your house</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="text-6xl mb-6">🎴</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Reveal Your House</h1>
        <p className="text-slate-500 mb-8">Enter the email you registered with to discover your house.</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <Input type="email" placeholder="your@email.com" value={email} onChange={(e: any) => { setEmail(e.target.value); setError(""); }} error={error} />
          <Button variant="primary" size="lg" loading={isLoading} onClick={handleReveal} className="w-full !bg-gradient-to-r !from-purple-500 !to-pink-500 !shadow-lg !shadow-purple-500/20">
            Reveal My House
          </Button>
        </div>

        <div className="mt-10 flex justify-center gap-8">
          {houses.map((h) => (<span key={h.name} className={`text-3xl opacity-30 ${h.color}`} title={h.name}>{h.symbol}</span>))}
        </div>
      </div>
    </div>
  );
}
