import { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { useApp } from '../App';

const navLinks = [
  { to: 'products', label: 'Products' },
  { to: 'api-docs', label: 'API Docs' },
  { to: 'data-selector', label: 'Data Portal' },
  { to: 'about', label: 'About' },
  { to: null, label: 'Contact', action: 'modal' },
];

export default function Nav() {
  const { openModal } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(10,14,20,0.92)] backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="hero"
          smooth
          duration={600}
          className="font-heading text-lg font-bold tracking-widest text-text-primary cursor-pointer"
        >
          NERITIX<sup className="text-[0.5em] align-super">®</sup>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label, action }) => (
            action === 'modal' ? (
              <span
                key={label}
                onClick={openModal}
                className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {label}
              </span>
            ) : (
              <Link
                key={to}
                to={to}
                smooth
                offset={-96}
                duration={600}
                spy
                activeClass="!text-accent-teal"
                className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {label}
              </Link>
            )
          ))}
          <button
            onClick={openModal}
            className="ml-2 px-4 py-1.5 text-sm font-medium border border-accent-teal text-accent-teal
                       rounded hover:bg-accent-teal hover:text-bg transition-all cursor-pointer"
          >
            Request Access →
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-text-primary transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgba(10,14,20,0.97)] backdrop-blur-md border-t border-border px-6 pb-6 pt-2">
          {navLinks.map(({ to, label, action }) => (
            action === 'modal' ? (
              <span
                key={label}
                onClick={() => { setMobileOpen(false); openModal(); }}
                className="block py-3 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {label}
              </span>
            ) : (
              <Link
                key={to}
                to={to}
                smooth
                offset={-96}
                duration={600}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {label}
              </Link>
            )
          ))}
          <button
            onClick={() => { setMobileOpen(false); openModal(); }}
            className="mt-2 inline-block px-4 py-2 text-sm font-medium border border-accent-teal
                       text-accent-teal rounded hover:bg-accent-teal hover:text-bg transition-all cursor-pointer"
          >
            Request Access →
          </button>
        </div>
      )}
    </nav>
  );
}
