import { useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

// ── Syntax highlighters ──────────────────────────────────────────

// Single-pass JSON tokenizer — no re-processing conflicts
function highlightJSON(code) {
  return code.replace(
    /("(?:[^"\\]|\\.)*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\b\d+\.?\d*(?:[eE][+-]?\d+)?\b)|([{}[\]])/g,
    (match, str, colon, bool, num, punct) => {
      if (str && colon) return `<span style="color:#E8EDF2">${str}</span>${colon}`;
      if (str) return `<span style="color:#00C8B4">${str}</span>`;
      if (bool) return `<span style="color:#FFB347">${bool}</span>`;
      if (num) return `<span style="color:#FFB347">${num}</span>`;
      if (punct) return `<span style="color:#7A8A9A">${punct}</span>`;
      return match;
    }
  );
}

// Line-by-line REST highlighter — each line processed once
function highlightREST(code) {
  return code.split('\n').map((line) => {
    if (line.startsWith('#')) return `<span style="color:#4A6A7A">${line}</span>`;
    if (/^\s*(GET|POST|PUT|DELETE|PATCH)\b/.test(line))
      return line.replace(/^(\s*)(GET|POST|PUT|DELETE|PATCH)(\s+)(\S+)/, (_, sp, method, gap, url) =>
        `${sp}<span style="color:#1E6FFF;font-weight:600">${method}</span>${gap}<span style="color:#00C8B4">${url}</span>`);
    if (/^\s+\w[\w_]*\s+(string|float|int|int\[\]|ISO8601)\s+/.test(line))
      return line.replace(/^(\s+)(\w[\w_]*)(\s+)(string|float|int|int\[\]|ISO8601)(\s+)(.*)/, (_, sp, name, s1, type, s2, val) =>
        `${sp}<span style="color:#E8EDF2">${name}</span>${s1}<span style="color:#7A8A9A">${type}</span>${s2}<span style="color:#00C8B4">${val}</span>`);
    if (/^\s+[\w-]+:\s+/.test(line))
      return line.replace(/^(\s+)([\w-]+:)(\s+)(.*)/, (_, sp, key, gap, val) =>
        `${sp}<span style="color:#E8EDF2">${key}</span>${gap}<span style="color:#00C8B4">${val}</span>`);
    return line;
  }).join('\n');
}

// Plain text — no highlighting, just return as-is
function plainText(code) { return code; }

// ── Code block content ───────────────────────────────────────────

const REST_API = `# Authenticate
GET https://api.neritix.io/v1/profiles

Headers:
  Authorization: Bearer NTX_sk_live_••••••••••••••
  Accept: application/json

Query Parameters:
  basin         string    "adriatic" | "mediterranean"
  product       string    "vertical" | "benthic"
  lat_min       float     41.0
  lat_max       float     45.8
  lon_min       float     12.0
  lon_max       float     19.5
  date_from     ISO8601   2025-03-01T00:00:00Z
  date_to       ISO8601   2025-03-31T23:59:59Z
  latency_tier  string    "nrt" | "same-day" | "delayed"
  qc_flag       int[]     [1] (1 = good)
  limit         int       100 (max 1000)
  offset        int       0`;

const REST_RESPONSE_VERTICAL = `{
  "meta": {
    "product": "ShelfCast-Vertical",
    "version": "1.0",
    "basin": "adriatic",
    "latency_tier": "nrt",
    "records_returned": 2,
    "records_total": 847,
    "generated_utc": "2025-03-14T07:02:11Z",
    "provider": "NERITIX® / BlueTraker FVON",
    "license": "subscription-commercial-v1"
  },
  "profiles": [
    {
      "profile_id": "NTX-V-2025-0314-0042",
      "vessel_id": "BT-V047",
      "timestamp_utc": "2025-03-14T06:12:33Z",
      "lat": 44.2341,
      "lon": 13.8921,
      "position_accuracy_m": 3,
      "depth_levels_m": [5, 10, 25, 50, 75, 100, 150, 200],
      "temperature_c": [18.2, 17.9, 15.1, 12.4, 11.8, 11.6, 11.3, 11.1],
      "salinity_psu": [38.1, 38.2, 38.4, 38.6, 38.7, 38.7, 38.8, 38.8],
      "qc_flag": [1, 1, 1, 1, 1, 1, 2, 1],
      "thermocline_depth_m": 28,
      "thermocline_strength_c_per_m": 0.24,
      "mixed_layer_depth_m": 18,
      "ar_percentile": 0.94,
      "oct_threshold_met": true,
      "latency_s": 1847,
      "processing_level": "L2-QC"
    },
    {
      "profile_id": "NTX-V-2025-0314-0043",
      "vessel_id": "BT-V112",
      "timestamp_utc": "2025-03-14T06:31:07Z",
      "lat": 43.7821,
      "lon": 15.2103,
      "position_accuracy_m": 3,
      "depth_levels_m": [5, 10, 25, 50, 75, 100],
      "temperature_c": [17.8, 17.6, 14.9, 12.1, 11.7, 11.5],
      "salinity_psu": [38.0, 38.1, 38.3, 38.6, 38.7, 38.7],
      "qc_flag": [1, 1, 1, 1, 1, 1],
      "thermocline_depth_m": 31,
      "thermocline_strength_c_per_m": 0.19,
      "mixed_layer_depth_m": 20,
      "ar_percentile": 0.91,
      "oct_threshold_met": true,
      "latency_s": 2134,
      "processing_level": "L2-QC"
    }
  ]
}`;

const REST_RESPONSE_BENTHIC = `{
  "meta": {
    "product": "ShelfCast-Benthic",
    "version": "1.0",
    "basin": "adriatic",
    "latency_tier": "nrt",
    "records_returned": 1,
    "generated_utc": "2025-03-14T07:02:11Z"
  },
  "tracks": [
    {
      "track_id": "NTX-B-2025-0314-V047",
      "vessel_id": "BT-V047",
      "date_utc": "2025-03-14",
      "sensor_type": "NetSenz-TD",
      "sensor_position": "trawl_door_starboard",
      "points": [
        {
          "timestamp_utc": "2025-03-14T04:00:12Z",
          "lat": 44.8821,
          "lon": 13.2341,
          "bottom_depth_m": 42,
          "bottom_temp_c": 11.8,
          "temp_accuracy_c": 0.04,
          "height_above_bottom_m": 0.8,
          "qc_flag": 1,
          "speed_over_ground_kn": 2.8
        },
        {
          "timestamp_utc": "2025-03-14T04:02:44Z",
          "lat": 44.8798,
          "lon": 13.2289,
          "bottom_depth_m": 44,
          "bottom_temp_c": 11.6,
          "temp_accuracy_c": 0.04,
          "height_above_bottom_m": 1.1,
          "qc_flag": 1,
          "speed_over_ground_kn": 2.9
        }
      ],
      "track_summary": {
        "total_points": 312,
        "distance_km": 38.4,
        "depth_range_m": [38, 94],
        "temp_range_c": [11.2, 13.8],
        "temp_mean_c": 12.1,
        "duration_minutes": 187
      }
    }
  ]
}`;

const REST_ERROR = `{
  "error": {
    "code": "INSUFFICIENT_COVERAGE",
    "message": "Requested area has &lt;40% vessel coverage for the specified period.",
    "coverage_pct": 31,
    "suggestion": "Expand date range or reduce area of interest.",
    "docs": "https://docs.neritix.io/errors#INSUFFICIENT_COVERAGE"
  }
}`;

const PYTHON_SDK = `# pip install neritix-sdk

import neritix

client = neritix.Client(api_key="NTX_sk_live_••••••••")

# Fetch vertical profiles — Adriatic, March 2025
profiles = client.vertical.list(
    basin="adriatic",
    date_from="2025-03-01",
    date_to="2025-03-31",
    latency_tier="nrt",
    qc_flag=[1],           # good data only
    bbox=[12.0, 41.0, 19.5, 45.8]
)

# Returns a pandas DataFrame
df = profiles.to_dataframe()
print(df.head())

#    profile_id              timestamp_utc    lat    lon  depth_m  temp_c
#    NTX-V-2025-0314-0042   2025-03-14T06:12  44.23  13.89     5    18.2
#    NTX-V-2025-0314-0042   2025-03-14T06:12  44.23  13.89    25    15.1
#    ...

# Export to NetCDF (CF-1.8 compliant)
profiles.to_netcdf("adriatic_march_2025.nc")

# Stream benthic track in real time
for point in client.benthic.stream(vessel_id="BT-V047"):
    print(f"{point.timestamp_utc} | {point.lat:.4f} | "
          f"{point.bottom_temp_c}°C | {point.bottom_depth_m}m")`;

const NETCDF_SCHEMA = `File: NTX-V-adriatic-202503.nc
Convention: CF-1.8
Featuretype: trajectoryProfile

Dimensions:
  profile   = 847
  depth     = 8      (UNLIMITED)

Variables:
  float     temperature(profile, depth)
              units:          degrees_Celsius
              standard_name:  sea_water_temperature
              long_name:      Sea water temperature
              valid_min:      -2.0
              valid_max:      40.0
              _FillValue:     9.96921e+36
              coordinates:    time lat lon depth

  float     salinity(profile, depth)
              units:          1e-3 (psu)
              standard_name:  sea_water_practical_salinity
              valid_min:      0.0
              valid_max:      42.0

  byte      qc_flag(profile, depth)
              long_name:      Quality Control Flag
              flag_values:    0 1 2 3 4
              flag_meanings:  no_qc good probably_good
                              probably_bad bad
              conventions:    OceanSITES QC v1.3

  float     thermocline_depth(profile)
              units:          m
              long_name:      Mixed layer / thermocline depth estimate

  float     ar_percentile(profile)
              long_name:      Aspect ratio qualification percentile
              valid_min:      0.0
              valid_max:      1.0

Global Attributes:
  Conventions:      CF-1.8, OceanSITES-1.3
  title:            NERITIX ShelfCast-Vertical Adriatic Basin
  institution:      NERITIX / BlueTraker FVON Network
  source:           fishing_vessel_CTD_profiler
  platform_type:    fishing_vessel
  sensor_type:      NetSenz-TD
  processing_level: L2-QC
  license:          NERITIX Commercial Subscription License v1
  doi:              10.xxxxx/neritix.adriatic.2025`;

// ── Tab content config ───────────────────────────────────────────

const TABS = [
  { key: 'rest', label: 'REST API' },
  { key: 'python', label: 'Python SDK' },
  { key: 'netcdf', label: 'NetCDF Schema' },
];

// ── Copy button ──────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-mono rounded
                 border border-border text-text-muted hover:text-text-primary
                 hover:border-text-muted transition-all cursor-pointer z-10"
    >
      {copied ? <span className="text-accent-teal">Copied &#10003;</span> : 'Copy'}
    </button>
  );
}

// ── Code block component ─────────────────────────────────────────

function CodeBlock({ code, highlighter, copyText }) {
  const highlighted = highlighter(code);
  return (
    <div className="relative">
      <CopyButton text={copyText || code} />
      <pre
        className="overflow-x-auto p-4 pt-10 text-[11px] sm:text-xs leading-relaxed"
        style={{ background: '#0A0E14' }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export default function ApiDocs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [activeTab, setActiveTab] = useState('rest');

  return (
    <section id="api-docs" ref={ref} className="py-24 sm:py-32 px-6 bg-bg relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4 justify-center"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
            API &amp; Data Schema
          </h2>
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-accent-teal/10 text-accent-teal border border-accent-teal/30 rounded">
            Beta
          </span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-text-muted text-center mb-10 max-w-lg mx-auto"
        >
          Integrate ShelfCast data into your operational pipeline. CF-1.8 compliant, OceanSITES QC conventions.
        </motion.p>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex gap-1 mb-0">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === key
                    ? 'bg-[#0A0E14] text-accent-teal border border-border border-b-[#0A0E14]'
                    : 'bg-card text-text-muted hover:text-text-primary border border-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Code panel */}
          <div className="border border-border rounded-b-lg rounded-tr-lg overflow-hidden" style={{ background: '#0A0E14' }}>
            {activeTab === 'rest' && (
              <div className="font-mono">
                {/* Request */}
                <div className="border-b border-border">
                  <div className="px-4 py-2 text-[10px] text-text-muted tracking-widest uppercase bg-card/30">
                    Request
                  </div>
                  <CodeBlock code={REST_API} highlighter={highlightREST} />
                </div>

                {/* Response — Vertical */}
                <div className="border-b border-border">
                  <div className="px-4 py-2 text-[10px] text-text-muted tracking-widest uppercase bg-card/30">
                    Response — ShelfCast-Vertical
                  </div>
                  <CodeBlock code={REST_RESPONSE_VERTICAL} highlighter={highlightJSON} />
                </div>

                {/* Response — Benthic */}
                <div className="border-b border-border">
                  <div className="px-4 py-2 text-[10px] text-text-muted tracking-widest uppercase bg-card/30">
                    Response — ShelfCast-Benthic
                  </div>
                  <CodeBlock code={REST_RESPONSE_BENTHIC} highlighter={highlightJSON} />
                </div>

                {/* Error */}
                <div>
                  <div className="px-4 py-2 text-[10px] text-text-muted tracking-widest uppercase bg-card/30">
                    Error Response
                  </div>
                  <CodeBlock code={REST_ERROR} highlighter={highlightJSON} />
                </div>
              </div>
            )}

            {activeTab === 'python' && (
              <CodeBlock code={PYTHON_SDK} highlighter={plainText} />
            )}

            {activeTab === 'netcdf' && (
              <CodeBlock code={NETCDF_SCHEMA} highlighter={plainText} />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
