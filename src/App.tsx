import Header from './components/customer/Header';
import Hero from './components/customer/Hero';
import MenuSection from './components/customer/MenuSection';
import DiyBuilder from './components/customer/DiyBuilder';
import Footer from './components/customer/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import { useMenuController } from './hooks/useMenuController';
import type { Product } from './models/MenuModel';
import './App.css';

function App() {
  const {
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
      />
    );
  }

  return (
    <>
      {/* 1. Header (Navbar View) */}
      <Header />

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
        />
      </main>

      {/* 5. Inquiries, Map & Contact Form (Footer View) */}
      <Footer submitInquiry={submitInquiry} />
    </>
  );
}

export default App;
