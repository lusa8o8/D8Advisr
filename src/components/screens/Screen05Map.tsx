"use client";

import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";

const MAP_PINS = [
  { id: 1, name: "Latitude 15°", emoji: "🍷", top: "35%", left: "45%", rating: 4.8 },
  { id: 2, name: "The Eatery", emoji: "🍽️", top: "55%", left: "25%", rating: 4.6 },
  { id: 3, name: "Rhapsody's", emoji: "🍸", top: "25%", left: "65%", rating: 4.5 },
  { id: 4, name: "O'Hagans", emoji: "🎵", top: "65%", left: "55%", rating: 4.3 },
  { id: 5, name: "Lusaka Museum", emoji: "🏛️", top: "45%", left: "70%", rating: 4.7 },
];

export default function Screen05Map() {
  const router = useRouter();

  return (
    <div className="flex-1 min-h-screen flex flex-col relative bg-[#E5E2DA] overflow-hidden pb-24">
      {/* MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* Roads */}
        <div className="absolute w-[2px] h-[150%] bg-white/60 top-[-10%] left-[30%] rotate-[15deg]"></div>
        <div className="absolute w-[2px] h-[150%] bg-white/60 top-[-10%] left-[70%] rotate-[-5deg]"></div>
        <div className="absolute h-[3px] w-[150%] bg-white/60 top-[40%] left-[-10%] rotate-[-10deg]"></div>
        <div className="absolute h-[3px] w-[150%] bg-white/60 top-[65%] left-[-10%] rotate-[5deg]"></div>
        {/* Block fills */}
        <div className="absolute top-[15%] left-[10%] w-[80px] h-[60px] bg-[#D6D3CB] rounded-lg opacity-60"></div>
        <div className="absolute top-[50%] left-[38%] w-[60px] h-[80px] bg-[#D6D3CB] rounded-lg opacity-60"></div>
        <div className="absolute top-[30%] left-[20%] w-[100px] h-[50px] bg-[#D6D3CB] rounded-lg opacity-60"></div>
        {/* Park */}
        <div className="absolute top-[10%] right-[5%] w-[150px] h-[180px] bg-[#C8E6C9] rounded-[40px] rotate-[-10deg] opacity-80"></div>
        {/* Water */}
        <div className="absolute bottom-[25%] left-[-5%] w-[200px] h-[160px] bg-[#BBDEFB] rounded-[50px] rotate-[15deg] opacity-70"></div>
      </div>

      {/* TOP BAR OVERLAY */}
      <div className="absolute top-0 w-full z-20 bg-gradient-to-b from-white/95 to-white/0 pt-14 pb-8 px-6 flex justify-between items-start">
        <div
          onClick={() => router.push("/home")}
          className="flex items-baseline bg-white px-4 py-2 rounded-2xl shadow-sm cursor-pointer"
        >
          <span className="font-bold text-xl text-[#FF5A5F] tracking-tight">D8</span>
          <span className="font-bold text-xl text-[#222222] tracking-tight">Advisr</span>
        </div>

        <div className="bg-white rounded-full p-1 shadow-sm flex">
          <button
            onClick={() => router.push("/home")}
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-[#555555]"
          >
            Feed
          </button>
          <button className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#FF5A5F] text-white shadow-sm">
            Map
          </button>
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      <div className="absolute top-[110px] w-full px-6 z-20">
        <div className="bg-white rounded-2xl shadow-md p-3.5 flex items-center gap-3">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search this area..."
            className="w-full text-sm font-medium focus:outline-none text-[#222222]"
          />
        </div>
      </div>

      {/* VENUE PINS */}
      {MAP_PINS.map((pin) => (
        <div
          key={pin.id}
          onClick={() => router.push(`/venues/${pin.id}`)}
          className="absolute flex flex-col items-center cursor-pointer z-10"
          style={{ top: pin.top, left: pin.left }}
        >
          <div className="w-12 h-12 bg-[#FF5A5F] rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white relative">
            {pin.emoji}
            <div className="absolute -bottom-1.5 w-3 h-3 bg-[#FF5A5F] rotate-45 -z-10 border-r-2 border-b-2 border-white"></div>
          </div>
          <div className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold mt-2 shadow-sm text-[#222222]">
            {pin.name}
          </div>
        </div>
      ))}

      {/* SELECTED VENUE BOTTOM SHEET */}
      <div
        onClick={() => router.push("/venues/1")}
        className="absolute bottom-28 w-full px-6 z-20"
      >
        <div className="bg-white rounded-3xl p-4 shadow-xl border border-[#EBEBEB] flex items-center gap-4 cursor-pointer">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
            🍷
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[16px] text-[#222222] leading-tight mb-1">Latitude 15°</h3>
            <div className="flex items-center gap-1 text-xs text-[#555555] mb-1.5">
              <Star size={12} className="fill-[#FF9500] text-[#FF9500]" />
              <span className="font-bold text-[#222222]">4.8</span>
              <span className="mx-1">•</span>
              <span className="text-[#FF5A5F] font-bold">$$</span>
            </div>
            <p className="text-xs text-[#555555]">Romantic Dining • Bishops Road</p>
          </div>
        </div>
      </div>
    </div>
  );
}
