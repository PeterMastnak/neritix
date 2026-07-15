import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { useApp } from '../App';

function CTDCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const lines = Array.from({ length: 12 }, () => ({
      x: Math.random(),
      speed: 0.15 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
      amplitude: 8 + Math.random() * 16,
      opacity: 0.08 + Math.random() * 0.12,
      phase: Math.random() * 1000,
    }));

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(t) {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const line of lines) {
        const baseX = line.x * w;
        const yOffset = ((t * line.speed * 0.02) + line.phase) % (h + 200) - 200;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 200, 180, ${line.opacity})`;
        ctx.lineWidth = 1.5;

        for (let y = h; y > h - yOffset; y -= 2) {
          const progress = (h - y) / h;
          const wiggle = Math.sin(y * 0.02 + line.offset + t * 0.001) * line.amplitude * progress;
          if (y === h) {
            ctx.moveTo(baseX + wiggle, y);
          } else {
            ctx.lineTo(baseX + wiggle, y);
          }
        }
        ctx.stroke();
      }
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

const stats = [
  '200 vessels',
  'Adriatic Basin',
  '<1hr latency',
];

export default function Hero() {
  const { openModal } = useApp();
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <CTDCanvas />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs tracking-[0.3em] text-accent-teal mb-6 uppercase"
        >
          Continental Shelf Intelligence Delivery
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-heading text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tight text-text-primary mb-6"
        >
          NERITIX<sup className="text-[0.35em] align-super">®</sup>
          <a
            href="https://www.bluetraker.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-text-muted text-sm tracking-widest mt-1 hover:text-accent-teal transition-colors"
          >
            by <span className="font-medium">BlueTraker</span>
          </a>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-text-muted text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Operational oceanographic data products for national authorities,
          forecast centers, and scientific institutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <Link
            to="products"
            smooth
            offset={-64}
            duration={600}
            className="px-6 py-3 bg-accent-teal text-bg font-medium rounded cursor-pointer
                       hover:bg-[#00b3a1] transition-colors text-sm"
          >
            Explore Data Products
          </Link>
          <button
            onClick={openModal}
            className="px-6 py-3 border border-border text-text-primary rounded cursor-pointer
                       hover:border-text-muted transition-colors text-sm"
          >
            Request Pilot Access
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="border-t border-border mx-auto max-w-md mb-4" />
          <div className="flex justify-center gap-6 sm:gap-10">
            {stats.map((stat) => (
              <span key={stat} className="font-mono text-xs sm:text-sm text-text-muted tracking-wide">
                {stat}
              </span>
            ))}
          </div>
          <div className="border-t border-border mx-auto max-w-md mt-4" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
      >
        <Link
          to="about"
          smooth
          offset={-64}
          duration={700}
          aria-label="Scroll down to learn about Neritix"
          className="group flex cursor-pointer flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-text-muted transition-colors hover:text-accent-teal sm:text-sm"
        >
          <span>Scroll down</span>
          <span className="relative flex h-[22px] w-px justify-center overflow-hidden bg-border">
            <motion.span
              aria-hidden="true"
              className="absolute top-0 h-2 w-2 rounded-full bg-accent-teal shadow-[0_0_12px_rgba(0,200,180,0.85)]"
              animate={{ y: [-8, 14] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
          <svg
            aria-hidden="true"
            className="h-6 w-6 text-accent-teal transition-transform duration-300 group-hover:translate-y-1"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="m2 4 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
