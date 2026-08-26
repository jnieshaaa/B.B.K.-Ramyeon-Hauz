import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="logo-badge">B.B.K.</span>
          <span className="logo-text">Ramyeon Hauz</span>
        </a>

        {/* Desktop Menu */}
        <nav className="desktop-nav">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="nav-link">Home</button>
          <button type="button" onClick={() => scrollToSection('menu-section')} className="nav-link">Our Menu</button>
          <button type="button" onClick={() => scrollToSection('diy-builder')} className="nav-link">DIY Builder</button>
          <button type="button" onClick={() => scrollToSection('inquiries')} className="nav-link btn-inquire">Dine In / Inquire</button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          type="button" 
          className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <button type="button" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mobile-nav-link">Home</button>
          <button type="button" onClick={() => scrollToSection('menu-section')} className="mobile-nav-link">Our Menu</button>
          <button type="button" onClick={() => scrollToSection('diy-builder')} className="mobile-nav-link">DIY Builder</button>
          <button type="button" onClick={() => scrollToSection('inquiries')} className="mobile-nav-link btn-mobile-inquire">Dine In / Inquire</button>
        </nav>
      </div>
    </header>
  );
}
