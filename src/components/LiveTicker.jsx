import { useState, useEffect, useRef } from 'react';

// Smoothly animate a number from `from` to `to`
function useAnimatedNumber(target, duration = 2000) {
  const [value, setValue] = useState(target);
  const raf = useRef(null);

  useEffect(() => {
    const start = value;
    const diff = target - start;
    if (diff === 0) return;
    const t0 = performance.now();

    function tick(now) {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + diff * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return value;
}

export default function LiveTicker() {
  const [minutesAgo, setMinutesAgo] = useState(4);
  const [vessels, setVessels] = useState(23);
  const [profiles, setProfiles] = useState(847);

  // Slowly increment values to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setProfiles((p) => p + Math.floor(Math.random() * 3) + 1);
      setMinutesAgo(() => Math.floor(Math.random() * 6) + 1);
      setVessels((v) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(18, Math.min(28, v + delta));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const animatedProfiles = useAnimatedNumber(profiles, 1500);
  const animatedVessels = useAnimatedNumber(vessels, 1500);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-[rgba(15,24,36,0.95)] backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-center gap-4 sm:gap-6 text-[11px] font-mono overflow-x-auto">
        {/* Live indicator */}
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal" />
          </span>
          <span className="text-accent-teal font-semibold tracking-wider">LIVE</span>
        </span>

        <span className="text-border hidden sm:inline">|</span>
        <span className="text-text-muted shrink-0">Adriatic Basin</span>

        <span className="text-border">|</span>
        <span className="text-text-muted shrink-0">
          Last profile: <span className="text-text-primary">{minutesAgo} min ago</span>
        </span>

        <span className="text-border hidden sm:inline">|</span>
        <span className="text-text-muted hidden sm:inline shrink-0">
          Active vessels: <span className="text-text-primary">{animatedVessels}</span>
        </span>

        <span className="text-border hidden md:inline">|</span>
        <span className="text-text-muted hidden md:inline shrink-0">
          Profiles today: <span className="text-accent-teal">{animatedProfiles.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}
