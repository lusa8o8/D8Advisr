"use client";

import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";

const PIN_POSITIONS = [
  { top: "35%", left: "45%" },
  { top: "55%", left: "25%" },
  { top: "25%", left: "65%" },
  { top: "65%", left: "55%" },
  { top: "45%", left: "70%" },
];

function categoryEmoji(category: string) {
  switch (category) {
    case "restaurant": return "🍽️";
    case "bar": return "🍸";
    case "activity": return "🏛️";
    default: return "📍";
  }
}

type MapVenue = { id: string; name: string; category: string };

export default function Screen05Map({ venues }: { venues: MapVenue[] }) {
  const router = useRouter();

  const pins = venues.slice(0, 5).map((venue, i) => ({
    ...venue,
    emoji: categoryEmoji(venue.category),
    ...PIN_POSITIONS[i],
  }));

  const featured = pins[0];

  return (
    <div className="flex-1 min-h-screen flex flex-col relative bg-[#E5E2DA] overflow-hidden pb-24">
      {/* Map background */}
      <div className="absolute inset-0 z-0">
        {/* Roads */}
        <div className="absolute w-[2px] h-[150%] bg-white top-[-10%] left-[30%] rotate-[15deg]" />
        <div className="absolute w-[2px] h-[150%] bg-white top-[-10%] left-[70%] rotate-[-5deg]" />
        <div className="absolute h-[4px] w-[150%] bg-white top-[40%] left-[-10%] rotate-[-10deg]" />
        <div className="absolute h-[3px] w-[150%] bg-white top-[65%] left-[-10%] rotate-[5deg]" />
        {/* Block fills */}
        <div className="absolute top-[15%] left-[10%] w-[80px] h-[60px] bg-[#D6D3CB] rounded-lg opacity-60" />
        <div className="absolute top-[50%] left-[38%] w-[60px] h-[80px] bg-[#D6D3CB] rounded-lg opacity-60" />
        <div className="absolute top-[30%] left-[20%] w-[100px] h-[50px] bg-[#D6D3CB] rounded-lg opacity-60" />
        {/* Park */}
        <div className="absolute top-[10%] right-[5%] w-[180px] h-[200px] bg-[#C8E6C9] rounded-[40px] rotate-[-10deg]" />
        {/* Water */}
        <div className="absolute bottom-[25%] left-[-10%] w-[250px] h-[200px] bg-[#BBDEFB] rounded-[50px] rotate-[15deg]" />
      </div>

      {/* Top bar overlay */}
      <div className="absolute top-0 w-full z-20 bg-gradient-to-b from-white/90 to-white/0 pt-14 pb-8 px-6 flex justify-between items-start">
        <div
          onClick={() => router.push("/home")}
          className="flex items-baseline bg-white px-4 py-2 rounded-2xl shadow-sm cursor-pointer"
        >
          <span className="font-bold text-xl text-primary tracking-tight">D8</span>
          <span className="font-bold text-xl text-foreground tracking-tight">Advisr</span>
        </div>

        <div className="bg-white rounded-full p-1 shadow-sm flex">
          <button
            onClick={() => router.push("/home")}
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-muted-foreground"
          >
            Feed
          </button>
          <button className="px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-white shadow-sm">
            Map
          </button>
        </div>
      </div>

      {/* Search overlay */}
      <div className="absolute top-[110px] w-full px-6 z-20">
        <div className="bg-white rounded-2xl shadow-md p-3.5 flex items-center gap-3">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search this area..."
            className="w-full text-sm font-medium focus:outline-none text-foreground"
          />
        </div>
      </div>

      {/* Venue pins */}
      {pins.map((pin) => (
        <div
          key={pin.id}
          onClick={() => router.push(`/venues/${pin.id}`)}
          className="absolute flex flex-col items-center cursor-pointer z-10"
          style={{ top: pin.top, left: pin.left }}
        >
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white relative">
            {pin.emoji}
            <div className="absolute -bottom-1.5 w-3 h-3 bg-primary rotate-45 -z-10 border-r-2 border-b-2 border-white" />
          </div>
          <div className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold mt-2 shadow-sm text-foreground">
            {pin.name}
          </div>
        </div>
      ))}

      {/* Selected venue bottom sheet */}
      {featured && (
        <div
          onClick={() => router.push(`/venues/${featured.id}`)}
          className="absolute bottom-28 w-full px-6 z-20"
        >
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-border flex items-center gap-4 cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
              {featured.emoji}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-foreground leading-tight mb-1">
                {featured.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                <Star size={12} className="fill-[#FF9500] text-[#FF9500]" />
                <span className="font-bold text-foreground">4.8</span>
                <span className="mx-1">•</span>
                <span className="text-primary font-bold capitalize">{featured.category}</span>
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {featured.category} • Lusaka
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
