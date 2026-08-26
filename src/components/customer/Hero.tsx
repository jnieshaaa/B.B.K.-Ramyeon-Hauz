interface HeroProps {
  onExploreClick: () => void;
  onBuildClick: () => void;
}

export default function Hero({ onExploreClick, onBuildClick }: HeroProps) {
  return (
    <section className="relative bg-[#FAF1D6] py-16 md:py-24 px-6 md:px-12 font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Brand content */}
        <div className="flex flex-col gap-6">
          <span className="text-xs text-[#D65113] font-black uppercase tracking-widest">
            Satisfy Your Cravings
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#5B240B] leading-tight m-0">
            DIY Korean <br />
            <span className="text-[#D65113]">Ramyeon Hauz</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed m-0">
            Experience the ultimate noodle sensation where <strong>YOU</strong> are the chef! 
            Choose your signature noodle base, pile on delicious authentic toppings, and pair it with sweet Korean beverages. 
          </p>
          
          <div className="flex items-center gap-4 bg-white border border-[#5B240B]/10 p-4 rounded-2xl shadow-sm max-w-md">
            <div>
              <h3 className="text-sm font-extrabold text-[#5B240B] m-0">Visit & Dine In With Us</h3>
              <p className="text-xs text-slate-500 m-0 mt-1">Monday to Sunday: <strong>9:00 AM – 9:00 PM</strong></p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap mt-2">
            <button 
              type="button" 
              onClick={onBuildClick} 
              className="bg-[#D65113] hover:bg-[#5B240B] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#D65113]/25 hover:shadow-xl transition-all border-none cursor-pointer outline-none"
            >
              Build Your Bowl
            </button>
            <button 
              type="button" 
              onClick={onExploreClick} 
              className="bg-transparent hover:bg-[#5B240B]/5 text-[#5B240B] border border-[#5B240B] px-8 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer outline-none"
            >
              View Menu
            </button>
          </div>
        </div>
        
        {/* Right Side: Image illustration visual */}
        <div className="relative flex justify-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white max-w-md w-full aspect-[4/3]">
            <img 
              src="/assets/hero_ramyeon.jpg" 
              alt="Steaming bowl of custom DIY Korean Ramyeon" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-xs p-4 rounded-2xl text-white flex flex-col gap-1">
              <span className="text-xs font-black tracking-widest text-[#D65113] uppercase">
                MAKE • EAT • ENJOY
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">
                DIY Ramyeon Concept
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
