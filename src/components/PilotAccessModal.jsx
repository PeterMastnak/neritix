import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

/*
  EmailJS Setup Instructions:
  1. Go to https://emailjs.com and create a free account (200 emails/month)
  2. Add an Email Service (Gmail, Outlook, etc.)
  3. Create an Email Template with these variables:
     {{from_name}}, {{organization}}, {{from_email}}, {{role}}, {{message}}
     - Send TO: support@bluetraker.com
     - Subject: "NERITIX® Pilot Access Request — {{organization}}"
     - Body:
       New Pilot Access Request — NERITIX®

       Name: {{from_name}}
       Organization: {{organization}}
       Email: {{from_email}}
       Role: {{role}}

       Message:
       {{message}}

       ---
       Sent from neritix.ai
  4. Get your Service ID, Template ID, and Public Key
  5. Add to .env.local:
     VITE_EMAILJS_SERVICE_ID=your_service_id
     VITE_EMAILJS_TEMPLATE_ID=your_template_id
     VITE_EMAILJS_PUBLIC_KEY=your_public_key
*/

const roles = [
  'Forecast Center / NWP',
  'Fisheries Authority',
  'Offshore Energy',
  'Scientific Institution',
  'Other',
];

export default function PilotAccessModal({ open, onClose }) {
  const formRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!open) {
      // Reset after close animation
      const t = setTimeout(() => setStatus('idle'), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const formData = new FormData(formRef.current);
    setEmail(formData.get('from_email'));

    if (!serviceId || !templateId || !publicKey ||
        serviceId === 'your_service_id') {
      // Demo mode — simulate success
      await new Promise((r) => setTimeout(r, 1000));
      setStatus('success');
      return;
    }

    try {
      await emailjs.sendForm(serviceId, templateId, formRef.current, publicKey);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Request Pilot Access
                </h3>
                <p className="text-text-muted text-sm mt-1">
                  Our team will respond within 2 business days.
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

            <div className="p-6">
              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-teal/10 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#00C8B4" strokeWidth="2.5">
                      <path d="M8 16l6 6 10-12" />
                    </svg>
                  </div>
                  <h4 className="font-heading text-lg font-bold text-text-primary mb-2">
                    Request received
                  </h4>
                  <p className="text-text-muted text-sm">
                    We'll be in touch at <span className="text-accent-teal">{email}</span> shortly.
                  </p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted tracking-wider uppercase mb-1.5">
                      Full Name *
                    </label>
                    <input
                      name="from_name"
                      type="text"
                      required
                      disabled={status === 'loading'}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm text-text-primary
                                 placeholder:text-text-muted focus:border-accent-teal focus:outline-none transition-colors
                                 disabled:opacity-50"
                      placeholder="Dr. Ana Kovac"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted tracking-wider uppercase mb-1.5">
                      Organization *
                    </label>
                    <input
                      name="organization"
                      type="text"
                      required
                      disabled={status === 'loading'}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm text-text-primary
                                 placeholder:text-text-muted focus:border-accent-teal focus:outline-none transition-colors
                                 disabled:opacity-50"
                      placeholder="CMCC Foundation"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted tracking-wider uppercase mb-1.5">
                      Email *
                    </label>
                    <input
                      name="from_email"
                      type="email"
                      required
                      disabled={status === 'loading'}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm text-text-primary
                                 placeholder:text-text-muted focus:border-accent-teal focus:outline-none transition-colors
                                 disabled:opacity-50"
                      placeholder="a.kovac@cmcc.it"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted tracking-wider uppercase mb-1.5">
                      Role
                    </label>
                    <select
                      name="role"
                      disabled={status === 'loading'}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm text-text-primary
                                 focus:border-accent-teal focus:outline-none transition-colors
                                 disabled:opacity-50 cursor-pointer"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r} className="bg-surface">{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted tracking-wider uppercase mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      disabled={status === 'loading'}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm text-text-primary
                                 placeholder:text-text-muted focus:border-accent-teal focus:outline-none transition-colors
                                 disabled:opacity-50 resize-none"
                      placeholder="Tell us about your use case and basin of interest"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-400 text-xs">
                      Submission failed. Please email{' '}
                      <a href="mailto:support@bluetraker.com" className="underline">support@bluetraker.com</a>{' '}
                      directly.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3 bg-accent-teal text-bg font-medium rounded text-sm
                               hover:bg-[#00b3a1] transition-colors cursor-pointer
                               disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
