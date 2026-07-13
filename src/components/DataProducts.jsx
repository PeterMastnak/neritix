import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import BenthicCrossSection from './BenthicCrossSection';
import { useApp } from '../App';

// ── Tanh thermocline model (201 points, 0–200 m) ────────────────

const T_SURFACE = 24.2;
const T_DEEP = 11.5;
const Z_CENTER = 45;      // thermocline midpoint (m)
const D = 12;              // half-width scale (m)
const MLD = 15;            // mixed layer depth (m)
const Z_UPPER = 22;        // ELG upper boundary
const Z_LOWER = 68;        // ELG lower boundary

function generateProfile() {
  const pts = [];
  for (let z = 0; z <= 200; z++) {
    const base = T_DEEP + (T_SURFACE - T_DEEP) / 2 * (1 - Math.tanh((z - Z_CENTER) / D));
    // deterministic micro-noise for realism
    const noise =
      0.08 * Math.sin(z * 0.7) +
      0.05 * Math.cos(z * 1.3) +
      0.03 * Math.sin(z * 2.1 + 1.2);
    pts.push({ depth: z, temp: Math.round((base + noise) * 100) / 100 });
  }
  // centered finite-difference gradient dT/dz
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) pts[i].grad = pts[1].temp - pts[0].temp;
    else if (i === pts.length - 1) pts[i].grad = pts[i].temp - pts[i - 1].temp;
    else pts[i].grad = (pts[i + 1].temp - pts[i - 1].temp) / 2;
    pts[i].grad = Math.round(pts[i].grad * 1000) / 1000; // °C/m
  }
  // scale |gradient| into temperature domain for single-axis overlay
  const maxAbsGrad = Math.max(...pts.map((p) => Math.abs(p.grad)));
  for (const p of pts) {
    p.gradScaled = Math.round((Math.abs(p.grad) / maxAbsGrad) * 6 * 100) / 100 + 10;
  }
  return pts;
}

const profileData = generateProfile();

function VerticalProfileChart({ animate }) {
  return (
    <div className="flex flex-col">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={profileData}
            layout="vertical"
            margin={{ top: 10, right: 60, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="2 4" stroke="#1E2D3D" opacity={0.5} />

            {/* Thermocline zone shading (ELG boundaries) */}
            <ReferenceArea
              y1={Z_UPPER} y2={Z_LOWER}
              fill="#D97706" fillOpacity={0.08}
              ifOverflow="extendDomain"
            />

            <XAxis
              type="number"
              dataKey="temp"
              domain={[10, 26]}
              tickCount={9}
              tick={{ fontSize: 10, fill: '#7A8A9A', fontFamily: 'JetBrains Mono, monospace' }}
              label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#7A8A9A' }}
              stroke="#1E2D3D"
            />
            <YAxis
              type="number"
              dataKey="depth"
              domain={[0, 200]}
              tickCount={9}
              tick={{ fontSize: 10, fill: '#7A8A9A', fontFamily: 'JetBrains Mono, monospace' }}
              label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#7A8A9A' }}
              stroke="#1E2D3D"
            />

            <Tooltip
              contentStyle={{
                background: '#141F2E',
                border: '1px solid #1E2D3D',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}
              labelStyle={{ color: '#7A8A9A' }}
              formatter={(val, name) => {
                if (name === 'temp') return [`${val} °C`, 'T(z)'];
                if (name === 'gradScaled') return [`${profileData.find((p) => Math.abs(p.gradScaled - val) < 0.01)?.grad ?? '—'} °C/m`, 'dT/dz'];
                return [val, name];
              }}
              labelFormatter={(val) => `${val} m`}
            />

            {/* Gradient area fill (scaled into temp domain) */}
            <Area
              type="monotone"
              dataKey="gradScaled"
              fill="#D97706"
              fillOpacity={0.15}
              stroke="#D97706"
              strokeWidth={0.5}
              strokeOpacity={0.4}
              isAnimationActive={animate}
              animationDuration={1800}
              animationEasing="ease-in-out"
              dot={false}
            />

            {/* Temperature profile line */}
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#00C8B4"
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={animate}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />

            {/* Reference lines */}
            <ReferenceLine
              y={MLD}
              stroke="#3B82F6"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: 'MLD', position: 'right', fontSize: 9, fill: '#3B82F6', fontFamily: 'JetBrains Mono, monospace' }}
            />
            <ReferenceLine
              y={Z_UPPER}
              stroke="#D97706"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: 'Δz upper', position: 'right', fontSize: 9, fill: '#D97706', fontFamily: 'JetBrains Mono, monospace' }}
            />
            <ReferenceLine
              y={Z_LOWER}
              stroke="#D97706"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: 'Δz lower', position: 'right', fontSize: 9, fill: '#D97706', fontFamily: 'JetBrains Mono, monospace' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Compact legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 px-1 text-[10px] font-mono text-text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-[2px] bg-accent-teal rounded" /> T(z)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 bg-amber/20 border border-amber/40 rounded-sm" /> dT/dz
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-[1px] border-t border-dashed border-amber" /> ELG bounds
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-[1px] border-t border-dashed border-blue-500" /> MLD
        </span>
      </div>
    </div>
  );
}

// BenthicCrossSection imported above

// ── Features ─────────────────────────────────────────────────────

const verticalFeatures = [
  '<1hr latency',
  'Water-column QC certified',
  'Aspect ratio qualification',
  'NetCDF / JSON delivery',
];

const benthicFeatures = [
  '±0.05°C accuracy',
  'Georeferenced points',
  'Continuous track coverage',
  'CSV / GeoJSON delivery',
];

// ── Main Component ───────────────────────────────────────────────

export default function DataProducts() {
  const { showToast } = useApp();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="products" ref={ref} className="py-24 sm:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-text-primary text-center mb-16"
        >
          Data Products
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ShelfCast-Vertical */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-heading text-xl font-bold text-text-primary whitespace-nowrap">
                ShelfCast-Vertical™
              </h3>
              <span className="shrink-0 text-[10px] font-mono tracking-wider text-amber bg-amber/10 px-2 py-0.5 rounded mt-1">
                LAUNCHING 2026
              </span>
            </div>
            <p className="text-text-muted text-sm mb-4">
              High-resolution vertical thermocline profiles
            </p>

            <VerticalProfileChart animate={inView} />

            <ul className="mt-4 space-y-2">
              {verticalFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="text-accent-teal text-xs">●</span>
                  {f}
                </li>
              ))}
            </ul>

            <button onClick={() => showToast('Spec sheet coming soon.')} className="mt-5 text-sm text-accent-teal hover:underline cursor-pointer">
              View Spec Sheet →
            </button>
          </motion.div>

          {/* ShelfCast-Benthic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-heading text-xl font-bold text-text-primary whitespace-nowrap">
                ShelfCast-Benthic™
              </h3>
              <span className="shrink-0 text-[10px] font-mono tracking-wider text-amber bg-amber/10 px-2 py-0.5 rounded mt-1">
                LAUNCHING 2026
              </span>
            </div>
            <p className="text-text-muted text-sm mb-4">
              Georeferenced benthic temperature tracks
            </p>

            <BenthicCrossSection animate={inView} />

            <ul className="mt-4 space-y-2">
              {benthicFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="text-accent-teal text-xs">●</span>
                  {f}
                </li>
              ))}
            </ul>

            <button onClick={() => showToast('Spec sheet coming soon.')} className="mt-5 text-sm text-accent-teal hover:underline cursor-pointer">
              View Spec Sheet →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
