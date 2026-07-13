import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const cards = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M3 12l4-4m-4 4l4 4M21 12l-4-4m4 4l-4 4" />
      </svg>
    ),
    title: 'INGEST',
    desc: 'Raw profiles from FVON fishing vessel sensor networks.',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z" />
      </svg>
    ),
    title: 'QUALIFY',
    desc: 'QC flagging, provenance tracking, uncertainty bands.',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'DELIVER',
    desc: 'Subscription API, bulk transfer, SLA-backed latency.',
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

export default function WhatIsNeritix() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="py-24 sm:py-32 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        {/* Left — statement */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-6">
            NERITIX<sup className="text-[0.5em] align-super">®</sup> is a data platform.
          </h2>
          <div className="space-y-3 text-text-muted text-base sm:text-lg leading-relaxed">
            <p>We do not manufacture sensors.</p>
            <p>We do not operate vessels.</p>
            <p className="text-text-primary">
              We deliver quality-controlled continental shelf oceanographic data products
              — audit-grade, latency-tiered, and operationally sufficient.
            </p>
          </div>
        </motion.div>

        {/* Right — 3 cards */}
        <div className="grid gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={fadeUp}
              custom={i + 1}
              className="bg-card border border-border rounded-lg p-5 flex items-start gap-4"
            >
              <div className="text-accent-teal mt-0.5 shrink-0">{card.icon}</div>
              <div>
                <h3 className="font-mono text-sm font-semibold text-text-primary tracking-wider mb-1">
                  {card.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
