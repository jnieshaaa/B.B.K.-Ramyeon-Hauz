import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HeroSection from './pages/customer/HeroSection';
import MenuCatalogSection from './pages/customer/MenuCatalogSection';
import DiyBuilderSection from './pages/customer/DiyBuilderSection';
import AdminPage from './pages/admin/AdminPage';
import Toast from './components/common/Toast';
import { useMenuController } from './hooks/useMenuController';
import type { Product, ContactInfo } from './models/MenuModel';

function App() {
  // Query state/actions from Menu Controller
  const {
    categories,
    addCategory,
    editCategory,
    deleteCategory,

    // Products
    products,
    addProduct,
    editProduct,
    deleteProduct,
    resetProducts,

    // Inquiries
    inquiries,
    resolveInquiry,
    deleteInquiry,
    submitInquiry,

    // Inventory
    inventory,
    auditLogs,
    addInventoryItem,
    logAuditRecord,
    resetInventory,
    stockMovements,
    logStockMovement,
    resetStockMovements,

    // Tab Filters
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,

    // DIY Builder States & Actions
    diySelection,
    setDiyRamyeon,
    addTopping,
    removeTopping,
    setDiyDrink,
    addDiyDrink,
    removeDiyDrink,
    setEntireDiySelection,
    resetDiyBuilder,
    diyTotal,

    // Toast States
    toast,
    showToast,

    // Maintenance Mode
    maintenanceMode,
    updateMaintenanceMode,

    // Customer Cart States & Actions
    cart,
    addBowlToCart,
    updateBowlInCart,
    addProductToCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    cartTotal,
    cartItemCount
  } = useMenuController();

  // Dynamic Contact Information State (backed by localStorage)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    const saved = localStorage.getItem('bbk_contact_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      phone: '0975 184 1209',
      email: 'bbkramyeonhauz@gmail.com',
      messengerName: 'B B K Ramyeon Hauz',
      messengerLink: 'https://m.me/bbkramyeonhauz',
      address: 'A. Bonifacio Street, Brgy. 7B, San Pablo City, Philippines, 4000',
      landmarkNear: 'Maligaya Bakery (Near Us)',
      landmarkFront: 'Crispy King (In Front)'
    };
  });

  const updateContactInfo = (newInfo: ContactInfo) => {
    setContactInfo(newInfo);
    localStorage.setItem('bbk_contact_info', JSON.stringify(newInfo));
  };

  // Client (Customer) Auth Session State
  const [clientUser, setClientUser] = useState<{ email: string; name?: string; phone?: string } | null>(() => {
    const saved = sessionStorage.getItem('bbk_client_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });

  const handleSetClientUser = (user: { email: string; name?: string; phone?: string } | null) => {
    setClientUser(user);
    if (user) {
      sessionStorage.setItem('bbk_client_auth', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('bbk_client_auth');
    }
  };

  // Check URL query parameters to route to Admin dashboard (e.g. ?admin=true)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleAddDiyItem = (product: Product) => {
    if (product.category === 'ramyeon') {
      setDiyRamyeon(product);
      showToast(`"${product.name}" selected as your Ramyeon base! Scroll to Step 2 to add toppings.`, 'success');
      scrollToSection('diy-builder');
    } else if (product.category === 'toppings') {
      addTopping(product);
      showToast(`Added "${product.name}" to your DIY toppings list.`, 'success');
    } else if (product.category === 'drinks') {
      addDiyDrink(product);
      showToast(`Added "${product.name}" to your DIY drinks.`, 'success');
    } else {
      addProductToCart(product);
    }
  };

  if (isAdmin) {
    return (
      <>
        <AdminPage
          products={products}
          addProduct={addProduct}
          editProduct={editProduct}
          deleteProduct={deleteProduct}
          resetProducts={resetProducts}
          categories={categories}
          addCategory={addCategory}
          editCategory={editCategory}
          deleteCategory={deleteCategory}
          inquiries={inquiries}
          resolveInquiry={resolveInquiry}
          deleteInquiry={deleteInquiry}
          inventory={inventory}
          auditLogs={auditLogs}
          addInventoryItem={addInventoryItem}
          logAuditRecord={logAuditRecord}
          resetInventory={resetInventory}
          stockMovements={stockMovements}
          logStockMovement={logStockMovement}
          resetStockMovements={resetStockMovements}
          contactInfo={contactInfo}
          updateContactInfo={updateContactInfo}
          showToast={showToast}
          maintenanceMode={maintenanceMode}
          updateMaintenanceMode={updateMaintenanceMode}
        />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <>
      {/* 1. Header (Navbar Layout View) */}
      <Header 
        clientUser={clientUser} 
        onLogout={() => handleSetClientUser(null)} 
        cartItemCount={cartItemCount}
        onCartClick={() => scrollToSection('diy-builder')}
      />

      {/* Main content wrapper */}
      <main style={{ marginTop: '72px' }}>
        {/* 2. Hero Section (Banner View) */}
        <HeroSection 
          onExploreClick={() => scrollToSection('menu-section')} 
          onBuildClick={() => scrollToSection('diy-builder')} 
        />

        {/* 3. Product Catalog or Price Update Mode Notice */}
        {maintenanceMode.active ? (
          <div className="bg-[#FAF1D6]/30 border border-[#5B240B]/10 rounded-3xl p-12 text-center max-w-2xl mx-auto my-16 box-border flex flex-col items-center shadow-md animate-slideIn">
            <div className="w-16 h-16 rounded-full bg-[#FAF1D6] flex items-center justify-center text-[#5B240B] mb-5 shrink-0 border border-[#5B240B]/10">
              <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-[#5B240B] m-0 mb-3 font-sans">Menu Pricing Update in Progress</h3>
            <p className="text-xs md:text-sm text-slate-600 m-0 leading-relaxed font-sans max-w-md">
              {maintenanceMode.message || "We are currently updating our product catalog prices. Please check back shortly!"}
            </p>
            <div className="flex flex-col gap-2 mt-8 pt-6 border-t border-slate-100 w-full max-w-xs items-center shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Call to Order Directly</span>
              <a href={`tel:${contactInfo.phone}`} className="text-sm font-extrabold text-[#D65113] hover:underline font-sans mt-1">
                {contactInfo.phone}
              </a>
            </div>
          </div>
        ) : (
          <>
            <MenuCatalogSection
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredProducts={filteredProducts}
              onAddDiyItem={handleAddDiyItem}
              categories={categories}
              inventory={inventory}
            />

            {/* 4. DIY Calculator/Constructor View */}
            <DiyBuilderSection
              diySelection={diySelection}
              setDiyRamyeon={setDiyRamyeon}
              addTopping={addTopping}
              removeTopping={removeTopping}
              setDiyDrink={setDiyDrink}
              addDiyDrink={addDiyDrink}
              removeDiyDrink={removeDiyDrink}
              setEntireDiySelection={setEntireDiySelection}
              resetDiyBuilder={resetDiyBuilder}
              diyTotal={diyTotal}
              clientUser={clientUser}
              setClientUser={handleSetClientUser}
              contactInfo={contactInfo}
              products={products}
              inventory={inventory}
              cart={cart}
              addBowlToCart={addBowlToCart}
              updateBowlInCart={updateBowlInCart}
              updateCartQuantity={updateCartQuantity}
              removeCartItem={removeCartItem}
              clearCart={clearCart}
              cartTotal={cartTotal}
              cartItemCount={cartItemCount}
            />
          </>
        )}
      </main>

      {/* 5. Inquiries, Map & Contact Form (Footer Layout View) */}
      <Footer contactInfo={contactInfo} submitInquiry={submitInquiry} />
      <Toast toast={toast} />
    </>
  );
}

export default App;
