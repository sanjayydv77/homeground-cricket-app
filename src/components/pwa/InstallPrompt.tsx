"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
    );

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
    
    // Only show iOS prompt if not standalone and is iOS
    if (isIosDevice && !(window.navigator as any).standalone) {
        // Show after a delay to not be annoying immediately
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      console.log("PWA Install Prompt fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    // Debug log
    console.log("PWA Install Listener added");

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (isStandalone) return null;
  if (!showPrompt) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-emerald-100 z-50 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <p className="text-sm text-emerald-800 font-medium">
            Install HomeGround
          </p>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-emerald-600">
          Tap <span className="inline-block px-1 font-bold">Share</span> then select <span className="inline-block px-1 font-bold">Add to Home Screen</span>
        </p>
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white p-4 rounded-lg shadow-lg border border-emerald-100 z-50 flex items-center justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-semibold text-emerald-900 text-sm">Install App</h3>
        <p className="text-xs text-emerald-600">Add to home screen</p>
      </div>
      <div className="flex items-center gap-2">
        <button
            onClick={() => setShowPrompt(false)}
            className="text-emerald-400 hover:text-emerald-600 p-2"
        >
            <X size={18} />
        </button>
        <button
            onClick={handleInstallClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
            <Download size={16} />
            Install
        </button>
      </div>
    </div>
  );
}
