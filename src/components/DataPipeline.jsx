import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stages = [
  {
    label: 'A',
    title: 'In Situ Acquisition',
    items: ['NetSenz sensor on fishing net', 'CTD profiles', 'Benthic temperature', '200+ vessels'],
    bottom: 'BlueTraker FVON',
  },
  {
    label: 'B',
    title: 'Edge Processing',
    items: ['Onboard module', 'Sub-hour NRT', 'Same-day', 'Delayed-mode quality flags'],
    bottom: 'Telemetry Uplink',
  },
  {
    label: 'C',
    title: 'Neritix Platform',
    items: ['Ingestion layer', 'QC / Flagging', 'Provenance tracking', 'Metadata & API services'],
    bottom: 'Neritix Cloud',
  },
  {
    label: 'D',
    title: 'Distribution',
    items: ['Subscriptions', 'API access', 'Bulk transfer', 'GOOS/FVON · Custom SLA'],
    bottom: 'Data Buyers',
  },
];

function Arrow() {
  return (
    <div className="hidden lg:flex items-center text-accent-teal mx-[-8px] z-10">
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
        <path d="M0 8h24M24 8l-6-5M24 8l-6 5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12 },
  }),
};

export default function DataPipeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 sm:py-32 px-6 bg-surface" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-text-primary text-center mb-4"
        >
          From Ocean Floor to Data Product2
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-text-muted text-center mb-16 max-w-xl mx-auto"
        >
          Four stages transform raw sensor measurements into audit-grade data products.
        </motion.p>

        {/* Pipeline */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-0">
          {stages.map((stage, i) => (
            <div key={stage.label} className="contents">
              <motion.div
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                variants={fadeUp}
                custom={i}
                className="bg-card border border-border rounded-lg p-5 flex-1 min-w-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded bg-accent-teal/10 text-accent-teal text-xs font-mono
                                   font-bold flex items-center justify-center">
                    {stage.label}
                  </span>
                  <h3 className="font-mono text-sm font-semibold text-text-primary tracking-wide">
                    {stage.title}
                  </h3>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {stage.items.map((item) => (
                    <li key={item} className="text-text-muted text-xs leading-relaxed flex items-start gap-2">
                      <span className="text-accent-teal mt-1 text-[8px]">●</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-3">
                  <span className="font-mono text-[11px] text-text-muted tracking-wider uppercase">
                    {stage.bottom}
                  </span>
                </div>
              </motion.div>
              {i < stages.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-text-muted text-xs text-center mt-12 max-w-2xl mx-auto leading-relaxed"
        >
          NERITIX<sup>®</sup> does not manufacture or operate sensing devices, telemetry systems,
          or measurement hardware. Data is supplied via the BlueTraker FVON network
          using NetSenz fishing gear sensors.
        </motion.p>
      </div>
    </section>
  );
}
