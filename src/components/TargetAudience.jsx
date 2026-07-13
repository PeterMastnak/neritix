import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const audiences = [
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 26c0-4 4-6 10-6s10 2 10 6M16 14a5 5 0 100-10 5 5 0 000 10z" />
        <path d="M4 16c2-6 8-10 12-10" strokeDasharray="2 3" opacity="0.5" />
      </svg>
    ),
    title: 'Forecast Centers',
    desc: 'CMCC, ECMWF nodes, DHMZ. Assimilation-grade shelf coverage for NWP models.',
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 4v6M16 22v6M4 16h6M22 16h6" />
        <circle cx="16" cy="16" r="6" />
      </svg>
    ),
    title: 'Fisheries Management',
    desc: 'National authorities and quota management bodies requiring audit-grade environmental baselines.',
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="12" width="16" height="14" rx="1" />
        <path d="M12 12V8a4 4 0 018 0v4M16 18v4" />
      </svg>
    ),
    title: 'Offshore Energy',
    desc: 'Subsea operators and marine construction firms. Bottom temperature gradients for thermal rating and stability assessment.',
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 26V10l10-6 10 6v16" />
        <path d="M6 26h20M12 26v-8h8v8M12 14h8" />
      </svg>
    ),
    title: 'Science & Research',
    desc: 'Universities, CNR, IOF Split. Co-publication infrastructure and independent validation layers.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function TargetAudience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-text-primary text-center mb-4"
        >
          Trusted by Operational Oceanography
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-text-muted text-center mb-16 max-w-lg mx-auto"
        >
          Precision shelf data for the institutions that need it most.
        </motion.p>

        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={fadeUp}
              custom={i}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent-teal/30 transition-colors"
            >
              <div className="text-accent-teal mb-4">{a.icon}</div>
              <h3 className="font-heading text-base font-bold text-text-primary mb-2">{a.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
