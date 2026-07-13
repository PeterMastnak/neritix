import verticalProfiles from '/public/data/sample_vertical_profiles.json';
import benthicTracks from '/public/data/sample_benthic_track.json';
import pricingMatrix from '/public/data/pricing_matrix.json';

export { verticalProfiles, benthicTracks, pricingMatrix };

// ── Pricing helpers ──────────────────────────────────────────────

export function getPrice(product, tier, area = 'full_basin') {
  const key = product === 'vertical' ? 'ShelfCast-Vertical' : 'ShelfCast-Benthic';
  const tierKey = tier === 'sub-hour' ? 'sub-hour' : tier === 'same-day' ? 'same-day' : 'delayed-72h';
  const base = pricingMatrix.products[key]?.tiers[tierKey];
  if (!base) return { monthly: 0, annual: 0 };
  const multiplier = pricingMatrix.volume_multipliers[area] ?? 1.0;
  return {
    monthly: Math.round(base.monthly_eur * multiplier),
    annual: Math.round(base.annual_eur * multiplier),
  };
}

export function getVolumeEstimate(product, tier, area = 'full_basin') {
  const key = product === 'vertical' ? 'ShelfCast-Vertical' : 'ShelfCast-Benthic';
  const tierKey = tier === 'sub-hour' ? 'sub-hour' : tier === 'same-day' ? 'same-day' : 'delayed-72h';
  const base = pricingMatrix.products[key]?.volume_estimates[tierKey] ?? 0;
  const multiplier = pricingMatrix.volume_multipliers[area] ?? 1.0;
  return Math.round(base * multiplier);
}

export function getVolumeUnit(product) {
  const key = product === 'vertical' ? 'ShelfCast-Vertical' : 'ShelfCast-Benthic';
  return pricingMatrix.products[key]?.volume_unit ?? '';
}

// ── Profile helpers ──────────────────────────────────────────────

export function getProfilesByRegion(region) {
  const bounds = {
    northern: { latMin: 44.5, latMax: 46 },
    central: { latMin: 42.5, latMax: 44.5 },
    southern: { latMin: 40, latMax: 42.5 },
  };
  const b = bounds[region];
  if (!b) return verticalProfiles.profiles;
  return verticalProfiles.profiles.filter(p => p.lat >= b.latMin && p.lat <= b.latMax);
}

export function getAllProfiles() {
  return verticalProfiles.profiles;
}

export function getAllTracks() {
  return benthicTracks.tracks;
}

// ── Map data helpers ─────────────────────────────────────────────

export function getProfileMapPoints() {
  return verticalProfiles.profiles.map(p => ({
    id: p.profile_id,
    lat: p.lat,
    lon: p.lon,
    surfaceTemp: p.temperature_c[0],
    thermoclineDepth: p.thermocline_depth_m,
    timestamp: p.timestamp_utc,
    vesselId: p.vessel_id,
    profile: p,
  }));
}

export function getBenthicMapPoints() {
  return benthicTracks.tracks.flatMap(track =>
    track.points.map(pt => ({
      trackId: track.track_id,
      vesselId: track.vessel_id,
      lat: pt.lat,
      lon: pt.lon,
      depth: pt.depth_m,
      temp: pt.bottom_temp_c,
      timestamp: pt.timestamp_utc,
    }))
  );
}

// ── Temperature color scale ──────────────────────────────────────

export function tempToColor(temp, min = 10, max = 28) {
  const t = Math.max(0, Math.min(1, (temp - min) / (max - min)));
  // Blue (#1E6FFF) → Teal (#00C8B4) → Amber (#FFB347)
  if (t < 0.5) {
    const f = t * 2;
    const r = Math.round(30 + (0 - 30) * f);
    const g = Math.round(111 + (200 - 111) * f);
    const b = Math.round(255 + (180 - 255) * f);
    return `rgb(${r},${g},${b})`;
  }
  const f = (t - 0.5) * 2;
  const r = Math.round(0 + (255 - 0) * f);
  const g = Math.round(200 + (179 - 200) * f);
  const b = Math.round(180 + (71 - 180) * f);
  return `rgb(${r},${g},${b})`;
}

// ── Table data for Data Preview ──────────────────────────────────

export function getTableRows(limit = 20) {
  const rows = [];
  for (const p of verticalProfiles.profiles.slice(0, Math.ceil(limit / 8))) {
    for (let i = 0; i < p.depth_levels.length; i++) {
      rows.push({
        timestamp: p.timestamp_utc,
        lat: p.lat,
        lon: p.lon,
        depth: p.depth_levels[i],
        temp: p.temperature_c[i],
        salinity: p.salinity_psu[i],
        qcFlag: p.qc_flag[i],
      });
      if (rows.length >= limit) return rows;
    }
  }
  return rows;
}
