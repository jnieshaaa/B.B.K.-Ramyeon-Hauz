import { useState } from 'react';
import Header from './components/customer/Header';
import Hero from './components/customer/Hero';
import MenuSection from './components/customer/MenuSection';
import DiyBuilder from './components/customer/DiyBuilder';
import Footer from './components/customer/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import { useMenuController } from './hooks/useMenuController';
import type { Product, ContactInfo } from './models/MenuModel';
import './App.css';

function App() {
  const {
    // Categories State & Actions
    categories,
    addCategory,
    editCategory,
    deleteCategory,

    // Products State & Actions
    products,
    addProduct,
    editProduct,
    deleteProduct,
    resetProducts,

    // Inquiries State & Actions
    inquiries,
    submitInquiry,
    resolveInquiry,
    deleteInquiry,

    // Inventory State & Actions
    inventory,
    auditLogs,
    addInventoryItem,
    logAuditRecord,
    resetInventory,
    stockMovements,
    logStockMovement,
    resetStockMovements,

    // Menu States & Actions
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
    resetDiyBuilder,
    diyTotal
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

  // Subdomain & query param routing
  const isAdmin = window.location.hostname.startsWith('admin.') || 
                  window.location.search.includes('admin=true');

  // Scroll Helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed header
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

  // Add Item to DIY Builder based on its category
  const handleAddDiyItem = (product: Product) => {
    if (product.category === 'ramyeon') {
      setDiyRamyeon(product);
      // Auto scroll to step 2 to suggest adding toppings next
      alert(`"${product.name}" selected as your Ramyeon base! Scroll down to Step 2 to add toppings.`);
      scrollToSection('diy-builder');
    } else if (product.category === 'toppings') {
      addTopping(product);
      alert(`Added "${product.name}" to your DIY toppings list.`);
    } else if (product.category === 'drinks') {
      setDiyDrink(product);
      alert(`"${product.name}" selected as your chilled drink.`);
    }
  };

  if (isAdmin) {
    return (
      <AdminDashboard
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
      />
    );
  }

  return (
    <>
      {/* 1. Header (Navbar View) */}
      <Header clientUser={clientUser} onLogout={() => handleSetClientUser(null)} />

      {/* Main content wrapper */}
      <main style={{ marginTop: '72px' }}>
        {/* 2. Hero Section (Banner View) */}
        <Hero 
          onExploreClick={() => scrollToSection('menu-section')} 
          onBuildClick={() => scrollToSection('diy-builder')} 
        />

        {/* 3. Product Catalog (Pick-Up Coffee style scroll/tab View) */}
        <MenuSection
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredProducts={filteredProducts}
          onAddDiyItem={handleAddDiyItem}
          categories={categories}
        />

        {/* 4. DIY Calculator/Constructor View */}
        <DiyBuilder
          diySelection={diySelection}
          setDiyRamyeon={setDiyRamyeon}
          addTopping={addTopping}
          removeTopping={removeTopping}
          setDiyDrink={setDiyDrink}
          resetDiyBuilder={resetDiyBuilder}
          diyTotal={diyTotal}
          clientUser={clientUser}
          setClientUser={handleSetClientUser}
          contactInfo={contactInfo}
          products={products}
        />
      </main>

      {/* 5. Inquiries, Map & Contact Form (Footer View) */}
      <Footer contactInfo={contactInfo} submitInquiry={submitInquiry} />
    </>
  );
}

export default App;
