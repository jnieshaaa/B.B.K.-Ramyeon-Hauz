import type { Product, CategoryId } from '../models/MenuModel';
import { CATEGORIES } from '../data/menuData';

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
          <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16l.7.7M2 12h1m16 0h1M4.22 19.78l.7-.7m12.16-12.16l.7-.7M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12c0 2.2 1.8 4 4 4s4-1.8 4-4" />
          </svg>
        );
      case 'topping':
        return (
          <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      case 'drink':
        return (
          <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  return (
    <section id="menu-section" className="menu-section">
      <div className="section-header">
        <span className="section-subtitle">Categorized Options</span>
        <h2 className="section-title">Explore Our Delicious Menu</h2>
        <p className="section-desc">
          Browse through our raw bases, fresh pairings, and icy drinks. Tap any item to add it directly to your DIY bowl!
        </p>
      </div>

      {/* Menu Filters / Search Container */}
      <div className="menu-controls-wrapper">
        <div className="menu-controls">
          {/* Categories Tab Bar */}
          <div className="categories-tab-bar">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`category-tab-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {renderCategoryIcon(category.iconName)}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="search-box-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search Ramyeon, Kimchi, Milkis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="search-clear-btn" onClick={() => setSearchQuery('')}>
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                {product.isPopular && <span className="popular-badge">Popular Choice</span>}
                <span className="category-badge">{product.category}</span>
              </div>
              <div className="product-card-body">
                <div className="product-title-row">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-price">₱{product.price}</span>
                </div>
                <p className="product-desc">{product.description}</p>
                <div className="product-card-footer">
                  <button
                    type="button"
                    className="btn-add-to-diy"
                    onClick={() => onAddDiyItem(product)}
                  >
                    <span>Add to DIY Builder</span>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-products-state">
          <div className="no-products-icon">🍲</div>
          <h3>No items found</h3>
          <p>We couldn't find any products matching "{searchQuery}". Try searching for something else!</p>
          <button type="button" className="btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
