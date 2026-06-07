const TICKER_ITEMS = [
  "GET STRONGER EVERYDAY",
  "TRAIN BEYOND YOUR LIMITS",
  "MIND BODY SKY",
  "21 DAYS TO HABIT",
];

function MarqueeTrack() {
  return (
    <>
      {TICKER_ITEMS.map((item) => (
        <span
          key={item}
          className="flex shrink-0 items-center px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45 after:ml-6 after:text-[8px] after:text-[#6B93B8] after:content-['✦']"
        >
          {item}
        </span>
      ))}
    </>
  );
}

export function PromoMarquee() {
  return (
    <div
      className="overflow-hidden border-b border-white/10 bg-black/40 py-1.5"
      aria-hidden
    >
      <div className="flex w-max animate-promo-marquee">
        <div className="flex shrink-0">
          <MarqueeTrack />
        </div>
        <div className="flex shrink-0">
          <MarqueeTrack />
        </div>
        <div className="flex shrink-0">
          <MarqueeTrack />
        </div>
      </div>
    </div>
  );
}
