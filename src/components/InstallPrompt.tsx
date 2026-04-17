"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "d8advisr-install-dismissed";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-sm mx-auto border border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-[#FF5A5F] flex items-center justify-center shrink-0">
          <span className="text-white font-extrabold text-sm">D8</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#141414] leading-tight">Add to Home Screen</p>
          <p className="text-xs text-gray-500 leading-tight mt-0.5">Install for the best experience</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 bg-[#FF5A5F] text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-gray-400 text-lg leading-none px-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
