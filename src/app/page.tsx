"use client";

import { useState, useEffect, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import HomeScreen from "@/components/HomeScreen";

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already in an active session (navigating within app)
    const activeSession = sessionStorage.getItem("appSession");
    if (!activeSession) {
      // New visit - show welcome screen
      setShowSplash(true);
      // Mark this as an active session
      sessionStorage.setItem("appSession", "true");
    }
    setIsChecking(false);
  }, []);

  const handleFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (isChecking) {
    return null; // Or a minimal loading spinner
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleFinish} />;
  }

  return <HomeScreen />;
}
