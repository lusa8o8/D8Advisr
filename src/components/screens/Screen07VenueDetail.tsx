"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff, Car, Clock, Copy, ExternalLink, Footprints, Globe, Heart, MapPin, Navigation, Phone, Share, Star, ThumbsUp, Ticket } from "lucide-react";
import { toast } from "sonner";
import type { VenueWithDetails } from "@/types/database";

const CATEGORY_EMOJIS: Record<string, string> = {
  restaurant: "🍽️",
  bar: "🍸",
  activity: "🎯",
  cafe: "☕",
  park: "🌿",
};

function categoryGradient(category: string): string {
  const map: Record<string, string> = {
    restaurant: "from-rose-400 to-red-500",
    bar: "from-purple-400 to-indigo-500",
    activity: "from-amber-400 to-orange-500",
    cafe: "from-yellow-400 to-amber-500",
    park: "from-green-400 to-emerald-500",
  };
  return map[category] ?? "from-primary/60 to-primary/80";
}

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
    <div className="flex min-h-screen flex-col bg-card pb-28">
      {/* Hero section */}
      <section className="relative h-72 w-full overflow-hidden rounded-b-[40px] shadow-md shrink-0">
        <div className={`w-full h-full bg-gradient-to-br ${categoryGradient(venue.category)} flex items-center justify-center text-[80px] opacity-60`}>
          {heroEmoji}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/25" />

        {/* Back + Share */}
        <div className="absolute top-14 left-6 right-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => toast("Coming soon!")}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
          >
            <Share size={18} />
          </button>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl">
            {heroEmoji}
          </div>
          <div>
            <p className="text-white font-bold text-[17px] drop-shadow-sm">{venue.name}</p>
            <p className="text-white/80 text-[12px] font-medium capitalize">{venue.category}{venue.activity_type ? ` · ${venue.activity_type}` : ""}</p>
          </div>
        </div>
      </section>

      <div className="px-6 -mt-8 relative z-10">
        {/* Info card */}
        <div className="bg-card rounded-3xl p-6 shadow-md border border-border mb-6">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-background px-3 py-1 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {venue.activity_type ?? venue.category}
            </span>
            <div className="bg-[#E8FFF0] text-[#00C851] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              ~K{venue.price_level ? venue.price_level * 100 : 150}/pp
            </div>
          </div>

          <h1 className="text-[26px] font-bold text-foreground leading-tight mb-3">{venue.name}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium mb-4">
            <div className="flex items-center gap-1 text-foreground">
              <Star size={16} className="fill-[#FF9500] text-[#FF9500]" />
              <span className="font-bold">{starRating}</span>
              <span className="text-gray-400 font-normal">(24 reviews)</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-primary font-bold">{priceIndicator}</span>
          </div>

          {venue.address && (
            <div className="flex items-center gap-2 text-sm text-foreground bg-background p-3 rounded-xl">
              <MapPin size={16} className="text-primary shrink-0" />
              <span className="font-medium">{venue.address}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {(["Overview", "Events", "Reviews", "Location"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-4 font-semibold text-[13px] relative transition-colors ${
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {tab === "Events" && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold align-middle">2</span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              {venue.venue_details?.description ??
                "This venue delivers curated energy for your next experience. Personally verified by the D8Advisr team."}
            </p>

            <h3 className="font-bold text-foreground text-lg mb-4">Highlights</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? "bg-[#FFF0F1]" : "bg-background border border-border"}`}>
                    {h.emoji}
                  </div>
                  <span className="text-sm font-medium text-foreground">{h.label}</span>
                </div>
              ))}
            </div>

            {/* Upcoming preview */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-foreground text-lg">Upcoming here</h3>
                <button type="button" onClick={() => setActiveTab("Events")} className="text-sm font-bold text-primary">See all</button>
              </div>
              <div
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setActiveTab("Events")}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-sm shrink-0">🎷</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-[15px] leading-tight">Sunset Jazz Evening</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Fri, Apr 11 · 7:00 PM · K200/pp</p>
                  <div className="flex gap-1.5 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F1] text-primary">Romantic</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">Foodie</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#FF9500] bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl">8 left</span>
              </div>
            </div>

            {venue.venue_prices.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-foreground text-lg mb-3">Pricing</h3>
                <div className="space-y-2">
                  {venue.venue_prices.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                    >
                      <p className="text-sm font-medium text-foreground">{price.item_name}</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(price.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-6">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border text-foreground font-medium text-sm">
                <Clock size={16} className="text-muted-foreground" />
                Open today · Lusaka
              </div>
              {venue.venue_details?.website && (
                <a href={venue.venue_details.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border text-foreground font-medium text-sm">
                  <Globe size={16} className="text-muted-foreground" />
                  {venue.venue_details.website}
                </a>
              )}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "Events" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {notifyOn ? <Bell size={18} /> : <BellOff size={18} />}
                </div>
                <div>
                  <p className="font-bold text-foreground text-[14px] leading-tight">Vibe alerts for this venue</p>
                  <p className="text-[12px] text-muted-foreground">Get notified when events match your vibe</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleNotify}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 overflow-hidden ${notifyOn ? "bg-primary" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifyOn ? "translate-x-[18px]" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { id: "e1", emoji: "🎷", name: "Sunset Jazz Evening", date: "Fri, Apr 11", time: "7:00 PM", price: "K200/pp", spotsLeft: 8, desc: "Live jazz quartet with curated wine selections. An intimate evening for two.", gradient: "from-amber-400 to-orange-500", vibes: ["Romantic", "Foodie"] },
                { id: "e2", emoji: "👨‍🍳", name: "Chef's Tasting Night", date: "Sat, Apr 12", time: "7:30 PM", price: "K350/pp", spotsLeft: 3, desc: "5-course menu crafted live by the head chef. Limited to 8 guests.", gradient: "from-purple-500 to-indigo-600", vibes: ["Romantic", "Adventurous"] },
              ].map((event) => (
                <div key={event.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className={`h-24 bg-gradient-to-r ${event.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
                    <div className="absolute inset-0 flex items-center px-5 gap-4">
                      <span className="text-3xl drop-shadow-md shrink-0">{event.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-[15px] leading-tight">{event.name}</p>
                        <p className="text-white/80 text-[12px] font-medium mt-0.5">{event.date} · {event.time}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl shrink-0 bg-white/20 text-white backdrop-blur-sm border border-white/20">
                        {event.spotsLeft <= 5 ? `${event.spotsLeft} left` : `${event.spotsLeft} spots`}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{event.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {event.vibes.map((v) => (
                          <span key={v} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFF0F1] text-primary">{v}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground text-[14px]">{event.price}</span>
                        <button
                          type="button"
                          onClick={() => router.push("/plans/generate")}
                          className="flex items-center gap-1.5 bg-primary text-white text-[12px] font-bold px-3.5 py-2 rounded-xl shadow-sm active:scale-95 transition-transform"
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
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm mb-6">
              <div className="flex items-center gap-5 mb-5">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-foreground leading-none">{starRating}</p>
                  <div className="flex gap-0.5 mt-1.5 justify-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className="fill-[#FF9500] text-[#FF9500]" />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">24 date reviews</p>
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                  {[
                    { label: "Atmosphere",           score: 4.9 },
                    { label: "Conversation-friendly", score: 4.5 },
                    { label: "Lighting",             score: 4.9 },
                    { label: "Service",              score: 4.7 },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium w-[120px] shrink-0 leading-tight">{r.label}</span>
                      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF9500] rounded-full" style={{ width: `${(r.score / 5) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-foreground w-6 text-right">{r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {["Intimate", "Candlelit", "Great lighting", "Worth the price", "Attentive staff"].map((tag) => (
                  <span key={tag} className="bg-background border border-border text-foreground text-[11px] font-semibold px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              {[
                { id: "r1", avatar: "🥰", name: "Jordan", occasion: "First Date", timeAgo: "2 weeks ago", rating: 5, text: "Candles everywhere, soft jazz, you completely forget the city exists outside. My date couldn't stop smiling. Already planning our anniversary here.", helpful: 12 },
                { id: "r2", avatar: "😎", name: "Maya", occasion: "Date Night", timeAgo: "3 weeks ago", rating: 5, text: "One of the best evenings we've had in Lusaka. The food was incredible and the vibe made conversation flow so naturally. Highly recommend for a special occasion.", helpful: 8 },
                { id: "r3", avatar: "🌹", name: "Marcus", occasion: "Anniversary", timeAgo: "1 month ago", rating: 4, text: "Gorgeous atmosphere and genuinely great food. Got a bit loud on Saturday — I'd pick a weeknight next time. The staff made us feel really celebrated though.", helpful: 5 },
              ].map((review) => (
                <div key={review.id} className="bg-card rounded-3xl p-5 border border-border shadow-sm">
                  <div className="flex items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-xl">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground text-[14px]">{review.name}</p>
                          <span className="bg-[#FFF0F1] text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{review.occasion}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} size={10} className="fill-[#FF9500] text-[#FF9500]" />
                          ))}
                          <span className="text-[11px] text-muted-foreground ml-1">{review.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] text-foreground leading-relaxed mb-4 italic">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ThumbsUp size={13} />
                    <span className="text-[12px] font-medium">{review.helpful} found this helpful</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push("/plans")}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground font-bold text-[14px] hover:border-primary hover:text-primary transition-colors"
            >
              + Share your date experience
            </button>
          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === "Location" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {/* Map placeholder */}
            <div className="rounded-3xl overflow-hidden h-44 mb-5 relative shadow-sm border border-border bg-gradient-to-br from-gray-200 to-gray-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center">
                    <MapPin size={18} className="text-white fill-white" />
                  </div>
                  <div className="w-2 h-2 bg-primary/40 rounded-full mt-0.5 blur-sm" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const q = encodeURIComponent(venue.address ?? `${venue.name} Lusaka`);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
                }}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-foreground text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <Navigation size={11} className="text-primary" /> Open in Maps
              </button>
            </div>

            {/* Address */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F1] flex items-center justify-center text-primary shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-[14px]">{venue.address ?? venue.name}</p>
                  <p className="text-[12px] text-muted-foreground font-medium">Lusaka · Zambia</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(venue.address ?? `${venue.name}, Lusaka, Zambia`);
                  toast.success("Address copied!");
                }}
                className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"
              >
                <Copy size={15} />
              </button>
            </div>

            {/* Transport card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm mb-6 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Getting There</p>
              </div>
              <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[#00C851] bg-[#E8FFF0]">
                  <Footprints size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-[14px]">Walking</p>
                  <p className="text-[12px] text-muted-foreground">~20 min from City Centre</p>
                </div>
              </div>
              <div className="px-4 py-4 border-b border-border">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                    <Car size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-foreground text-[14px]">Yango</p>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mb-3">Est. K50–120 · ~5 min</p>
                    <div className="flex items-center gap-2">
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
                          setTimeout(() => { if (Date.now() - start < 2000) window.open(fallbackUrl, "_blank"); }, 1500);
                        }}
                        className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-[13px] font-bold shadow-sm active:scale-95 transition-transform"
                      >
                        <Car size={13} /> Open in Yango
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address ?? `${venue.name} Lusaka`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                      >
                        <ExternalLink size={12} /> Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Make a Night of It */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-3 px-1">
                <div>
                  <h3 className="font-bold text-foreground text-[16px] leading-tight">Make a Night of It</h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5">Nearby spots to complete your evening</p>
                </div>
                <button type="button" onClick={() => router.push("/plans/generate")} className="text-[12px] font-bold text-primary">Plan full night →</button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { id: "n1", emoji: "🍸", name: "Sky Lounge", type: "Pre-dinner cocktails", distance: "4 min walk", timing: "Before", gradient: "from-blue-500 to-indigo-600" },
                  { id: "n2", emoji: "🌳", name: "City Park Walk", type: "After dinner stroll", distance: "6 min walk", timing: "After", gradient: "from-emerald-400 to-teal-500" },
                  { id: "n3", emoji: "🍰", name: "Dessert Stop", type: "Dessert & coffee", distance: "5 min walk", timing: "After", gradient: "from-rose-400 to-pink-500" },
                ].map((nearby) => (
                  <div key={nearby.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex active:scale-[0.98] transition-transform cursor-pointer">
                    <div className={`w-24 h-20 bg-gradient-to-br ${nearby.gradient} flex items-center justify-center text-2xl shrink-0 relative`}>
                      {nearby.emoji}
                      <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${nearby.timing === "Before" ? "bg-blue-500 text-white" : "bg-[#00C851] text-white"}`}>
                        {nearby.timing}
                      </span>
                    </div>
                    <div className="flex-1 p-3.5 flex flex-col justify-center">
                      <p className="font-bold text-foreground text-[14px] leading-tight">{nearby.name}</p>
                      <p className="text-[12px] text-muted-foreground mb-1">{nearby.type}</p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Footprints size={11} />
                        <span className="text-[11px] font-medium">{nearby.distance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighbourhood */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 text-white mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">🏙️</div>
                <div>
                  <p className="font-bold text-[15px]">Lusaka Central</p>
                  <p className="text-white/60 text-[12px] font-medium">Vibrant · Safe · Accessible</p>
                </div>
              </div>
              <p className="text-white/70 text-[13px] leading-relaxed">
                A lively mix of upscale dining, rooftop bars, and city views. Perfect for a full evening — easily accessible by Yango.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 flex gap-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <button className="w-14 h-14 rounded-xl border-2 border-border flex items-center justify-center text-foreground active:scale-95 transition-transform hover:bg-background hover:text-primary hover:border-primary/30">
          <Heart size={24} />
        </button>
        <button
          className="flex-1 bg-primary text-primary-foreground rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all hover:bg-primary/90"
          onClick={() => router.push(`/plans/generate?venue_id=${venue.id}&venue_name=${encodeURIComponent(venue.name)}`)}
        >
          Add to Plan
        </button>
      </div>
    </div>
  );
}
