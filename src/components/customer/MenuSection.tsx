import type { Product, CategoryId } from '../../models/MenuModel';
import { CATEGORIES } from '../../data/menuData';

interface MenuSectionProps {
  activeCategory: CategoryId;
  setActiveCategory: (category: CategoryId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];
  onAddDiyItem: (product: Product) => void;
}

export default function MenuSection({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  onAddDiyItem
}: MenuSectionProps) {
  // Helper to render inline SVG icons for categories
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ramen':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16l.7.7M2 12h1m16 0h1M4.22 19.78l.7-.7m12.16-12.16l.7-.7M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12c0 2.2 1.8 4 4 4s4-1.8 4-4" />
          </svg>
        );
      case 'topping':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      case 'drink':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  return (
    <section id="menu-section" className="bg-white py-16 md:py-24 px-6 md:px-12 font-sans">
      <div className="max-w-xl mx-auto text-center mb-16 flex flex-col gap-3">
        <span className="text-xs text-[#D65113] font-black uppercase tracking-widest">
          Categorized Options
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-[#5B240B] m-0">
          Explore Our Delicious Menu
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed m-0">
          Browse through our raw bases, fresh pairings, and icy drinks. Tap any item to add it directly to your DIY bowl!
        </p>
      </div>

      {/* Menu Filters / Search Container */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 bg-[#FAF1D6]/40 p-4 border border-[#5B240B]/10 rounded-2xl">
          
          {/* Categories Tab Bar (Desktop View) */}
          <div className="hidden md:flex gap-2 flex-wrap">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={activeCategory === category.id
                  ? 'flex items-center gap-2 bg-[#D65113] text-white border border-[#D65113] px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#D65113]/20 cursor-pointer outline-none'
                  : 'flex items-center gap-2 bg-white hover:bg-slate-50 text-[#5B240B] border border-[#5B240B]/10 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none'
                }
                onClick={() => setActiveCategory(category.id)}
              >
                {renderCategoryIcon(category.iconName)}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Categories Dropdown (Mobile View) */}
          <div className="md:hidden relative w-full">
            <label htmlFor="category-select" className="sr-only">Select Category</label>
            <select
              id="category-select"
              className="w-full pl-4 pr-10 py-3 bg-white border border-[#5B240B]/15 rounded-xl font-sans text-sm font-bold text-[#5B240B] focus:border-[#D65113] outline-none appearance-none cursor-pointer"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as CategoryId)}
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B240B] pointer-events-none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B240B]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#5B240B]/15 rounded-xl font-sans text-xs font-semibold text-[#5B240B] placeholder-slate-400 focus:border-[#D65113] outline-none transition-all box-border"
              placeholder="Search Ramyeon, Kimchi, Milkis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600 bg-none border-none cursor-pointer outline-none" 
                onClick={() => setSearchQuery('')}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl border border-[#5B240B]/10 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.isPopular && (
                  <span className="absolute top-4 left-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                    Popular Choice
                  </span>
                )}
                <span className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
              </div>
              <div className="p-6 flex flex-col gap-3 grow">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-[#5B240B] font-extrabold text-base m-0">{product.name}</h3>
                  <span className="text-[#D65113] font-black text-base">₱{product.price}</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed m-0 grow">{product.description}</p>
                <div className="mt-3">
                  <button
                    type="button"
                    className="w-full bg-[#5B240B] hover:bg-[#D65113] text-white flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs shadow-sm transition-all border-none cursor-pointer outline-none"
                    onClick={() => onAddDiyItem(product)}
                  >
                    <span>Add to DIY Builder</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-12 flex flex-col items-center gap-4">
          <h3 className="text-lg font-black text-[#5B240B] m-0">No items found</h3>
          <p className="text-sm text-slate-500 m-0">We couldn't find any products matching "{searchQuery}". Try searching for something else!</p>
          <button 
            type="button" 
            className="bg-transparent hover:bg-[#5B240B]/5 text-[#5B240B] border border-[#5B240B] px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all outline-none" 
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
