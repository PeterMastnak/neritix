import { useState, useEffect, useRef, useCallback } from 'react';

// ── Seabed geometry ──────────────────────────────────────────────

const W = 500;
const H = 280;
const MARGIN = { top: 24, right: 16, bottom: 28, left: 36 };
const PLOT_W = W - MARGIN.left - MARGIN.right;
const PLOT_H = H - MARGIN.top - MARGIN.bottom;

// Depth range
const D_MIN = 0;
const D_MAX = 120;
function depthToY(d) { return MARGIN.top + (d / D_MAX) * PLOT_H; }
function kmToX(km) { return MARGIN.left + (km / 40) * PLOT_W; }

// Seabed profile: km → depth
const seabedPoints = [
  [0, 18], [3, 22], [6, 30], [9, 42], [12, 55], [15, 68],
  [18, 78], [20, 85], [22, 92], [24, 88], [26, 82], [28, 86],
  [30, 90], [32, 95], [34, 88], [36, 80], [38, 72], [40, 65],
];

function buildSeabedPath() {
  const pts = seabedPoints.map(([km, d]) => [kmToX(km), depthToY(d)]);
  let path = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const cpx = (px + cx) / 2;
    path += ` C${cpx},${py} ${cpx},${cy} ${cx},${cy}`;
  }
  return path;
}

function buildSeabedFill() {
  const pts = seabedPoints.map(([km, d]) => [kmToX(km), depthToY(d)]);
  let path = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const cpx = (px + cx) / 2;
    path += ` C${cpx},${py} ${cpx},${cy} ${cx},${cy}`;
  }
  // Close along bottom
  path += ` L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  return path;
}

// Interpolate seabed depth at a given km
function seabedDepthAt(km) {
  for (let i = 1; i < seabedPoints.length; i++) {
    if (km <= seabedPoints[i][0]) {
      const [k0, d0] = seabedPoints[i - 1];
      const [k1, d1] = seabedPoints[i];
      const t = (km - k0) / (k1 - k0);
      // Smooth interpolation
      const ts = t * t * (3 - 2 * t);
      return d0 + (d1 - d0) * ts;
    }
  }
  return seabedPoints[seabedPoints.length - 1][1];
}

const seabedPath = buildSeabedPath();
const seabedFillPath = buildSeabedFill();

// ── Temperature data points along seabed ─────────────────────────

const dataDots = Array.from({ length: 20 }, (_, i) => {
  const km = 2 + i * 1.9;
  const depth = seabedDepthAt(km);
  // Temperature varies: shallower = warmer, deeper = cooler, with noise
  const baseTemp = 18 - (depth - 18) * 0.09;
  const noise = Math.sin(i * 1.7) * 1.2 + Math.cos(i * 0.9) * 0.8;
  const temp = Math.round((baseTemp + noise) * 10) / 10;
  return { km, depth, temp: Math.max(10, Math.min(18, temp)), x: kmToX(km), y: depthToY(depth) };
});

function tempColor(temp) {
  const t = Math.max(0, Math.min(1, (temp - 10) / 8));
  if (t < 0.4) {
    const f = t / 0.4;
    const r = Math.round(30 + (0 - 30) * f);
    const g = Math.round(111 + (200 - 111) * f);
    const b = Math.round(255 + (180 - 255) * f);
    return `rgb(${r},${g},${b})`;
  }
  if (t < 0.75) {
    const f = (t - 0.4) / 0.35;
    const r = Math.round(0 + (123 - 0) * f);
    const g = Math.round(200 + (200 - 200) * f);
    const b = Math.round(180 + (164 - 180) * f);
    return `rgb(${r},${g},${b})`;
  }
  const f = (t - 0.75) / 0.25;
  const r = Math.round(123 + (255 - 123) * f);
  const g = Math.round(200 + (179 - 200) * f);
  const b = Math.round(164 + (71 - 164) * f);
  return `rgb(${r},${g},${b})`;
}

// ── Grid ─────────────────────────────────────────────────────────

const depthGridLines = [25, 50, 75, 100];

// ── Main Component ───────────────────────────────────────────────

export default function BenthicCrossSection({ animate }) {
  const [progress, setProgress] = useState(0); // 0–1 sweep position
  const [tooltip, setTooltip] = useState(null);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const SWEEP_DURATION = 6000; // ms
  const PAUSE_DURATION = 1500; // ms at end

  const loop = useCallback((timestamp) => {
    if (!startRef.current) startRef.current = timestamp;
    const elapsed = (timestamp - startRef.current) % (SWEEP_DURATION + PAUSE_DURATION);

    if (elapsed < SWEEP_DURATION) {
      const p = elapsed / SWEEP_DURATION;
      // Ease in-out
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setProgress(eased);
    } else {
      setProgress(1);
    }

    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (!animate) return;
    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate, loop]);

  // Current sweep km position
  const sweepKm = progress * 40;
  const sweepX = kmToX(sweepKm);
  const vesselX = sweepX;
  const vesselY = depthToY(0) - 2;

  // Trawl geometry
  const trawlDepth = seabedDepthAt(Math.max(0, sweepKm)) - 4; // 4m above seabed
  const trawlY = depthToY(trawlDepth);
  // Wire catenary: control point sags below midpoint
  const wireMidX = (vesselX + vesselX) / 2;
  const wireMidY = (vesselY + trawlY) / 2 + 12;
  // Door positions (spread ~6px apart)
  const doorLeft = vesselX - 6;
  const doorRight = vesselX + 6;

  // Revealed dots
  const revealedDots = dataDots.filter(d => d.km <= sweepKm + 1);

  // Active tooltip (most recently revealed dot)
  const activeDotIdx = revealedDots.length - 1;
  const activeDot = activeDotIdx >= 0 ? revealedDots[activeDotIdx] : null;
  const showTooltip = activeDot && (sweepKm - activeDot.km) < 4 && progress < 0.98;

  return (
    <div className="w-full" style={{ aspectRatio: '500/280' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <defs>
          {/* Water column gradient */}
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A2030" />
            <stop offset="100%" stopColor="#040D18" />
          </linearGradient>
          {/* Dot glow filter */}
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Sweep line glow */}
          <filter id="sweepGlow" x="-100%" y="0" width="300%" height="100%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Background */}
        <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} fill="url(#waterGrad)" />

        {/* Surface line */}
        <line
          x1={MARGIN.left} y1={depthToY(0)}
          x2={MARGIN.left + PLOT_W} y2={depthToY(0)}
          stroke="#1E4A5A" strokeWidth="1" strokeDasharray="4 3"
        />
        <text x={MARGIN.left + 3} y={depthToY(0) - 3} fill="#4A6A7A" fontSize="7" opacity="0.7">
          surface
        </text>

        {/* Depth grid lines */}
        {depthGridLines.map(d => (
          <g key={d}>
            <line
              x1={MARGIN.left} y1={depthToY(d)}
              x2={MARGIN.left + PLOT_W} y2={depthToY(d)}
              stroke="#1E2D3D" strokeWidth="0.5" strokeDasharray="3 4"
            />
            <text x={MARGIN.left - 3} y={depthToY(d) + 3} fill="#4A6A7A" fontSize="7" textAnchor="end">
              {d}m
            </text>
          </g>
        ))}

        {/* Seabed fill (sediment) */}
        <path d={seabedFillPath} fill="#06100E" />

        {/* Seabed line */}
        <path d={seabedPath} fill="none" stroke="#2A4A3A" strokeWidth="2" />

        {/* Seabed texture bumps */}
        {[8, 19, 27, 35].map(km => {
          const d = seabedDepthAt(km);
          const x = kmToX(km);
          const y = depthToY(d);
          return (
            <g key={km}>
              <circle cx={x - 1.5} cy={y + 1} r={1.2} fill="#1A3A2A" opacity="0.6" />
              <circle cx={x + 2} cy={y + 0.5} r={0.8} fill="#1A3A2A" opacity="0.4" />
            </g>
          );
        })}

        {/* Revealed temperature data dots */}
        {revealedDots.map((dot, i) => {
          const age = sweepKm - dot.km;
          const fadeIn = Math.min(1, age / 2);
          const pulse = age < 2 ? 1 + 0.6 * Math.max(0, 1 - age / 1.5) : 1;
          const color = tempColor(dot.temp);
          return (
            <g key={i}>
              {/* Glow */}
              <circle
                cx={dot.x} cy={dot.y}
                r={4 * pulse + 3}
                fill={color}
                opacity={fadeIn * 0.15}
              />
              {/* Dot */}
              <circle
                cx={dot.x} cy={dot.y}
                r={4 * pulse}
                fill={color}
                opacity={fadeIn * 0.9}
                filter="url(#dotGlow)"
              />
            </g>
          );
        })}

        {/* Sweep line */}
        {progress > 0 && progress < 0.99 && (
          <line
            x1={sweepX} y1={MARGIN.top}
            x2={sweepX} y2={MARGIN.top + PLOT_H}
            stroke="#00C8B4" strokeWidth="1" opacity="0.25"
            filter="url(#sweepGlow)"
          />
        )}

        {/* Trawl geometry — only show during active sweep */}
        {progress > 0.02 && progress < 0.98 && (
          <g opacity={Math.min(1, progress * 10) * Math.min(1, (1 - progress) * 10)}>
            {/* Trawl wire (catenary curve from vessel to doors) */}
            <path
              d={`M${vesselX},${vesselY} Q${vesselX},${wireMidY} ${doorLeft},${trawlY}`}
              fill="none" stroke="#4A6A5A" strokeWidth="0.8" opacity="0.7"
            />
            <path
              d={`M${vesselX},${vesselY} Q${vesselX},${wireMidY} ${doorRight},${trawlY}`}
              fill="none" stroke="#4A6A5A" strokeWidth="0.8" opacity="0.7"
            />

            {/* Net between doors */}
            <path
              d={`M${doorLeft},${trawlY} L${doorLeft - 3},${trawlY + 8} L${doorRight + 3},${trawlY + 8} L${doorRight},${trawlY}`}
              fill="none" stroke="#3A5A4A" strokeWidth="0.6" opacity="0.5"
              strokeDasharray="2 1.5"
            />

            {/* Trawl doors */}
            <rect x={doorLeft - 3} y={trawlY - 2} width="6" height="4" rx="0.5"
              fill="none" stroke="#00C8B4" strokeWidth="1" opacity="0.8" />
            <rect x={doorRight - 3} y={trawlY - 2} width="6" height="4" rx="0.5"
              fill="none" stroke="#00C8B4" strokeWidth="1" opacity="0.8" />

            {/* NetSenz sensor on left door */}
            <circle cx={doorLeft} cy={trawlY} r="1.5" fill="#00C8B4" />
            <circle cx={doorLeft} cy={trawlY} r="3" fill="none" stroke="#00C8B4" strokeWidth="0.5" opacity="0.5" />

            {/* NetSenz label */}
            <text x={doorLeft + 8} y={trawlY - 5} fill="#00C8B4" fontSize="6" opacity="0.7">
              NetSenz
            </text>

            {/* Vessel icon (fishing boat) */}
            <g transform={`translate(${vesselX - 14}, ${vesselY - 22}) scale(0.055)`}>
              <path fill="#4A6A7A" d="M232.54 67.154l-17.08 5.692L241.513 151h18.976zM71.28 106.707l-14.56 10.586L71 136.928V230h18v-68.322L161.234 261h22.258zM272 117v18h39v16h18v-16h39v-18zm-23 52v126h108.943l-5.111-46H279v-80zm48 0v62h53.834l-6.889-62zM89 279v16h110v-16zm-70.012 34l41.248 110h319.68l114.25-110H140.588C157.022 318.35 169 333.85 169 352c0 22.537-18.463 41-41 41s-41-18.463-41-41c0-18.15 11.978-33.65 28.412-39zM128 329c-12.81 0-23 10.19-23 23s10.19 23 23 23 23-10.19 23-23-10.19-23-23-23zm208 0h80v18h-80zM96 439c-28.777 2.338-51.11 8.201-78.61 16.387l5.22 17.226C45.822 467.213 71.59 457.287 96 457c23.665 0 49.275 16 80 16s56.335-16 80-16 49.275 16 80 16 56.335-16 80-16c27.734 2.18 46.87 7.726 73.39 15.613l5.22-17.226C468.536 448.762 443.471 439.273 416 439c-30.725 0-56.335 16-80 16s-49.275-16-80-16-56.335 16-80 16-49.275-16-80-16z"/>
            </g>
          </g>
        )}

        {/* Tooltip on active dot */}
        {showTooltip && activeDot && (
          <g>
            <rect
              x={activeDot.x + 8} y={activeDot.y - 18}
              width="68" height="18" rx="3"
              fill="#0A0E14" stroke="#1E2D3D" strokeWidth="0.5" opacity="0.92"
            />
            <text x={activeDot.x + 12} y={activeDot.y - 5} fill="#E8EDF2" fontSize="7.5">
              {activeDot.temp.toFixed(1)}°C · {Math.round(activeDot.depth)}m
            </text>
          </g>
        )}

        {/* Top-left label */}
        <text x={MARGIN.left + 4} y={MARGIN.top + 12} fill="#7A8A9A" fontSize="7" opacity="0.6">
          LIVE TRACK SIMULATION
        </text>

        {/* Bottom km axis */}
        {[0, 10, 20, 30, 40].map(km => (
          <text key={km} x={kmToX(km)} y={H - 6} fill="#4A6A7A" fontSize="7" textAnchor="middle">
            {km}
          </text>
        ))}
        <text x={MARGIN.left + PLOT_W + 2} y={H - 6} fill="#4A6A7A" fontSize="7">
          km
        </text>

        {/* Temperature scale bar (bottom-right) */}
        <g transform={`translate(${W - 90}, ${H - 22})`}>
          <defs>
            <linearGradient id="tempScale" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E6FFF" />
              <stop offset="40%" stopColor="#00C8B4" />
              <stop offset="100%" stopColor="#FFB347" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="50" height="5" rx="2" fill="url(#tempScale)" />
          <text x="-2" y="4" fill="#4A6A7A" fontSize="6" textAnchor="end">10°C</text>
          <text x="52" y="4" fill="#4A6A7A" fontSize="6">18°C</text>
        </g>
      </svg>
    </div>
  );
}
