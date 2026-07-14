import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../App';
import {
  getPrice,
  getVolumeEstimate,
  getVolumeUnit,
  getAllProfiles,
  getAllTracks,
  getBenthicMapPoints,
  getTableRows,
  tempToColor,
} from '../data/syntheticData';

// ── Control Panel ────────────────────────────────────────────────

function ControlPanel({ product, setProduct, tier, setTier, area, setArea, onInquiry }) {
  const price = getPrice(product, tier, area);
  const volume = getVolumeEstimate(product, tier, area);
  const unit = getVolumeUnit(product);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase">Data Selector</h3>

      {/* Product */}
      <div>
        <label className="font-mono text-xs tracking-wider text-text-muted uppercase block mb-2">Product</label>
        <div className="space-y-2">
          {[
            { value: 'vertical', label: 'ShelfCast-Vertical™' },
            { value: 'benthic', label: 'ShelfCast-Benthic™' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProduct(opt.value)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                product === opt.value
                  ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/30'
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {product === opt.value ? '● ' : '○ '}{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Latency Tier */}
      <div>
        <label className="font-mono text-xs tracking-wider text-text-muted uppercase block mb-2">Latency Tier</label>
        <div className="space-y-2">
          {[
            { value: 'sub-hour', label: 'Sub-hour NRT' },
            { value: 'same-day', label: 'Same-day' },
            { value: 'delayed-72h', label: 'Delayed (72h)' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTier(opt.value)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                tier === opt.value
                  ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/30'
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {tier === opt.value ? '● ' : '○ '}{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="font-mono text-xs tracking-wider text-text-muted uppercase block mb-2">Date Range</label>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="bg-surface border border-border rounded px-3 py-1.5 font-mono text-xs">Jan 2025</span>
          <span className="text-border">——</span>
          <span className="bg-surface border border-border rounded px-3 py-1.5 font-mono text-xs">Dec 2025</span>
        </div>
      </div>

      {/* Area */}
      <div>
        <label className="font-mono text-xs tracking-wider text-text-muted uppercase block mb-2">Area of Interest</label>
        <div className="flex gap-2">
          {[
            { value: 'full_basin', label: 'Full Basin' },
            { value: 'custom_area', label: 'Custom Area' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setArea(opt.value)}
              className={`flex-1 px-3 py-2 rounded text-xs font-mono transition-colors cursor-pointer ${
                area === opt.value
                  ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/30'
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Volume Estimate */}
      <div>
        <label className="font-mono text-xs tracking-wider text-text-muted uppercase block mb-1">
          Estimated Volume
        </label>
        <motion.span
          key={volume}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-2xl font-bold text-text-primary"
        >
          {volume.toLocaleString()}
        </motion.span>
        <span className="text-text-muted text-xs ml-2">{unit}</span>
      </div>

      {/* Price */}
      <div>
        <label className="font-mono text-xs tracking-wider text-text-muted uppercase block mb-1">
          Price Estimate
        </label>
        <motion.span
          key={price.monthly}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-2xl font-bold text-accent-teal"
        >
          €{price.monthly.toLocaleString()}
        </motion.span>
        <span className="text-text-muted text-sm ml-1">/ month</span>
        <p className="text-text-muted text-xs mt-1">
          Annual: €{price.annual.toLocaleString()} / yr
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onInquiry}
        className="w-full py-3 bg-accent-teal text-bg font-medium rounded text-sm
                   hover:bg-[#00b3a1] transition-colors cursor-pointer"
      >
        Add to Inquiry →
      </button>
      <p className="text-text-muted text-[10px] text-center">
        Enterprise &amp; SLA pricing available on request
      </p>
    </div>
  );
}

// ── Thermocline SVG Builder ──────────────────────────────────────

function buildThermoclineSVG(profile) {
  const depths = profile.depth_levels;
  const temps = profile.temperature_c;
  const thermD = profile.thermocline_depth_m;

  // Chart dimensions
  const W = 120, H = 180;
  const pad = { top: 16, right: 8, bottom: 20, left: 28 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const maxDepth = Math.max(...depths);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempPad = (maxTemp - minTemp) * 0.15 || 1;
  const tMin = minTemp - tempPad;
  const tMax = maxTemp + tempPad;

  const x = (t) => pad.left + ((t - tMin) / (tMax - tMin)) * cw;
  const y = (d) => pad.top + (d / maxDepth) * ch;

  // Build path
  const pts = depths.map((d, i) => [x(temps[i]), y(d)]);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  // Depth tick values (up to 4 ticks)
  const depthTicks = [];
  const step = maxDepth <= 100 ? 25 : maxDepth <= 200 ? 50 : 100;
  for (let d = 0; d <= maxDepth; d += step) depthTicks.push(d);
  if (depthTicks[depthTicks.length - 1] < maxDepth) depthTicks.push(maxDepth);

  // Temp tick values (min and max rounded)
  const tLow = Math.ceil(minTemp);
  const tHigh = Math.floor(maxTemp);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="display:block">`;

  // Grid lines (horizontal at depth ticks)
  for (const d of depthTicks) {
    svg += `<line x1="${pad.left}" y1="${y(d).toFixed(1)}" x2="${W - pad.right}" y2="${y(d).toFixed(1)}" stroke="#1E2D3D" stroke-width="0.5" stroke-dasharray="3,2"/>`;
  }

  // Thermocline dashed line
  if (thermD != null && thermD <= maxDepth) {
    const ty = y(thermD).toFixed(1);
    svg += `<line x1="${pad.left}" y1="${ty}" x2="${W - pad.right}" y2="${ty}" stroke="#FFB347" stroke-width="1" stroke-dasharray="4,2"/>`;
    svg += `<text x="${W - pad.right}" y="${ty - 3}" fill="#FFB347" font-size="7" font-family="monospace" text-anchor="end">TCL ${thermD}m</text>`;
  }

  // Profile line
  svg += `<polyline points="${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="#00C8B4" stroke-width="1.5" stroke-linejoin="round"/>`;

  // Data point dots
  for (const p of pts) {
    svg += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.5" fill="#00C8B4"/>`;
  }

  // Y-axis depth labels
  for (const d of depthTicks) {
    svg += `<text x="${pad.left - 3}" y="${(y(d) + 3).toFixed(1)}" fill="#7A8A9A" font-size="7" font-family="monospace" text-anchor="end">${d}</text>`;
  }

  // X-axis temp labels
  svg += `<text x="${x(tLow).toFixed(1)}" y="${H - 4}" fill="#7A8A9A" font-size="7" font-family="monospace" text-anchor="middle">${tLow}°</text>`;
  if (tHigh !== tLow) {
    svg += `<text x="${x(tHigh).toFixed(1)}" y="${H - 4}" fill="#7A8A9A" font-size="7" font-family="monospace" text-anchor="middle">${tHigh}°</text>`;
  }

  // Axis label
  svg += `<text x="${pad.left + cw / 2}" y="${10}" fill="#7A8A9A" font-size="7" font-family="monospace" text-anchor="middle">°C</text>`;

  svg += `</svg>`;
  return svg;
}

// ── Map View (Mapbox) ────────────────────────────────────────────

function MapView({ product }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const initMap = useCallback(async () => {
    if (mapRef.current || !mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || token === 'your_mapbox_token_here') {
      setError('Set VITE_MAPBOX_TOKEN in .env.local to enable the map.');
      return;
    }

    const mapboxgl = (await import('mapbox-gl')).default;
    await import('mapbox-gl/dist/mapbox-gl.css');

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [15.5, 43.5],
      zoom: 6,
    });

    map.on('load', () => {
      setLoaded(true);
      addDataLayers(map, mapboxgl);
    });

    mapRef.current = map;
  }, []);

  function addDataLayers(map, mapboxgl) {
    // Benthic track points
    const benthicPts = getBenthicMapPoints();
    map.addSource('benthic', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: benthicPts.map((pt) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [pt.lon, pt.lat] },
          properties: { temp: pt.temp, depth: pt.depth, vessel: pt.vesselId },
        })),
      },
    });
    map.addLayer({
      id: 'benthic-dots',
      type: 'circle',
      source: 'benthic',
      paint: {
        'circle-radius': 3,
        'circle-color': [
          'interpolate', ['linear'], ['get', 'temp'],
          10, '#1E6FFF',
          18, '#00C8B4',
          28, '#FFB347',
        ],
        'circle-opacity': 0.75,
      },
    });

    // Vertical profile markers
    const profiles = getAllProfiles();
    map.addSource('profiles', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: profiles.map((p) => {
          const meanTemp = p.temperature_c.reduce((a, b) => a + b, 0) / p.temperature_c.length;
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
            properties: {
              id: p.profile_id,
              meanTemp: Math.round(meanTemp * 10) / 10,
              vessel: p.vessel_id,
              timestamp: p.timestamp_utc,
            },
          };
        }),
      },
    });
    map.addLayer({
      id: 'profile-markers',
      type: 'circle',
      source: 'profiles',
      paint: {
        'circle-radius': 6,
        'circle-color': [
          'interpolate', ['linear'], ['get', 'meanTemp'],
          10, '#1E6FFF',
          18, '#00C8B4',
          28, '#FFB347',
        ],
        'circle-stroke-color': '#0A0E14',
        'circle-stroke-width': 2,
        'circle-opacity': 0.9,
      },
    });

    // Popup on profile click
    map.on('click', 'profile-markers', (e) => {
      const props = e.features[0].properties;
      const profile = profiles.find((p) => p.profile_id === props.id);
      if (!profile) return;

      const depthTemps = profile.depth_levels
        .map((d, i) => `<tr><td style="padding:1px 6px;color:#7A8A9A">${d}m</td><td style="padding:1px 6px;color:#00C8B4">${profile.temperature_c[i]}°C</td></tr>`)
        .join('');

      const svgChart = buildThermoclineSVG(profile);

      new mapboxgl.Popup({ closeButton: false, maxWidth: '340px' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;background:#141F2E;padding:8px;border-radius:6px">
            <div style="color:#E8EDF2;margin-bottom:4px;font-weight:600">${props.id}</div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <table>${depthTemps}</table>
              ${svgChart}
            </div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', 'profile-markers', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'profile-markers', () => { map.getCanvas().style.cursor = ''; });

    // Layer visibility based on product
    updateLayerVisibility(map, 'vertical');
  }

  function updateLayerVisibility(map, prod) {
    if (!map || !map.getLayer('benthic-dots')) return;
    map.setLayoutProperty('benthic-dots', 'visibility', prod === 'benthic' ? 'visible' : 'none');
    map.setLayoutProperty('profile-markers', 'visibility', prod === 'vertical' ? 'visible' : 'none');
  }

  useEffect(() => { initMap(); }, [initMap]);

  useEffect(() => {
    if (mapRef.current && loaded) {
      updateLayerVisibility(mapRef.current, product);
    }
  }, [product, loaded]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[350px] sm:h-[600px] lg:h-[700px] rounded-lg overflow-hidden border border-border bg-surface">
      {error ? (
        <div className="flex items-center justify-center h-full text-text-muted text-sm px-6 text-center">
          <div>
            <p className="mb-2">Map unavailable</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="w-full h-full" />
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface">
              <div className="w-8 h-8 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Temperature legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
            <p className="font-mono text-[10px] text-text-muted mb-1.5">Temperature</p>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-text-muted">10°C</span>
              <div className="w-24 h-2.5 rounded-full" style={{
                background: 'linear-gradient(to right, #1E6FFF, #00C8B4, #FFB347)',
              }} />
              <span className="font-mono text-[10px] text-text-muted">28°C</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Data Preview Table ───────────────────────────────────────────

function DataPreview() {
  const rows = getTableRows(20);

  function downloadCSV() {
    const headers = 'TIMESTAMP_UTC,LAT,LON,DEPTH_M,TEMP_C,SALINITY_PSU,QC_FLAG\n';
    const csv = headers + rows.map((r) =>
      `${r.timestamp},${r.lat},${r.lon},${r.depth},${r.temp},${r.salinity},${r.qcFlag}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neritix_sample_vertical.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-full overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border">
              {['TIMESTAMP UTC', 'LAT', 'LON', 'DEPTH(m)', 'TEMP(°C)', 'SAL(psu)', 'QC'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-text-muted font-medium tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-surface'}>
                <td className="px-3 py-2 text-text-muted whitespace-nowrap">{r.timestamp.replace('T', ' ').replace('Z', '')}</td>
                <td className="px-3 py-2 text-text-primary">{r.lat}</td>
                <td className="px-3 py-2 text-text-primary">{r.lon}</td>
                <td className="px-3 py-2 text-text-primary">{r.depth}</td>
                <td className="px-3 py-2 text-accent-teal">{r.temp}</td>
                <td className="px-3 py-2 text-text-primary">{r.salinity}</td>
                <td className="px-3 py-2 text-accent-teal">{r.qcFlag}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="sm:hidden space-y-2">
        {rows.slice(0, 12).map((r, i) => (
          <div key={i} className={`${i % 2 === 0 ? 'bg-card' : 'bg-surface'} border border-border rounded-lg p-3 font-mono text-[11px]`}>
            <div className="text-text-muted mb-1.5">{r.timestamp.replace('T', ' ').replace('Z', '')}</div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1">
              <div><span className="text-text-muted">LAT </span><span className="text-text-primary">{r.lat}</span></div>
              <div><span className="text-text-muted">LON </span><span className="text-text-primary">{r.lon}</span></div>
              <div><span className="text-text-muted">D </span><span className="text-text-primary">{r.depth}m</span></div>
              <div><span className="text-text-muted">T </span><span className="text-accent-teal">{r.temp}°C</span></div>
              <div><span className="text-text-muted">S </span><span className="text-text-primary">{r.salinity}</span></div>
              <div><span className="text-text-muted">QC </span><span className="text-accent-teal">{r.qcFlag}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={downloadCSV}
          className="px-4 py-2 text-xs font-mono border border-border rounded text-text-muted
                     hover:text-text-primary hover:border-text-muted transition-colors cursor-pointer"
        >
          Download Sample CSV
        </button>
        <button className="px-4 py-2 text-xs font-mono text-accent-teal hover:underline cursor-pointer">
          View Full Schema →
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export default function DataSelector() {
  const { openModal } = useApp();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const [product, setProduct] = useState('vertical');
  const [tier, setTier] = useState('sub-hour');
  const [area, setArea] = useState('full_basin');
  const [tab, setTab] = useState('map');

  return (
    <section id="data-selector" ref={ref} className="py-24 sm:py-32 px-6 bg-surface relative overflow-hidden">
      {/* DEMO watermark */}
      <div className="absolute top-6 right-6 font-mono text-[10px] tracking-widest text-text-muted/40 uppercase">
        Demo — Not Real Data
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-text-primary text-center mb-4"
        >
          Explore Data Productssssss
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-text-muted text-center mb-12 max-w-lg mx-auto"
        >
          Configure your data subscription and preview synthetic sample data.
        </motion.p>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Left: Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:sticky lg:top-20"
          >
            <ControlPanel
              product={product} setProduct={setProduct}
              tier={tier} setTier={setTier}
              area={area} setArea={setArea}
              onInquiry={openModal}
            />
          </motion.div>

          {/* Right: Map + Data Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Tabs */}
            <div className="flex gap-1 mb-4">
              {['map', 'data'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    tab === t
                      ? 'bg-card border border-accent-teal/30 text-accent-teal'
                      : 'bg-card border border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {t === 'map' ? 'Map View' : 'Data Preview'}
                </button>
              ))}
            </div>

            {tab === 'map' ? (
              <MapView product={product} />
            ) : (
              <DataPreview />
            )}

            {/* Sample table header */}
            {tab === 'map' && (
              <p className="mt-4 font-mono text-[10px] text-text-muted tracking-wider">
                SAMPLE DATASET — {product === 'vertical' ? 'ShelfCast-Vertical™' : 'ShelfCast-Benthic™'} — 2025 (SYNTHETIC DEMO)
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
