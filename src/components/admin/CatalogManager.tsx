import { useState, useMemo } from 'react';
import type { Product, CategoryId } from '../../models/MenuModel';
import { CATEGORIES } from '../../data/menuData';

interface CatalogManagerProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
}

const IMAGE_PRESETS = [
  { label: 'Ramyeon Base', value: '/assets/ramyeon_base.jpg' },
  { label: 'Kimchi & Toppings', value: '/assets/topping_kimchi.jpg' },
  { label: 'Milkis & Drinks', value: '/assets/drink_milkis.jpg' },
  { label: 'Silog Plate Meals', value: '/assets/silog_meal.jpg' },
  { label: 'Combo Meals', value: '/assets/combo_meal.jpg' }
];

export default function CatalogManager({
  products,
  addProduct,
  editProduct,
  deleteProduct,
  resetProducts
}: CatalogManagerProps) {
  // Filter and Search States
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [productSearch, setProductSearch] = useState('');

  // Modal Dialog states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(50);
  const [prodCategory, setProdCategory] = useState<'ramyeon' | 'toppings' | 'drinks' | 'silog' | 'combos'>('ramyeon');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState(IMAGE_PRESETS[0].value);
  const [prodIsPopular, setProdIsPopular] = useState(false);

  // Filters catalog
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.description.toLowerCase().includes(productSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, productSearch]);

  // Handlers
  const handleOpenAddProduct = () => {
    setProductModalMode('add');
    setEditingProduct(null);
    setProdName('');
    setProdPrice(50);
    setProdCategory('ramyeon');
    setProdDesc('');
    setProdImage(IMAGE_PRESETS[0].value);
    setProdIsPopular(false);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductModalMode('edit');
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdCategory(product.category);
    setProdDesc(product.description);
    setProdImage(product.image);
    setProdIsPopular(!!product.isPopular);
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0) {
      alert('Please enter a valid product name and positive price.');
      return;
    }

    const payload = {
      name: prodName,
      price: Number(prodPrice),
      category: prodCategory,
      description: prodDesc,
      image: prodImage,
      isPopular: prodIsPopular
    };

    if (productModalMode === 'add') {
      addProduct(payload);
      alert(`Product "${prodName}" added successfully.`);
    } else if (productModalMode === 'edit' && editingProduct) {
      editProduct({
        ...payload,
        id: editingProduct.id
      });
      alert(`Product "${prodName}" updated successfully.`);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteProduct(product.id);
      alert(`Deleted "${product.name}" from catalog.`);
    }
  };

  return (
    <div className="products-page-container">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6 box-border font-sans">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                type="button"
                className={activeCategory === category.id
                  ? 'bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none'
                }
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-60">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {productSearch && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 bg-none border-none cursor-pointer outline-none"
                  onClick={() => setProductSearch('')}
                >
                  &times;
                </button>
              )}
            </div>
            
            <button 
              type="button" 
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all outline-none"
              onClick={resetProducts}
            >
              Reset Menu
            </button>
            <button 
              type="button" 
              className="bg-blue-600 hover:bg-slate-900 text-white border-none px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/15 hover:shadow-lg transition-all outline-none"
              onClick={handleOpenAddProduct}
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white font-sans">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Image</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Name</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Category</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Price</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Description</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Status</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <img src={product.image} alt={product.name} className="w-11 h-11 rounded-lg object-cover border border-slate-200" />
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <strong className="text-slate-950 font-bold text-[15px]">{product.name}</strong>
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <strong className="text-slate-950 font-extrabold text-[15px]">₱{product.price.toFixed(2)}</strong>
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <p className="max-w-[280px] text-slate-500 text-xs line-clamp-2 m-0">{product.description}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    {product.isPopular ? (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">Popular Choice</span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">Standard</span>
                    )}
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200/50 hover:border-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        onClick={() => handleOpenEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="bg-red-50 hover:bg-red-600 text-red-500 hover:text-white border border-red-200/50 hover:border-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-8 border-b border-slate-100 text-center text-sm text-slate-500 italic">
                  No products found. Add a new menu item to expand the selection!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modals */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-6 box-border">
          <div className="bg-white rounded-3xl w-full max-w-[540px] shadow-2xl overflow-hidden font-sans">
            <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold m-0">{productModalMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}</h3>
              <button 
                type="button" 
                className="text-2xl text-white bg-transparent border-none cursor-pointer opacity-80 hover:opacity-100 outline-none"
                onClick={() => setIsProductModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleProductFormSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-prod-name" className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Name *</label>
                <input
                  type="text"
                  id="form-prod-name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  placeholder="e.g. Cheese Ramen Extra Spicy"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-prod-price" className="text-xs font-bold uppercase tracking-wider text-slate-700">Price (₱ PHP) *</label>
                  <input
                    type="number"
                    id="form-prod-price"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    placeholder="e.g. 80"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-prod-category" className="text-xs font-bold uppercase tracking-wider text-slate-700">Category *</label>
                  <select
                    id="form-prod-category"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    required
                  >
                    <option value="ramyeon">Korean Ramyeon</option>
                    <option value="toppings">Ramyeon Toppings</option>
                    <option value="silog">All-Day Silog</option>
                    <option value="combos">Combo Meals</option>
                    <option value="drinks">Drinks & Sides</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-prod-desc" className="text-xs font-bold uppercase tracking-wider text-slate-700">Description</label>
                <textarea
                  id="form-prod-desc"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans resize-y"
                  placeholder="Enter details, ingredients, or sizing description..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={3}
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-prod-image" className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Image Preset</label>
                <select
                  id="form-prod-image"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                >
                  {IMAGE_PRESETS.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  id="form-prod-popular"
                  checked={prodIsPopular}
                  onChange={(e) => setProdIsPopular(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="form-prod-popular" className="text-xs font-bold text-slate-700 cursor-pointer">Highlight as Popular Choice / Best Seller</label>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none transition-all"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none shadow-md shadow-blue-500/15 hover:shadow-lg transition-all"
                >
                  {productModalMode === 'add' ? 'Save Product' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
