"use client"

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const AVATAR_KEY = "d8_avatar_emoji";

const EMOJIS = [
  "😎", "🦁", "🐯", "🦊", "🐼",
  "🦄", "🌟", "🔥", "💫", "🎯",
  "🎪", "🎨", "🎭", "🎬", "🎤",
  "🏆", "💎", "🚀", "⚡", "🌈",
];

type ProfileAvatarProps = {
  initials: string | undefined;
};

export default function ProfileAvatar({ initials }: ProfileAvatarProps) {
  const [emoji, setEmoji] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) setEmoji(saved);
  }, []);

  function select(e: string | null) {
    setEmoji(e);
    if (e) localStorage.setItem(AVATAR_KEY, e);
    else localStorage.removeItem(AVATAR_KEY);
    setShowPicker(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-[#FF5A5F] shadow-lg relative overflow-hidden group shrink-0"
        aria-label="Change avatar"
      >
        {emoji ? (
          <span className="text-3xl leading-none">{emoji}</span>
        ) : (
          <span>{initials}</span>
        )}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          <span className="text-white text-xs font-bold">Edit</span>
        </div>
      </button>

      {/* Picker overlay */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPicker(false)}
          />
          <div className="relative bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[18px] font-bold text-[#222222]">Choose your avatar</h3>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center text-[#555555]"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-[#888888] mb-5">Pick one that fits your vibe</p>

            <div className="grid grid-cols-5 gap-3 mb-5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => select(e)}
                  className={`flex items-center justify-center h-14 rounded-2xl border-2 text-3xl transition-all active:scale-90 ${
                    emoji === e
                      ? "border-[#FF5A5F] bg-[#FFF0F1] shadow-sm"
                      : "border-[#EBEBEB] bg-[#F7F7F7] hover:border-gray-300"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => select(null)}
              className={`w-full py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                !emoji
                  ? "border-[#222222] bg-[#222222] text-white"
                  : "border-[#EBEBEB] text-[#888888] hover:border-gray-300"
              }`}
            >
              Use my initials{initials ? ` (${initials})` : ""}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
