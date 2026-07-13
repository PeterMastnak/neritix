import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  {
    title: 'Terms of Use',
    content: `By accessing and using the NERITIX® website and services, you agree to be bound by these terms. NERITIX® provides oceanographic data products and related services on an "as-is" and "as-available" basis. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice.

You may not use this website or any data obtained through it for any unlawful purpose, to infringe upon the rights of others, or to interfere with the operation of the platform. Unauthorized access to NERITIX® systems, accounts, or networks is strictly prohibited.`,
  },
  {
    title: 'Data Disclaimer',
    content: `All oceanographic data displayed on this website — including vertical profiles, benthic temperature tracks, vessel positions, and pricing estimates — is synthetic demonstration data generated for illustrative purposes only. It does not represent actual measurements, real vessel operations, or operational data products.

NERITIX® does not manufacture, calibrate, or operate any sensing devices, telemetry systems, or measurement hardware. Observational data is supplied via the BlueTraker FVON network using NetSenz fishing gear sensors. NERITIX® performs quality control, provenance tracking, and distribution of data products but makes no warranty regarding the accuracy, completeness, or fitness of raw sensor data for any particular purpose.`,
  },
  {
    title: 'Intellectual Property',
    content: `NERITIX® is a registered trademark. All content on this website — including text, graphics, logos, data visualizations, software, and the underlying source code — is the property of NERITIX® or its licensors and is protected by applicable intellectual property laws.

"ShelfCast-Vertical" and "ShelfCast-Benthic" are trademarks of NERITIX®. You may not reproduce, distribute, modify, or create derivative works from any content on this website without prior written consent.`,
  },
  {
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, NERITIX®, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or business opportunity — arising from your use of or inability to use the website or services.

In no event shall our total liability exceed the amount paid by you, if any, for accessing the service during the twelve (12) months preceding the claim. This limitation applies regardless of the legal theory under which liability is asserted.`,
  },
  {
    title: 'Privacy & Data Collection',
    content: `NERITIX® collects minimal personal data. When you submit a contact or pilot access request, we collect your name, email address, organization, and any information you voluntarily provide. This data is used solely to respond to your inquiry and is not sold, shared, or disclosed to third parties except as required by law.

We may use standard analytics tools to collect anonymized usage data (page views, device type, approximate location) to improve the website experience. No cookies are used for advertising or cross-site tracking. You may request deletion of your personal data at any time by contacting support@bluetraker.com.`,
  },
  {
    title: 'Governing Law',
    content: `These terms shall be governed by and construed in accordance with the laws of the European Union and the Republic of Croatia, without regard to conflict of law principles. Any disputes arising from these terms or your use of the website shall be subject to the exclusive jurisdiction of the courts in Zagreb, Croatia.

For users within the European Union, nothing in these terms affects your statutory rights under applicable consumer protection legislation, including the right to seek resolution through the European Commission's Online Dispute Resolution platform.`,
  },
  {
    title: 'Contact',
    content: `For legal inquiries, data protection requests, or questions regarding these terms:

Email: support@bluetraker.com
Entity: NERITIX®
Jurisdiction: Zagreb, Croatia, EU`,
  },
];

export default function LegalModal({ open, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border shrink-0">
              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Legal Information
                </h3>
                <p className="text-text-muted text-xs mt-1 font-mono">
                  NERITIX<sup>®</sup> — Last updated January 2026
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {sections.map((section) => (
                <div key={section.title}>
                  <h4 className="font-heading text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">
                    {section.title}
                  </h4>
                  <div className="text-text-muted text-sm leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4">
                <p className="text-text-muted/50 text-xs">
                  Copyright © 2026 NERITIX<sup>®</sup>. All rights reserved.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
