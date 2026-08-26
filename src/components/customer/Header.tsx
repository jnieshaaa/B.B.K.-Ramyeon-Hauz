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
    <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 font-sans ${
      isScrolled 
        ? 'bg-[#FAF1D6]/90 backdrop-blur-md shadow-sm border-b border-[#5B240B]/10 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a 
          href="#" 
          className="flex items-center gap-2 text-[#5B240B] font-extrabold text-lg no-underline"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <span className="bg-[#D65113] text-white px-2 py-0.5 rounded-lg text-xs font-black tracking-wider">
            B.B.K.
          </span>
          <span className="logo-text">Ramyeon Hauz</span>
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
          <button 
            type="button" 
            onClick={() => scrollToSection('inquiries')} 
            className="bg-[#D65113] hover:bg-[#5B240B] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all border-none cursor-pointer outline-none"
          >
            Dine In / Inquire
          </button>
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          type="button" 
          className="md:hidden flex flex-col justify-between w-6 h-4 bg-transparent border-none cursor-pointer p-0 z-[1100]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span className={`w-6 h-0.5 bg-[#5B240B] rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? 'rotate-45 translate-y-[2px]' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-[#5B240B] rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-[#5B240B] rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? '-rotate-45 -translate-y-[2px]' : ''}`}></span>
        </button>

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
            onClick={() => scrollToSection('inquiries')} 
            className="bg-[#D65113] hover:bg-[#5B240B] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all border-none cursor-pointer outline-none text-center"
          >
            Dine In / Inquire
          </button>
        </nav>
      </div>
    </header>
  );
}
