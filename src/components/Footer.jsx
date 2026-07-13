import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-scroll';
import { useApp } from '../App';


const footerLinks = [
  { to: 'products', label: 'Products' },
  { to: 'about', label: 'About' },
  { to: 'data-selector', label: 'Data Portal' },
];

export default function Footer() {
  const { openModal, openLegal, showToast } = useApp();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer id="footer" ref={ref} className="bg-surface border-t border-border">
      {/* CTA */}
      <div className="py-20 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-8"
        >
          Ready to integrate shelf intelligence?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={openModal}
            className="px-6 py-3 bg-accent-teal text-bg font-medium rounded text-sm
                       hover:bg-[#00b3a1] transition-colors cursor-pointer"
          >
            Request Pilot Access
          </button>
          <button
            onClick={() => showToast('Product sheet coming soon.')}
            className="px-6 py-3 border border-border text-text-primary rounded text-sm
                       hover:border-text-muted transition-colors cursor-pointer"
          >
            Download Product Sheet
          </button>
        </motion.div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <span className="font-heading text-sm font-bold tracking-widest text-text-primary">
              NERITIX<sup className="text-[0.5em] align-super">®</sup>
            </span>
            <div className="hidden sm:flex items-center gap-6">
              {footerLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  smooth
                  offset={-64}
                  duration={600}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {label}
                </Link>
              ))}
              <span
                onClick={openLegal}
                className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                Legal
              </span>
              <span
                onClick={openModal}
                className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                Contact
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6">
          <p className="text-text-muted text-[11px] leading-relaxed">
            NERITIX<sup>®</sup> does not manufacture or operate sensing devices.
            Data supplied via BlueTraker FVON / NetSenz network.
          </p>
          <p className="text-text-muted/50 text-[11px] mt-2">
            Copyright © 2026 NERITIX<sup>®</sup> | All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
