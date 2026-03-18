"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Screen01Welcome() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 text-center">
      {/* CHANGE 1: Background blur decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#FF5A5F]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-20%] w-[250px] h-[250px] bg-[#FF5A5F]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-xs flex flex-col items-center">
        {/* CHANGE 2: Logo box with green checkmark badge */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 bg-[#FF5A5F] rounded-2xl flex items-center justify-center relative shadow-lg mb-6">
            <span className="text-white font-bold text-4xl">D8</span>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00C851] rounded-full flex items-center justify-center border-[3px] border-white shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold text-5xl text-[#FF5A5F] tracking-tight">D8</span>
            <span className="font-bold text-5xl text-[#222222] tracking-tight">Advisr</span>
          </div>
        </div>

        {/* CHANGE 3: Tagline */}
        <h1 className="text-[1.35rem] text-[#555555] text-center font-medium leading-[1.6] px-2 mb-12">
          Plan unforgettable dates &amp; group experiences{" "}
          <span className="text-[#FF5A5F]">— effortlessly.</span>
        </h1>

        {/* CHANGE 4: Button styles */}
        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="w-full bg-[#FF5A5F] text-white py-[18px] rounded-xl font-semibold text-lg shadow-[0_8px_20px_-6px_rgba(255,90,95,0.6)] active:scale-[0.98] transition-all"
          >
            Get Started
          </button>
          <Link
            href="/login"
            className="block w-full bg-white text-[#222222] border-2 border-[#EBEBEB] py-[18px] rounded-xl font-semibold text-lg active:scale-[0.98] transition-all hover:bg-gray-50 text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
