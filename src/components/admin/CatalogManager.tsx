import { useState, useMemo } from 'react';
import type { Product, Category } from '../../models/MenuModel';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface CatalogManagerProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  editProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProducts: () => void;

  // Categories management properties
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  editCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}



const ICON_PRESETS = [
  { label: 'Ramen Bowl (ramen)', value: 'ramen' },
  { label: 'Egg / Topping (topping)', value: 'topping' },
  { label: 'Chilled Soda (drink)', value: 'drink' },
  { label: 'Steaming Rice (rice)', value: 'rice' },
  { label: 'Plate Meal Combo (combo)', value: 'combo' },
  { label: 'Menu List (menu)', value: 'menu' }
];

export default function CatalogManager({
  products,
  addProduct,
  editProduct,
  deleteProduct,
  categories,
  addCategory,
  editCategory,
  deleteCategory
}: CatalogManagerProps) {
  // Navigation Tabs: 'products' | 'categories'
  const [subTab, setSubTab] = useState<'products' | 'categories'>('products');

  // Products states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');

  // Modals visibility triggers
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(50);
  const [prodCategory, setProdCategory] = useState('ramyeon');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodIsPopular, setProdIsPopular] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured || !supabase) {
      alert('Supabase client is not initialized yet. Please check your environment configuration.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase Storage bucket 'products'
      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setProdImage(publicUrl);
    } catch (err: any) {
      console.error('Failed to upload image to Supabase:', err);
      alert(`Upload failed: ${err.message || err.error_description || 'Please make sure a public bucket named "products" exists in your Supabase console storage section.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Category Form states
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState(ICON_PRESETS[0].value);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(productSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, productSearch]);

  // Product actions
  const handleOpenAddProduct = () => {
    setProductModalMode('add');
    setEditingProduct(null);
    setProdName('');
    setProdPrice(50);
    setProdCategory(categories[0]?.id || 'ramyeon');
    setProdDesc('');
    setProdImage('');
    setProdIsPopular(false);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductModalMode('edit');
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdCategory(product.category);
    setProdDesc(product.description || '');
    setProdImage(product.image);
    setProdIsPopular(!!product.isPopular);
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0) {
      alert('Please enter a valid product name and positive price.');
      return;
    }

    const payload = {
      name: prodName.trim(),
      price: Number(prodPrice),
      category: prodCategory,
      description: prodDesc.trim(),
      image: prodImage,
      isPopular: prodIsPopular
    };

    if (productModalMode === 'add') {
      await addProduct(payload);
    } else if (productModalMode === 'edit' && editingProduct) {
      await editProduct({ ...payload, id: editingProduct.id });
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      await deleteProduct(product.id);
    }
  };

  // Category actions
  const handleOpenAddCategory = () => {
    setCategoryModalMode('add');
    setEditingCategory(null);
    setCatName('');
    setCatIcon(ICON_PRESETS[0].value);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: Category) => {
    setCategoryModalMode('edit');
    setEditingCategory(category);
    setCatName(category.name);
    setCatIcon(category.iconName);
    setIsCategoryModalOpen(true);
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('Please enter a valid category name.');
      return;
    }

    const payload = {
      name: catName.trim(),
      iconName: catIcon
    };

    if (categoryModalMode === 'add') {
      await addCategory(payload);
    } else if (categoryModalMode === 'edit' && editingCategory) {
      await editCategory({ ...payload, id: editingCategory.id });
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (category: Category) => {
    const defaultIds = ['ramyeon', 'toppings', 'drinks'];
    if (defaultIds.includes(category.id)) {
      alert(`The category "${category.name}" is required by the customer DIY Builder. Deleting it is restricted.`);
      return;
    }

    // Check if category has associated products
    const hasProducts = products.some(p => p.category === category.id);
    if (hasProducts) {
      alert(`Cannot delete category "${category.name}" because it contains associated products. Please reassign those products first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      await deleteCategory(category.id);
      if (activeCategory === category.id) {
        setActiveCategory('all');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setSubTab('products')}
          className={`px-6 py-3 font-black text-xs uppercase tracking-widest cursor-pointer border-none rounded-t-2xl transition-all outline-none ${subTab === 'products'
              ? 'bg-[#D65113] text-white shadow-sm shadow-[#D65113]/15'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          Menu Items Catalog
        </button>
        <button
          type="button"
          onClick={() => setSubTab('categories')}
          className={`px-6 py-3 font-black text-xs uppercase tracking-widest cursor-pointer border-none rounded-t-2xl transition-all outline-none ${subTab === 'categories'
              ? 'bg-[#D65113] text-white shadow-sm shadow-[#D65113]/15'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          Dynamic Menu Categories
        </button>
      </div>

      {/* --- MENU ITEMS SUBTAB --- */}
      {subTab === 'products' && (
        <>
          {/* Filtering controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs box-border">
            <div className="flex flex-col gap-6">
              {/* Category Quick Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filter by Category</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer ${activeCategory === 'all'
                        ? 'bg-[#D65113] text-white border-[#D65113] shadow-md shadow-[#D65113]/25'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                  >
                    All Menu
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer ${activeCategory === cat.id
                          ? 'bg-[#D65113] text-white border-[#D65113] shadow-md shadow-[#D65113]/25'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Actions Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap pt-4 border-t border-dashed border-slate-200">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#D65113] focus:bg-white outline-none transition-all box-border"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-slate-400 bg-none border-none cursor-pointer outline-none font-bold"
                      onClick={() => setProductSearch('')}
                    >
                      &times;
                    </button>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenAddProduct}
                    className="flex-1 md:flex-none bg-[#D65113] hover:bg-slate-800 text-white border-none px-5 py-3 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all outline-none"
                  >
                    Add Menu Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                const catInfo = categories.find(c => c.id === product.category);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col p-4 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 box-border"
                  >
                    {/* Card Image Area */}
                    <div className="relative rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                      {product.isPopular && (
                        <span className="absolute top-3 left-3 bg-[#D65113] text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                          Best Seller
                        </span>
                      )}
                      <span className="absolute top-3 right-3 bg-slate-700 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        {catInfo ? catInfo.name : product.category}
                      </span>
                    </div>

                    {/* Card Content Area */}
                    <div className="flex flex-col mt-4 grow">
                      <h4 className="text-sm font-bold text-slate-800 m-0 line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1.5 m-0 line-clamp-2 h-8">
                        {product.description || 'No description provided.'}
                      </p>

                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-dashed border-slate-200">
                        <span className="text-base font-extrabold text-[#D65113]">₱ {product.price.toFixed(2)}</span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(product)}
                            className="bg-slate-100 hover:bg-[#D65113] text-slate-700 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border-none outline-none"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border-none outline-none"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 italic text-xs font-semibold shadow-sm">
              No products match the selected filters or search parameters.
            </div>
          )}
        </>
      )}

      {/* --- CATEGORIES SUBTAB --- */}
      {subTab === 'categories' && (
        <>
          <div className="flex justify-between items-center shrink-0">
            <p className="text-xs text-slate-500 font-semibold m-0">
              Manage product categories linked to catalog and customer interfaces.
            </p>
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="bg-[#D65113] hover:bg-slate-800 text-white border-none px-5 py-3 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all outline-none"
            >
              Add New Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map(cat => {
              const isDefault = ['ramyeon', 'toppings', 'drinks'].includes(cat.id);
              const linkedProductsCount = products.filter(p => p.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all box-border"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-2xl bg-[#D65113]/5 text-[#D65113] flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {cat.iconName.slice(0, 2)}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-bold text-slate-800 m-0">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 m-0">
                        {linkedProductsCount} Products
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(cat)}
                      className="bg-transparent border-none text-slate-400 hover:text-[#D65113] font-bold text-xs cursor-pointer p-1.5"
                    >
                      Edit
                    </button>
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="bg-transparent border-none text-slate-400 hover:text-red-500 font-bold text-xs cursor-pointer p-1.5"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- PRODUCT FORM MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-[2500] p-4 box-border animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-[760px] shadow-2xl overflow-hidden font-sans border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-base font-extrabold m-0">
                {productModalMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
              </h3>
              <button
                type="button"
                className="text-2xl text-white/80 hover:text-white bg-transparent border-none cursor-pointer outline-none font-bold"
                onClick={() => setIsProductModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleProductFormSubmit} className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

                {/* Left Column: Interactive Square Image Upload */}
                <div className="md:col-span-2 flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">Product Image *</span>

                  <div
                    onClick={() => document.getElementById('form-product-upload')?.click()}
                    className="w-full aspect-square bg-slate-50 hover:bg-slate-100/50 border-2 border-dashed border-slate-200 hover:border-[#D65113] rounded-3xl overflow-hidden flex flex-col items-center justify-center relative cursor-pointer group transition-all"
                  >
                    {prodImage ? (
                      <>
                        <img src={prodImage} alt="Product Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                            Change Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center p-4 text-center">
                        <svg className="w-8 h-8 text-slate-400 group-hover:text-[#D65113] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-bold text-slate-600 mt-2">Click to Upload File</span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP</span>
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#D65113] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] text-[#D65113] font-bold">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Hidden Input field */}
                  <input
                    type="file"
                    id="form-product-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />

                  {/* Or Paste Direct Link */}
                  <div className="flex flex-col gap-1 mt-2">
                    <label htmlFor="form-prod-image-url" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Or Paste Image URL Link</label>
                    <input
                      type="url"
                      id="form-prod-image-url"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold focus:border-[#D65113] focus:bg-white outline-none transition-all box-border"
                      placeholder="e.g. https://domain.com/photo.jpg"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Column: Details Inputs */}
                <div className="md:col-span-3 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="form-prod-name" className="text-xs font-black uppercase tracking-wider text-slate-600">Product Name *</label>
                    <input
                      type="text"
                      id="form-prod-name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-bold focus:border-[#D65113] focus:bg-white outline-none transition-all box-border font-sans"
                      placeholder="e.g. Jin Cheese Ramen"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-prod-price" className="text-xs font-black uppercase tracking-wider text-slate-600">Price (₱ PHP) *</label>
                      <input
                        type="number"
                        id="form-prod-price"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-bold focus:border-[#D65113] focus:bg-white outline-none transition-all box-border font-sans"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(Number(e.target.value))}
                        min={1}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-prod-category" className="text-xs font-black uppercase tracking-wider text-slate-600">Category *</label>
                      <select
                        id="form-prod-category"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-bold focus:border-[#D65113] focus:bg-white outline-none transition-all box-border font-sans"
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="form-prod-desc" className="text-xs font-black uppercase tracking-wider text-slate-600">Description</label>
                    <textarea
                      id="form-prod-desc"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-bold focus:border-[#D65113] focus:bg-white outline-none transition-all box-border font-sans resize-y"
                      placeholder="Enter details, toppings list, or sizes..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      rows={3}
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2.5 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      id="form-prod-popular"
                      checked={prodIsPopular}
                      onChange={(e) => setProdIsPopular(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#D65113] focus:ring-[#D65113] accent-[#D65113] cursor-pointer"
                    />
                    <label htmlFor="form-prod-popular" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Highlight as Popular Choice / Best Seller
                    </label>
                  </div>
                </div>

              </div>

              {/* Submit triggers */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none transition-all outline-none"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D65113] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none shadow-sm transition-all outline-none"
                >
                  {productModalMode === 'add' ? 'Save Item' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CATEGORY FORM MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-[2500] p-4 box-border">
          <div className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden font-sans border border-slate-200 flex flex-col">
            <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-base font-extrabold m-0">
                {categoryModalMode === 'add' ? 'Create New Category' : 'Edit Category'}
              </h3>
              <button
                type="button"
                className="text-2xl text-white/80 hover:text-white bg-transparent border-none cursor-pointer outline-none"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCategoryFormSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-cat-name" className="text-xs font-black uppercase tracking-wider text-slate-600">Category Name *</label>
                <input
                  type="text"
                  id="form-cat-name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-bold focus:border-[#D65113] focus:bg-white outline-none transition-all box-border font-sans"
                  placeholder="e.g. Sizzling Plates"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-cat-icon" className="text-xs font-black uppercase tracking-wider text-slate-600">Category Icon Preset</label>
                <select
                  id="form-cat-icon"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-bold focus:border-[#D65113] focus:bg-white outline-none transition-all box-border font-sans"
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                >
                  {ICON_PRESETS.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none transition-all outline-none"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D65113] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all outline-none"
                >
                  {categoryModalMode === 'add' ? 'Create Category' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
