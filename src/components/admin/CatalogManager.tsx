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

  // Media Library state for image reuse
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [libraryImages, setLibraryImages] = useState<Array<{ url: string; name: string; source: 'storage' | 'catalog' }>>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryUrl, setSelectedLibraryUrl] = useState('');

  const loadLibraryImages = async () => {
    setIsLoadingLibrary(true);
    const imageMap = new Map<string, { url: string; name: string; source: 'storage' | 'catalog' }>();

    // 1. Collect images already used across catalog products
    products.forEach((p) => {
      if (p.image && !imageMap.has(p.image)) {
        imageMap.set(p.image, {
          url: p.image,
          name: p.name,
          source: 'catalog'
        });
      }
    });

    // 2. Fetch images uploaded to Supabase Storage bucket 'products/uploads'
    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client.storage
          .from('products')
          .list('uploads', {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (!error && data) {
          data.forEach((file) => {
            if (file.name && !file.name.startsWith('.')) {
              const { data: { publicUrl } } = client.storage
                .from('products')
                .getPublicUrl(`uploads/${file.name}`);

              if (publicUrl && !imageMap.has(publicUrl)) {
                const cleanName = file.name
                  .replace(/^product-\d+[-_.]*/i, '')
                  .replace(/[-_]/g, ' ') || file.name;

                imageMap.set(publicUrl, {
                  url: publicUrl,
                  name: cleanName,
                  source: 'storage'
                });
              }
            }
          });
        }
      } catch (err) {
        console.error('Failed to list images from Supabase Storage:', err);
      }
    }

    setLibraryImages(Array.from(imageMap.values()));
    setIsLoadingLibrary(false);
  };

  const filteredLibraryImages = useMemo(() => {
    if (!librarySearch.trim()) return libraryImages;
    const q = librarySearch.toLowerCase().trim();
    return libraryImages.filter(img => 
      img.name.toLowerCase().includes(q) || img.url.toLowerCase().includes(q)
    );
  }, [libraryImages, librarySearch]);

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
      setLibraryImages(prev => [
        { url: publicUrl, name: file.name, source: 'storage' },
        ...prev.filter(item => item.url !== publicUrl)
      ]);
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
                    onClick={() => setIsImagePickerModalOpen(true)}
                    className="w-full aspect-square bg-slate-50 hover:bg-slate-100/50 border-2 border-dashed border-slate-200 hover:border-[#D65113] rounded-3xl overflow-hidden flex flex-col items-center justify-center relative cursor-pointer group transition-all"
                  >
                    {prodImage ? (
                      <>
                        <img src={prodImage} alt="Product Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                            Change Photo
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center p-4 text-center">
                        <svg className="w-8 h-8 text-slate-400 group-hover:text-[#D65113] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-bold text-slate-700 mt-2">Click to Set Photo</span>
                        <span className="text-[10px] text-slate-400 mt-1">Upload from Device or Reuse Existing</span>
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

                  {/* Reuse Existing Image Button */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLibraryUrl(prodImage);
                        setIsMediaLibraryOpen(true);
                        loadLibraryImages();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer outline-none"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose from Uploaded / Library
                    </button>

                    {prodImage && (
                      <button
                        type="button"
                        onClick={() => setProdImage('')}
                        className="text-[11px] text-red-500 hover:text-red-700 font-bold self-center cursor-pointer bg-transparent border-none py-0.5 outline-none transition-colors"
                      >
                        Remove Selected Image
                      </button>
                    )}
                  </div>

                  {/* Or Paste Direct Link */}
                  <div className="flex flex-col gap-1 mt-1">
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

      {/* Choice Modal: Upload from device or choose from media library */}
      {isImagePickerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[2600] p-4 box-border animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden font-sans border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-sm font-extrabold m-0">Select Photo Source</h3>
              <button
                type="button"
                className="text-xl text-white/80 hover:text-white bg-transparent border-none cursor-pointer outline-none font-bold"
                onClick={() => setIsImagePickerModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Options */}
            <div className="p-6 flex flex-col gap-3">
              <p className="text-xs text-slate-500 m-0 mb-1">
                How would you like to select the photo for this menu item?
              </p>

              {/* Option 1: Upload from device */}
              <button
                type="button"
                onClick={() => {
                  setIsImagePickerModalOpen(false);
                  document.getElementById('form-product-upload')?.click();
                }}
                className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-[#D65113] rounded-2xl cursor-pointer text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#D65113] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#D65113]">Upload from Device</span>
                  <span className="text-[10px] text-slate-400">Choose PNG, JPG, or WEBP from your computer</span>
                </div>
              </button>

              {/* Option 2: Choose from Media Library / Existing */}
              <button
                type="button"
                onClick={() => {
                  setIsImagePickerModalOpen(false);
                  setSelectedLibraryUrl(prodImage);
                  setIsMediaLibraryOpen(true);
                  loadLibraryImages();
                }}
                className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-500 rounded-2xl cursor-pointer text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Choose from Media Library</span>
                  <span className="text-[10px] text-slate-400">Reuse previously uploaded photo to avoid duplicates</span>
                </div>
              </button>

              {/* Option 3: Remove if exists */}
              {prodImage && (
                <button
                  type="button"
                  onClick={() => {
                    setProdImage('');
                    setIsImagePickerModalOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-xl cursor-pointer text-left transition-all text-red-600 text-xs font-bold mt-1"
                >
                  <svg className="w-4 h-4 ml-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Current Photo
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsImagePickerModalOpen(false)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-transparent border-none px-4 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal for Image Reuse */}
      {isMediaLibraryOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[2600] p-4 box-border animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-[780px] shadow-2xl overflow-hidden font-sans border border-slate-200 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-extrabold m-0 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Media Library & Uploaded Images
                </h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5">
                  Select any previously uploaded or existing product image to reuse it without uploading duplicates.
                </p>
              </div>
              <button
                type="button"
                className="text-2xl text-white/80 hover:text-white bg-transparent border-none cursor-pointer outline-none font-bold ml-4"
                onClick={() => setIsMediaLibraryOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Toolbar: Search + Refresh + Counter */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3 shrink-0">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search images by name..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-[#D65113] outline-none"
                />
              </div>
              <button
                type="button"
                onClick={loadLibraryImages}
                disabled={isLoadingLibrary}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer outline-none"
                title="Refresh Images"
              >
                <svg className={`w-3.5 h-3.5 ${isLoadingLibrary ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full whitespace-nowrap">
                {filteredLibraryImages.length} images
              </span>
            </div>

            {/* Images Grid Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh] flex-1">
              {isLoadingLibrary ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-3 border-[#D65113] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-600">Loading uploaded media files...</span>
                </div>
              ) : filteredLibraryImages.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-bold text-slate-600 m-0">No images found</p>
                  <p className="text-xs text-slate-400 m-0">
                    {librarySearch ? 'No images matched your search filter.' : 'Upload an image first to build your reusable library.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredLibraryImages.map((img, idx) => {
                    const isSelected = selectedLibraryUrl === img.url;
                    return (
                      <div
                        key={img.url + idx}
                        onClick={() => setSelectedLibraryUrl(img.url)}
                        onDoubleClick={() => {
                          setProdImage(img.url);
                          setIsMediaLibraryOpen(false);
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 bg-slate-100 flex flex-col ${
                          isSelected
                            ? 'border-[#D65113] ring-2 ring-[#D65113]/30 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Square thumbnail */}
                        <div className="aspect-square w-full relative overflow-hidden bg-slate-200">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#D65113] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-1.5">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                              {img.source === 'storage' ? 'Uploaded' : 'Catalog'}
                            </span>
                          </div>
                        </div>

                        {/* Image label */}
                        <div className="p-2 bg-white text-[11px] font-bold text-slate-700 truncate" title={img.name}>
                          {img.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Tip: Click an image to select, or double-click to select and apply immediately.
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsMediaLibraryOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer border-none transition-all outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedLibraryUrl}
                  onClick={() => {
                    if (selectedLibraryUrl) {
                      setProdImage(selectedLibraryUrl);
                      setIsMediaLibraryOpen(false);
                    }
                  }}
                  className={`px-5 py-2 rounded-xl font-bold text-xs cursor-pointer border-none transition-all outline-none shadow-md ${
                    selectedLibraryUrl
                      ? 'bg-[#D65113] hover:bg-slate-800 text-white shadow-[#D65113]/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Use Selected Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
