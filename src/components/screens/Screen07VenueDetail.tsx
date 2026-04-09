"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff, Car, Clock, Copy, Heart, MapPin, Navigation, Share, Star, ThumbsUp, Ticket } from "lucide-react";
import { toast } from "sonner";
import type { VenueWithDetails } from "@/types/database";

const CATEGORY_EMOJIS: Record<string, string> = {
  restaurant: "🍽️",
  bar: "🍸",
  activity: "🎯",
  cafe: "☕",
  park: "🌿",
};

const DEFAULT_HIGHLIGHTS: Record<string, { emoji: string; label: string }[]> = {
  restaurant: [
    { emoji: "❤️", label: "Romantic Setting" },
    { emoji: "👥", label: "Great for Groups" },
    { emoji: "🌳", label: "Outdoor Seating" },
  ],
  bar: [
    { emoji: "🎵", label: "Live Atmosphere" },
    { emoji: "👥", label: "Great for Groups" },
    { emoji: "🍹", label: "Signature Drinks" },
  ],
  activity: [
    { emoji: "🎯", label: "Unique Experience" },
    { emoji: "👥", label: "Great for Groups" },
    { emoji: "⭐", label: "Top Rated" },
  ],
};

const formatCurrency = (amount: number) => `K${amount.toFixed(0)}`;

export default function Screen07VenueDetail({ venue }: { venue: VenueWithDetails }) {
  const router = useRouter();

  const heroEmoji = CATEGORY_EMOJIS[venue.category] ?? "✨";
  const priceIndicator = "$".repeat(Math.min(Math.max(venue.price_level ?? 1, 1), 4));

  const avgPrice = useMemo(() => {
    if (!venue.venue_prices.length) return 0;
    const total = venue.venue_prices.reduce((sum, price) => sum + price.price, 0);
    return total / venue.venue_prices.length;
  }, [venue.venue_prices]);

  const highlights: { emoji: string; label: string }[] = useMemo(() => {
    const rawHighlights = venue.venue_details?.highlights;
    if (rawHighlights?.length) {
      return rawHighlights.map((h) => ({ emoji: "❤️", label: h }));
    }
    return DEFAULT_HIGHLIGHTS[venue.category] ?? DEFAULT_HIGHLIGHTS.activity;
  }, [venue]);

  const getStarRating = (confidence: number) => {
    if (confidence >= 0.9) return (4.8 + (confidence - 0.9) * 2).toFixed(1);
    if (confidence >= 0.7) return (4.0 + (confidence - 0.7) * 3.5).toFixed(1);
    return (3.5 + (confidence - 0.5) * 2.5).toFixed(1);
  };

  const starRating = getStarRating(venue.confidence_score);

  const [activeTab, setActiveTab] = useState<"Overview" | "Events" | "Reviews" | "Location">("Overview");

  const notifyKey = `d8_notify_venue_${venue.id}`;
  const [notifyOn, setNotifyOn] = useState(false);
  useEffect(() => {
    setNotifyOn(localStorage.getItem(notifyKey) === "true");
  }, [notifyKey]);
  const toggleNotify = () => {
    const next = !notifyOn;
    setNotifyOn(next);
    localStorage.setItem(notifyKey, String(next));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7] pb-28">
      {/* Hero section */}
      <section className="relative h-[280px] w-full bg-[#FF5A5F]">
        <div className="flex h-full w-full items-center justify-center text-[64px]">
          {heroEmoji}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* CHANGE 2: Back + Share buttons */}
        <div className="absolute top-14 left-6 right-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => toast("Coming soon!")}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
          >
            <Share size={18} />
          </button>
        </div>
      </section>

      {/* CHANGE 1: Content card overlapping hero */}
      <div className="px-6 py-6 -mt-6 bg-white rounded-t-3xl relative z-10">
        {/* CHANGE 3: Category badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 bg-[#F7F7F7] text-[#555555] text-[11px] font-bold rounded-md uppercase tracking-wider">
            {venue.category}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#222222]">{venue.name}</h1>

        {/* CHANGE 4: Rating row */}
        <div className="flex items-center gap-4 mt-3 mb-5 border-b border-[#EBEBEB] pb-5">
          <div className="flex items-center gap-1.5">
            <Star size={16} className="fill-[#FF9500] text-[#FF9500]" />
            <span className="font-bold text-[15px] text-[#222222]">{starRating}</span>
            <span className="text-[#999999] text-sm">(24)</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-[#D1D1D1]"></span>
          {venue.address && (
            <div className="flex items-center gap-1 text-sm text-[#555555]">
              <MapPin size={14} />
              <span>Lusaka</span>
            </div>
          )}
          <span className="w-1 h-1 rounded-full bg-[#D1D1D1]"></span>
          <span className="font-bold text-[#FF5A5F] text-sm">{priceIndicator}</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EBEBEB] mb-6">
          {(["Overview", "Events", "Reviews", "Location"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3.5 font-semibold text-[13px] relative transition-colors ${
                activeTab === tab ? "text-[#FF5A5F]" : "text-[#999999]"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#FF5A5F] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <>
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#222222] mb-2">About</h2>
              <p className="text-sm text-[#555555] leading-relaxed">
                {venue.venue_details?.description ??
                  "This venue delivers curated energy for your next experience."}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#222222] mb-3">Highlights</h2>
              <div className="flex flex-col gap-3">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF0F1] text-[#FF5A5F] flex items-center justify-center shrink-0">
                      {h.emoji}
                    </div>
                    <span className="text-[#222222] font-medium">{h.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {venue.venue_prices.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-[#222222] mb-3">Pricing</h2>
                <div className="space-y-2">
                  {venue.venue_prices.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-center justify-between rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3"
                    >
                      <p className="text-sm font-medium text-[#222222]">{price.item_name}</p>
                      <p className="text-sm font-bold text-[#222222]">{formatCurrency(price.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#F7F7F7] rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#555555]">
                  <Clock size={18} />
                  <span className="font-medium text-sm">Open today · Lusaka</span>
                </div>
                <div className="bg-[#00C851]/10 text-[#00C851] px-3 py-1 rounded-full text-xs font-bold">
                  ~K{venue.price_level ? venue.price_level * 100 : 150}/person
                </div>
              </div>
            </div>
          </>
        )}

        {/* EVENTS TAB */}
        {activeTab === "Events" && (
          <div>
            <div className="flex items-center justify-between bg-[#F7F7F7] rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F1] flex items-center justify-center text-[#FF5A5F]">
                  {notifyOn ? <Bell size={18} /> : <BellOff size={18} />}
                </div>
                <div>
                  <p className="font-bold text-[#222222] text-[14px] leading-tight">Get notified when events are added</p>
                  <p className="text-[12px] text-[#888888]">We&apos;ll alert you before they sell out</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleNotify}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifyOn ? "bg-[#FF5A5F]" : "bg-[#DEDEDE]"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifyOn ? "translate-x-[18px]" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { id: "e1", emoji: "🎷", name: "Sunset Jazz Evening", date: "Fri, Apr 11", time: "7:00 PM", price: "K200/pp", spotsLeft: 8, desc: "Live jazz quartet with curated wine selections. An intimate evening for two.", gradient: "from-amber-400 to-orange-500", vibes: ["Romantic", "Foodie"] },
                { id: "e2", emoji: "👨‍🍳", name: "Chef's Tasting Night", date: "Sat, Apr 12", time: "7:30 PM", price: "K350/pp", spotsLeft: 3, desc: "5-course menu crafted live by the head chef. Limited to 8 guests.", gradient: "from-purple-500 to-indigo-600", vibes: ["Romantic", "Adventurous"] },
              ].map((event) => (
                <div key={event.id} className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
                  <div className={`h-20 bg-gradient-to-r ${event.gradient} flex items-center px-5 gap-4`}>
                    <span className="text-3xl drop-shadow">{event.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-[15px] leading-tight">{event.name}</p>
                      <p className="text-white/80 text-[12px] mt-0.5">{event.date} · {event.time}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-white/20 text-white border border-white/20 shrink-0">
                      {event.spotsLeft <= 5 ? `${event.spotsLeft} left` : `${event.spotsLeft} spots`}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] text-[#555555] leading-relaxed mb-3">{event.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {event.vibes.map((v) => (
                          <span key={v} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFF0F1] text-[#FF5A5F]">{v}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#222222] text-[14px]">{event.price}</span>
                        <button
                          type="button"
                          onClick={() => router.push("/plans/generate")}
                          className="flex items-center gap-1.5 bg-[#FF5A5F] text-white text-[12px] font-bold px-3.5 py-2 rounded-xl active:scale-95 transition-transform"
                        >
                          <Ticket size={13} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "Reviews" && (
          <div>
            <div className="bg-[#F7F7F7] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-5 mb-4">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-[#222222] leading-none">{starRating}</p>
                  <div className="flex gap-0.5 mt-1.5 justify-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className="fill-[#FF9500] text-[#FF9500]" />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#888888] mt-1">24 reviews</p>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {[
                    { label: "Atmosphere", score: 4.8 },
                    { label: "Vibe", score: 4.7 },
                    { label: "Value", score: 4.5 },
                    { label: "Service", score: 4.6 },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className="text-[11px] text-[#888888] w-20 shrink-0">{r.label}</span>
                      <div className="flex-1 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF9500] rounded-full" style={{ width: `${(r.score / 5) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#222222] w-6 text-right">{r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#EBEBEB]">
                {["Romantic", "Intimate", "Great lighting", "Worth it", "Attentive staff"].map((tag) => (
                  <span key={tag} className="bg-white border border-[#EBEBEB] text-[#555555] text-[11px] font-semibold px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-5">
              {[
                { id: "r1", avatar: "🥰", name: "Jordan", occasion: "First Date", timeAgo: "2 weeks ago", rating: 5, text: "The atmosphere completely swept us away. Intimate, warm lighting and the service was just right — present but never intrusive. Already planning our next visit.", helpful: 12 },
                { id: "r2", avatar: "😎", name: "Maya", occasion: "Date Night", timeAgo: "3 weeks ago", rating: 5, text: "One of the best evenings we've had in Lusaka. The food was incredible and the vibe made conversation flow so naturally. Highly recommend for a special occasion.", helpful: 8 },
                { id: "r3", avatar: "🌹", name: "Marcus", occasion: "Anniversary", timeAgo: "1 month ago", rating: 4, text: "Gorgeous atmosphere and genuinely great food. Got a bit loud on Saturday — I'd pick a weeknight next time. The staff made us feel really celebrated though.", helpful: 5 },
              ].map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-4">
                  <div className="flex items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center text-xl">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#222222] text-[14px]">{review.name}</p>
                          <span className="bg-[#FFF0F1] text-[#FF5A5F] text-[10px] font-bold px-2 py-0.5 rounded-full">{review.occasion}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} size={10} className="fill-[#FF9500] text-[#FF9500]" />
                          ))}
                          <span className="text-[11px] text-[#888888] ml-1">{review.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#555555] leading-relaxed mb-3 italic">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center gap-1.5 text-[#999999]">
                    <ThumbsUp size={13} />
                    <span className="text-[12px] font-medium">{review.helpful} found this helpful</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push("/plans")}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-[#EBEBEB] text-[#999999] font-bold text-[14px]"
            >
              + Share your experience
            </button>
          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === "Location" && (
          <div>
            <div className="bg-[#F7F7F7] rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F1] flex items-center justify-center text-[#FF5A5F] shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#222222] text-[14px]">{venue.address ?? venue.name}</p>
                  <p className="text-[12px] text-[#888888]">Lusaka · Zambia</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(venue.address ?? `${venue.name}, Lusaka, Zambia`);
                  toast.success("Address copied!");
                }}
                className="w-9 h-9 rounded-xl bg-white border border-[#EBEBEB] flex items-center justify-center text-[#555555] active:scale-95 transition-transform"
              >
                <Copy size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  const lat = venue.latitude ?? -15.4167;
                  const lon = venue.longitude ?? 28.2833;
                  const name = encodeURIComponent(venue.name);
                  const yangoUrl = `yango://route?end_lat=${lat}&end_lon=${lon}&end-name=${name}`;
                  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address ?? `${venue.name} Lusaka`)}`;
                  const start = Date.now();
                  window.location.href = yangoUrl;
                  setTimeout(() => {
                    if (Date.now() - start < 2000) window.open(fallbackUrl, "_blank");
                  }, 1500);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#FF5A5F] text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.4)] active:scale-[0.98] transition-all"
              >
                <Car size={18} /> Open in Yango
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address ?? `${venue.name} Lusaka`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#EBEBEB] text-[#222222] py-4 rounded-2xl font-bold text-[15px] active:scale-[0.98] transition-all"
              >
                <Navigation size={18} /> Open in Maps
              </a>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-[#222222] text-[16px] mb-3">Nearby</h3>
              <div className="flex flex-col gap-3">
                {[
                  { id: "n1", emoji: "🍸", name: "Sky Lounge", type: "Pre-dinner cocktails", distance: "4 min walk", timing: "Before", gradient: "from-blue-500 to-indigo-600" },
                  { id: "n2", emoji: "🌳", name: "City Park Walk", type: "After dinner stroll", distance: "6 min walk", timing: "After", gradient: "from-emerald-400 to-teal-500" },
                ].map((nearby) => (
                  <div key={nearby.id} className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden flex">
                    <div className={`w-20 h-[72px] bg-gradient-to-br ${nearby.gradient} flex items-center justify-center text-2xl shrink-0 relative`}>
                      {nearby.emoji}
                      <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${nearby.timing === "Before" ? "bg-blue-500 text-white" : "bg-[#00C851] text-white"}`}>
                        {nearby.timing}
                      </span>
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-center">
                      <p className="font-bold text-[#222222] text-[14px] leading-tight">{nearby.name}</p>
                      <p className="text-[12px] text-[#888888] mt-0.5">{nearby.type}</p>
                      <p className="text-[11px] text-[#999999] mt-1">{nearby.distance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHANGE 7: Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] p-6 flex gap-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <button className="w-14 h-14 rounded-xl border-2 border-[#EBEBEB] flex items-center justify-center text-[#555555] active:scale-95 transition-transform hover:bg-[#F7F7F7]">
          <Heart size={24} />
        </button>
        <button
          className="flex-1 bg-[#FF5A5F] text-white rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all"
          onClick={() => router.push(`/plans/generate?venue_id=${venue.id}&venue_name=${encodeURIComponent(venue.name)}`)}
        >
          Add to Plan
        </button>
      </div>
    </div>
  );
}
