import { useState, useEffect } from 'react';

interface HeaderProps {
  clientUser: { email: string; name?: string; phone?: string } | null;
  onLogout: () => void;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function Header({ clientUser, onLogout, cartItemCount = 0, onCartClick }: HeaderProps) {
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

  const handleCartClick = () => {
    setMobileMenuOpen(false);
    if (onCartClick) {
      onCartClick();
    } else {
      scrollToSection('diy-builder');
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 font-sans ${
      isScrolled 
        ? 'bg-[#FAF1D6]/90 backdrop-blur-md shadow-sm border-b border-[#5B240B]/10 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a 
          href="#" 
          className="flex items-center gap-2.5 text-[#5B240B] font-extrabold text-lg no-underline"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <img src="/assets/logo.png" alt="B.B.K. Logo" className="w-9 h-9 object-contain" />
          <span className="logo-text tracking-tight">B.B.K. Ramyeon Hauz</span>
        </a>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            type="button" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="bg-transparent border-none text-[#5B240B] font-bold text-sm hover:text-[#D65113] transition-colors cursor-pointer outline-none"
          >
            Home
          </button>
          <button 
            type="button" 
            onClick={() => scrollToSection('menu-section')} 
            className="bg-transparent border-none text-[#5B240B] font-bold text-sm hover:text-[#D65113] transition-colors cursor-pointer outline-none"
          >
            Our Menu
          </button>
          <button 
            type="button" 
            onClick={() => scrollToSection('diy-builder')} 
            className="bg-transparent border-none text-[#5B240B] font-bold text-sm hover:text-[#D65113] transition-colors cursor-pointer outline-none"
          >
            DIY Builder
          </button>

          {/* Cart Button with Count Badge */}
          <button 
            type="button" 
            onClick={handleCartClick}
            className="flex items-center gap-2 bg-[#FAF1D6] hover:bg-[#5B240B] text-[#5B240B] hover:text-white px-3.5 py-2 rounded-xl font-bold text-sm border border-[#5B240B]/20 transition-all cursor-pointer outline-none relative group"
            title="View Group Order Cart"
          >
            <svg className="w-4 h-4 text-[#D65113] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="bg-[#D65113] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                {cartItemCount}
              </span>
            )}
          </button>

          <button 
            type="button" 
            onClick={() => scrollToSection('inquiries')} 
            className="bg-[#D65113] hover:bg-[#5B240B] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all border-none cursor-pointer outline-none"
          >
            Dine In / Inquire
          </button>

          {clientUser ? (
            <div className="flex items-center gap-3 ml-2 border-l border-[#5B240B]/15 pl-4 shrink-0">
              <span className="text-xs text-[#5B240B]/85 font-extrabold max-w-[120px] truncate" title={clientUser.email}>
                {clientUser.name || clientUser.email.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="bg-transparent border border-red-500/25 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer outline-none"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </nav>

        {/* Mobile Nav Top Bar Controls (Cart Button + Hamburger) */}
        <div className="md:hidden flex items-center gap-3 z-[1100]">
          <button
            type="button"
            onClick={handleCartClick}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF1D6] border border-[#5B240B]/15 text-[#5B240B] cursor-pointer"
            aria-label="View Cart"
          >
            <svg className="w-4 h-4 text-[#D65113]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D65113] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[14px] text-center leading-none">
                {cartItemCount}
              </span>
            )}
          </button>

          <button 
            type="button" 
            className="flex flex-col justify-between w-6 h-4 bg-transparent border-none cursor-pointer p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`w-6 h-0.5 bg-[#5B240B] rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? 'rotate-45 translate-y-[2px]' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#5B240B] rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#5B240B] rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? '-rotate-45 -translate-y-[2px]' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu Panel Drawer */}
        <nav className={`fixed top-0 right-0 w-[280px] h-screen bg-[#FAF1D6] border-l border-[#5B240B]/10 p-12 pt-24 flex flex-col gap-6 shadow-2xl transition-transform duration-300 z-[1050] md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <button 
            type="button" 
            onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className="bg-transparent border-none text-[#5B240B] font-bold text-base text-left hover:text-[#D65113] transition-colors cursor-pointer outline-none"
          >
            Home
          </button>
          <button 
            type="button" 
            onClick={() => scrollToSection('menu-section')} 
            className="bg-transparent border-none text-[#5B240B] font-bold text-base text-left hover:text-[#D65113] transition-colors cursor-pointer outline-none"
          >
            Our Menu
          </button>
          <button 
            type="button" 
            onClick={() => scrollToSection('diy-builder')} 
            className="bg-transparent border-none text-[#5B240B] font-bold text-base text-left hover:text-[#D65113] transition-colors cursor-pointer outline-none"
          >
            DIY Builder
          </button>
          <button 
            type="button" 
            onClick={handleCartClick} 
            className="flex items-center justify-between bg-transparent border-none text-[#5B240B] font-bold text-base text-left hover:text-[#D65113] transition-colors cursor-pointer outline-none"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#D65113]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Group Order Cart
            </span>
            {cartItemCount > 0 && (
              <span className="bg-[#D65113] text-white text-xs font-black px-2 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
          <button 
            type="button" 
            onClick={() => scrollToSection('inquiries')} 
            className="bg-[#D65113] hover:bg-[#5B240B] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all border-none cursor-pointer outline-none text-center"
          >
            Dine In / Inquire
          </button>

          {clientUser && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#5B240B]/10 shrink-0">
              <span className="text-xs text-[#5B240B]/80 font-bold truncate">
                Logged in: {clientUser.email}
              </span>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all outline-none text-center"
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

