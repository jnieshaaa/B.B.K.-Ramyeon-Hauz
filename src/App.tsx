import Header from './components/Header';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import DiyBuilder from './components/DiyBuilder';
import Footer from './components/Footer';
import { useMenuController } from './hooks/useMenuController';
import type { Product } from './models/MenuModel';
import './App.css';

function App() {
  const {
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
      <Footer />
    </>
  );
}

export default App;
