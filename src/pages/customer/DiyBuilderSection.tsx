import { useState } from 'react';
import type { Product, DIYSelection, ContactInfo, InventoryItem, CartItem } from '../../models/MenuModel';
import AuthModal from '../../components/common/AuthModal';

interface DiyBuilderProps {
  products: Product[];
  diySelection: DIYSelection;
  setDiyRamyeon: (product: Product | null) => void;
  addTopping: (product: Product) => void;
  removeTopping: (product: Product) => void;
  setDiyDrink: (product: Product | null) => void;
  addDiyDrink?: (product: Product) => void;
  removeDiyDrink?: (product: Product) => void;
  setEntireDiySelection?: (selection: DIYSelection) => void;
  resetDiyBuilder: () => void;
  diyTotal: number;
  clientUser: { email: string; name?: string; phone?: string } | null;
  setClientUser: (user: { email: string; name?: string; phone?: string } | null) => void;
  contactInfo: ContactInfo;
  inventory: InventoryItem[];
  cart: CartItem[];
  addBowlToCart: (selection: DIYSelection, label?: string) => boolean;
  updateBowlInCart?: (id: string, selection: DIYSelection, label?: string) => boolean;
  updateCartQuantity: (id: string, delta: number) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
}

export default function DiyBuilder({
  products,
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
  clientUser,
  setClientUser,
  contactInfo,
  inventory,
  cart,
  addBowlToCart,
  updateBowlInCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
  cartTotal,
  cartItemCount
}: DiyBuilderProps) {
  // Filter products dynamically from database state so that admin modifications show up here
  const ramyeons = products.filter(p => p.category === 'ramyeon');
  const toppings = products.filter(p => p.category === 'toppings');
  const drinks = products.filter(p => p.category === 'drinks');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bowlNickname, setBowlNickname] = useState('');
  const [editingBowlId, setEditingBowlId] = useState<string | null>(null);

  // Accordion state for Step 1, 2, 3 to allow customers to collapse and scroll short
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true
  });

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const toggleAllSteps = (expand: boolean) => {
    setExpandedSteps({ 1: expand, 2: expand, 3: expand });
  };

  const getToppingQuantity = (productId: string) => {
    const found = diySelection.toppings.find(t => t.product.id === productId);
    return found ? found.quantity : 0;
  };

  const getDrinkQuantity = (productId: string) => {
    if (diySelection.drinks && diySelection.drinks.length > 0) {
      const found = diySelection.drinks.find(d => d.product.id === productId);
      return found ? found.quantity : 0;
    }
    return diySelection.drink?.id === productId ? 1 : 0;
  };

  const selectedDrinks = diySelection.drinks && diySelection.drinks.length > 0
    ? diySelection.drinks
    : (diySelection.drink ? [{ product: diySelection.drink, quantity: 1 }] : []);

  const selectedDrinksCount = selectedDrinks.reduce((acc, d) => acc + d.quantity, 0);
  const selectedDrinksTotal = selectedDrinks.reduce((acc, d) => acc + d.product.price * d.quantity, 0);

  const hasCurrentBowl = !!(diySelection.ramyeon || diySelection.toppings.length > 0 || selectedDrinks.length > 0);

  const handleAddBowlToOrder = () => {
    if (!hasCurrentBowl) return;
    const success = addBowlToCart(diySelection, bowlNickname);
    if (success) {
      resetDiyBuilder();
      setBowlNickname('');
    }
  };

  const handleEditBowl = (item: CartItem) => {
    if (item.type !== 'bowl' || !item.bowlDetails) return;
    setEditingBowlId(item.id);
    setBowlNickname(item.name);
    if (setEntireDiySelection) {
      setEntireDiySelection({
        ramyeon: item.bowlDetails.ramyeon || null,
        toppings: item.bowlDetails.toppings || [],
        drinks: item.bowlDetails.drinks || (item.bowlDetails.drink ? [{ product: item.bowlDetails.drink, quantity: 1 }] : []),
        drink: item.bowlDetails.drink || null
      });
    }
    // Expand all steps to easily view and edit choices
    setExpandedSteps({ 1: true, 2: true, 3: true });
    // Scroll smoothly to constructor
    const element = document.getElementById('diy-builder');
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingBowlId(null);
    setBowlNickname('');
    resetDiyBuilder();
  };

  const handleSaveBowlChanges = () => {
    if (!editingBowlId || !hasCurrentBowl) return;
    if (updateBowlInCart) {
      const success = updateBowlInCart(editingBowlId, diySelection, bowlNickname);
      if (success) {
        setEditingBowlId(null);
        setBowlNickname('');
        resetDiyBuilder();
      }
    }
  };

  const handleOrderDineIn = () => {
    let itemsToProcess = [...cart];
    let totalToProcess = cartTotal;
    let countToProcess = cartItemCount;

    // If currently editing a bowl, save those updates
    if (editingBowlId && hasCurrentBowl) {
      if (updateBowlInCart) {
        updateBowlInCart(editingBowlId, diySelection, bowlNickname);
      }
      setEditingBowlId(null);
      setBowlNickname('');
      resetDiyBuilder();
    } else if (hasCurrentBowl) {
      // If current bowl is partially or fully assembled, add it to cart automatically
      let bowlPrice = 0;
      if (diySelection.ramyeon) bowlPrice += diySelection.ramyeon.price;
      diySelection.toppings.forEach(t => {
        bowlPrice += t.product.price * t.quantity;
      });
      selectedDrinks.forEach(d => {
        bowlPrice += d.product.price * d.quantity;
      });

      const bowlCount = cart.filter(item => item.type === 'bowl').length + 1;
      const bowlName = bowlNickname.trim() || `Bowl #${bowlCount}: ${diySelection.ramyeon ? diySelection.ramyeon.name : 'Custom Mix'}`;

      const newBowlItem: CartItem = {
        id: `bowl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: bowlName,
        type: 'bowl',
        price: bowlPrice,
        quantity: 1,
        bowlDetails: {
          ramyeon: diySelection.ramyeon,
          toppings: [...diySelection.toppings],
          drinks: [...selectedDrinks],
          drink: selectedDrinks[0]?.product || null
        }
      };

      addBowlToCart(diySelection, bowlNickname);
      itemsToProcess.push(newBowlItem);
      totalToProcess += bowlPrice;
      countToProcess += 1;
      resetDiyBuilder();
      setBowlNickname('');
    }

    if (!clientUser) {
      setIsAuthModalOpen(true);
    } else {
      proceedToBookingForm(clientUser, itemsToProcess, totalToProcess, countToProcess);
    }
  };

  const proceedToBookingForm = (
    prefilledUser?: { name?: string; phone?: string; email?: string } | null,
    itemsToUse?: CartItem[],
    totalToUse?: number,
    countToUse?: number
  ) => {
    // Generate combined summary of all items and bowls in the cart
    const activeItems = itemsToUse || cart;
    const effectiveTotal = totalToUse !== undefined ? totalToUse : cartTotal;
    const effectiveCount = countToUse !== undefined ? countToUse : cartItemCount;

    let summary = `Hi B.B.K. Ramyeon Hauz! I'd like to book a dine-in reservation for our group.\n`;
    summary += `Here is our group order (${effectiveCount} items):\n\n`;

    activeItems.forEach((item) => {
      if (item.type === 'bowl' && item.bowlDetails) {
        summary += `🍲 ${item.name} (x${item.quantity} - ₱${item.price * item.quantity}):\n`;
        if (item.bowlDetails.ramyeon) {
          summary += `   - Base: ${item.bowlDetails.ramyeon.name} (₱${item.bowlDetails.ramyeon.price})\n`;
        }
        if (item.bowlDetails.toppings && item.bowlDetails.toppings.length > 0) {
          summary += `   - Toppings:\n`;
          item.bowlDetails.toppings.forEach(t => {
            summary += `     * ${t.product.name} x${t.quantity} (₱${t.product.price * t.quantity})\n`;
          });
        }
        if (item.bowlDetails.drinks && item.bowlDetails.drinks.length > 0) {
          summary += `   - Drinks:\n`;
          item.bowlDetails.drinks.forEach(d => {
            summary += `     * ${d.product.name} x${d.quantity} (₱${d.product.price * d.quantity})\n`;
          });
        } else if (item.bowlDetails.drink) {
          summary += `   - Drink: ${item.bowlDetails.drink.name} (₱${item.bowlDetails.drink.price})\n`;
        }
      } else {
        summary += `🍽️ ${item.name} x${item.quantity} (₱${item.price * item.quantity})\n`;
      }
      summary += `\n`;
    });

    summary += `Estimated Grand Total: ₱${effectiveTotal}\n`;
    summary += `Please reserve a table for our group!`;

    // Copy into booking form message input
    const messageInput = document.getElementById('inquiry-message') as HTMLTextAreaElement;
    if (messageInput) {
      messageInput.value = summary;
    }

    // Prefill user details if logged in
    const activeUser = prefilledUser || clientUser;
    if (activeUser) {
      const nameInput = document.getElementById('inquiry-name') as HTMLInputElement;
      const phoneInput = document.getElementById('inquiry-phone') as HTMLInputElement;
      const emailInput = document.getElementById('inquiry-email') as HTMLInputElement;
      if (nameInput && activeUser.name) nameInput.value = activeUser.name;
      if (phoneInput && activeUser.phone) phoneInput.value = activeUser.phone;
      if (emailInput && activeUser.email) emailInput.value = activeUser.email;
    }

    // Scroll smoothly to inquiries section
    const element = document.getElementById('inquiries');
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="diy-builder" className="bg-[#FAF1D6]/30 py-16 md:py-24 px-6 md:px-12 font-sans">
      <div className="max-w-xl mx-auto text-center mb-16 flex flex-col gap-3">
        <span className="text-xs text-[#D65113] font-black uppercase tracking-widest">
          Interactive Calculator
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-[#5B240B] m-0">
          DIY Bowl Constructor
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed m-0">
          Combine ingredients to build your dream Korean Ramyeon bowl. We'll prep the boiling pot, and you cook it your way!
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step Selector Panels */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Active Bowl Editing Banner */}
          {editingBowlId && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm animate-slideIn">
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0">✏️</span>
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider m-0">Editing Bowl in Cart</h4>
                  <p className="text-xs text-amber-800 m-0 font-medium mt-0.5">
                    Currently modifying <strong>{bowlNickname || 'this bowl'}</strong>. Adjust ingredients below and click <em>"Save Bowl Changes"</em>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveBowlChanges}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer border-none shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Expand / Collapse All Quick Toolbar */}
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500">
              Customize each step below:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleAllSteps(false)}
                className="text-[11px] font-bold text-slate-600 hover:text-[#5B240B] bg-white border border-[#5B240B]/15 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Collapse All
              </button>
              <button
                type="button"
                onClick={() => toggleAllSteps(true)}
                className="text-[11px] font-bold text-[#D65113] hover:text-[#5B240B] bg-white border border-[#D65113]/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Expand All
              </button>
            </div>
          </div>
          
          {/* STEP 1: RAMYEON BASE */}
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 p-6 md:p-8 shadow-sm flex flex-col gap-4 transition-all">
            <div 
              className="flex items-center justify-between border-b border-[#5B240B]/5 pb-3 cursor-pointer select-none"
              onClick={() => toggleStep(1)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#D65113] text-white flex items-center justify-center font-black text-sm shrink-0">
                  1
                </span>
                <div className="flex flex-col">
                  <h3 className="text-base font-extrabold text-[#5B240B] m-0">Choose Your Ramyeon Noodle Base</h3>
                  {!expandedSteps[1] && (
                    <span className="text-[11px] font-bold text-[#D65113] mt-0.5">
                      {diySelection.ramyeon ? `✓ Selected: ${diySelection.ramyeon.name} (₱${diySelection.ramyeon.price})` : '• None selected'}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleStep(1); }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#5B240B]/15 text-[#5B240B] hover:bg-[#5B240B]/5 cursor-pointer outline-none transition-colors shrink-0"
              >
                <span>{expandedSteps[1] ? 'Collapse' : 'Expand'}</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSteps[1] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {expandedSteps[1] && (
              <>
                <p className="text-slate-500 text-xs font-semibold m-0">Select exactly one premium Korean instant noodle base.</p>
                <div className="flex flex-col gap-3.5">
                  {ramyeons.map(p => {
                    const invItem = inventory?.find(i => i.id === p.id);
                    const stock = invItem ? invItem.currentStock : 0;
                    const isOutOfStock = stock <= 0;
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`flex items-center gap-4 border rounded-2xl p-4 transition-all ${
                          isOutOfStock 
                            ? 'border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed'
                            : diySelection.ramyeon?.id === p.id 
                              ? 'border-2 border-[#D65113] bg-[#FAF1D6]/20 cursor-pointer' 
                              : 'border-[#5B240B]/10 cursor-pointer hover:border-[#D65113] hover:bg-slate-50/20'
                        }`}
                        onClick={() => !isOutOfStock && setDiyRamyeon(diySelection.ramyeon?.id === p.id ? null : p)}
                      >
                        <div className="relative">
                          <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-[#5B240B]/10 shrink-0" />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-slate-950/40 rounded-xl flex items-center justify-center">
                              <span className="text-[7px] text-white font-black uppercase tracking-wider bg-red-600 px-1 py-0.5 rounded">OUT</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col grow">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-[#5B240B] m-0">{p.name}</h4>
                            {isOutOfStock ? (
                              <span className="text-[9px] font-black bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded">Out of Stock</span>
                            ) : (
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded">{stock} left</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 m-0 mt-1 leading-relaxed">{p.description}</p>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                          <span className="text-sm font-black text-[#D65113]">₱{p.price}</span>
                          {!isOutOfStock && (
                            <div className={`w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center ${
                              diySelection.ramyeon?.id === p.id ? 'border-[#D65113] bg-[#D65113]' : ''
                            }`}>
                              {diySelection.ramyeon?.id === p.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* STEP 2: TOPPINGS */}
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 p-6 md:p-8 shadow-sm flex flex-col gap-4 transition-all">
            <div 
              className="flex items-center justify-between border-b border-[#5B240B]/5 pb-3 cursor-pointer select-none"
              onClick={() => toggleStep(2)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#D65113] text-white flex items-center justify-center font-black text-sm shrink-0">
                  2
                </span>
                <div className="flex flex-col">
                  <h3 className="text-base font-extrabold text-[#5B240B] m-0">Load Up on Toppings</h3>
                  {!expandedSteps[2] && (
                    <span className="text-[11px] font-bold text-[#D65113] mt-0.5">
                      {diySelection.toppings.length > 0 
                        ? `✓ ${diySelection.toppings.reduce((acc, t) => acc + t.quantity, 0)} toppings added (₱${diySelection.toppings.reduce((acc, t) => acc + t.product.price * t.quantity, 0)})`
                        : '• None selected'}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleStep(2); }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#5B240B]/15 text-[#5B240B] hover:bg-[#5B240B]/5 cursor-pointer outline-none transition-colors shrink-0"
              >
                <span>{expandedSteps[2] ? 'Collapse' : 'Expand'}</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSteps[2] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {expandedSteps[2] && (
              <>
                <p className="text-slate-500 text-xs font-semibold m-0">Add toppings to build flavor (select as many as you like).</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {toppings.map(p => {
                    const qty = getToppingQuantity(p.id);
                    const invItem = inventory?.find(i => i.id === p.id);
                    const stock = invItem ? invItem.currentStock : 0;
                    const isOutOfStock = stock <= 0;
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`flex items-center gap-4 border rounded-2xl p-4 transition-all ${
                          isOutOfStock 
                            ? 'border-slate-200 bg-slate-50/50 opacity-60' 
                            : qty > 0 
                              ? 'border-2 border-[#D65113] bg-[#FAF1D6]/5' 
                              : 'border-[#5B240B]/10 hover:border-[#D65113]'
                        }`}
                      >
                        <div className="relative">
                          <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-[#5B240B]/10 shrink-0" />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-slate-950/40 rounded-xl flex items-center justify-center">
                              <span className="text-[7px] text-white font-black uppercase tracking-wider bg-red-600 px-1 py-0.5 rounded">OUT</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col grow">
                          <h4 className="text-xs font-extrabold text-[#5B240B] m-0">{p.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[11px] text-[#D65113] font-black">₱{p.price}</span>
                            <span className="text-[9px] text-slate-300">•</span>
                            {isOutOfStock ? (
                              <span className="text-[9px] font-black text-red-600 uppercase">Out of Stock</span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-600">{stock} left</span>
                            )}
                          </div>
                        </div>
                        {!isOutOfStock && (
                          <div className="flex items-center gap-2 ml-auto border border-[#5B240B]/10 rounded-lg p-1 bg-slate-50">
                            <button 
                              type="button" 
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 border-none text-[#5B240B] font-extrabold text-sm flex items-center justify-center cursor-pointer transition-colors outline-none disabled:opacity-35 disabled:cursor-not-allowed"
                              onClick={() => removeTopping(p)}
                              disabled={qty === 0}
                            >
                              &minus;
                            </button>
                            <span className="text-xs font-black text-[#5B240B] min-w-[14px] text-center">{qty}</span>
                            <button 
                              type="button" 
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 border-none text-[#5B240B] font-extrabold text-sm flex items-center justify-center cursor-pointer transition-colors outline-none disabled:opacity-35 disabled:cursor-not-allowed"
                              onClick={() => addTopping(p)}
                              disabled={qty >= stock}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* STEP 3: DRINKS (MULTIPLE DRINKS SUPPORTED) */}
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 p-6 md:p-8 shadow-sm flex flex-col gap-4 transition-all">
            <div 
              className="flex items-center justify-between border-b border-[#5B240B]/5 pb-3 cursor-pointer select-none"
              onClick={() => toggleStep(3)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#D65113] text-white flex items-center justify-center font-black text-sm shrink-0">
                  3
                </span>
                <div className="flex flex-col">
                  <h3 className="text-base font-extrabold text-[#5B240B] m-0">Select Refreshing Drinks</h3>
                  {!expandedSteps[3] && (
                    <span className="text-[11px] font-bold text-[#D65113] mt-0.5">
                      {selectedDrinksCount > 0 
                        ? `✓ ${selectedDrinksCount} drinks added (₱${selectedDrinksTotal})`
                        : '• None selected'}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleStep(3); }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#5B240B]/15 text-[#5B240B] hover:bg-[#5B240B]/5 cursor-pointer outline-none transition-colors shrink-0"
              >
                <span>{expandedSteps[3] ? 'Collapse' : 'Expand'}</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSteps[3] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {expandedSteps[3] && (
              <>
                <p className="text-slate-500 text-xs font-semibold m-0">Cool down the heat with traditional Korean sodas or milk drinks (order as many as you like).</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {drinks.map(p => {
                    const qty = getDrinkQuantity(p.id);
                    const invItem = inventory?.find(i => i.id === p.id);
                    const stock = invItem ? invItem.currentStock : 0;
                    const isOutOfStock = stock <= 0;
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`flex items-center gap-4 border rounded-2xl p-4 transition-all ${
                          isOutOfStock 
                            ? 'border-slate-200 bg-slate-50/50 opacity-60' 
                            : qty > 0 
                              ? 'border-2 border-[#D65113] bg-[#FAF1D6]/5' 
                              : 'border-[#5B240B]/10 hover:border-[#D65113]'
                        }`}
                      >
                        <div className="relative">
                          <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-[#5B240B]/10 shrink-0" />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-slate-950/40 rounded-xl flex items-center justify-center">
                              <span className="text-[7px] text-white font-black uppercase tracking-wider bg-red-600 px-1 py-0.5 rounded">OUT</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col grow">
                          <h4 className="text-xs font-extrabold text-[#5B240B] m-0">{p.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[11px] text-[#D65113] font-black">₱{p.price}</span>
                            <span className="text-[9px] text-slate-300">•</span>
                            {isOutOfStock ? (
                              <span className="text-[9px] font-black text-red-600 uppercase">Out of Stock</span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-600">{stock} left</span>
                            )}
                          </div>
                        </div>
                        {!isOutOfStock && (
                          <div className="flex items-center gap-2 ml-auto border border-[#5B240B]/10 rounded-lg p-1 bg-slate-50">
                            <button 
                              type="button" 
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 border-none text-[#5B240B] font-extrabold text-sm flex items-center justify-center cursor-pointer transition-colors outline-none disabled:opacity-35 disabled:cursor-not-allowed"
                              onClick={() => {
                                if (removeDiyDrink) removeDiyDrink(p);
                                else setDiyDrink(null);
                              }}
                              disabled={qty === 0}
                            >
                              &minus;
                            </button>
                            <span className="text-xs font-black text-[#5B240B] min-w-[14px] text-center">{qty}</span>
                            <button 
                              type="button" 
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 border-none text-[#5B240B] font-extrabold text-sm flex items-center justify-center cursor-pointer transition-colors outline-none disabled:opacity-35 disabled:cursor-not-allowed"
                              onClick={() => {
                                if (addDiyDrink) addDiyDrink(p);
                                else setDiyDrink(p);
                              }}
                              disabled={qty >= stock}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>

        {/* Live Bill Receipt & Group Cart Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 shadow-xl p-6 md:p-8 flex flex-col gap-5 relative font-sans">
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-[#D65113] to-transparent rounded-t-3xl"></div>
            
            {/* Header */}
            <div className="text-center border-b border-dashed border-[#5B240B]/10 pb-3">
              <h3 className="text-sm font-black tracking-widest text-[#5B240B] m-0">B.B.K. RAMYEON HAUZ</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 m-0">Group Dine-In Order</p>
            </div>

            {/* --- SECTION 1: CURRENT BOWL ASSEMBLY --- */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-[#D65113]">
                  {editingBowlId ? 'Editing Bowl' : 'Current Bowl'}
                </span>
                {hasCurrentBowl && (
                  <span className="text-xs font-black text-[#5B240B]">₱{diyTotal}</span>
                )}
              </div>

              {hasCurrentBowl ? (
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3.5 flex flex-col gap-2.5">
                  {diySelection.ramyeon && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#5B240B]">{diySelection.ramyeon.name}</span>
                      <span className="font-semibold text-slate-600">₱{diySelection.ramyeon.price}</span>
                    </div>
                  )}

                  {diySelection.toppings.length > 0 && (
                    <div className="flex flex-col gap-1 text-[11px] text-slate-600 border-t border-dashed border-orange-200/60 pt-1.5">
                      {diySelection.toppings.map(t => (
                        <div key={t.product.id} className="flex justify-between items-center pl-2">
                          <span>• {t.product.name} <small className="text-slate-400">x{t.quantity}</small></span>
                          <span className="font-medium">₱{t.product.price * t.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDrinks.length > 0 && (
                    <div className="flex flex-col gap-1 text-[11px] text-slate-600 border-t border-dashed border-orange-200/60 pt-1.5">
                      {selectedDrinks.map(d => (
                        <div key={d.product.id} className="flex justify-between items-center pl-2">
                          <span>🥤 {d.product.name} <small className="text-slate-400">x{d.quantity}</small></span>
                          <span className="font-medium">₱{d.product.price * d.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optional Friend Name / Label */}
                  <div className="mt-1 pt-2 border-t border-orange-200/60">
                    <input
                      type="text"
                      placeholder="Bowl name (e.g. Friend 1, Sarah)"
                      value={bowlNickname}
                      onChange={(e) => setBowlNickname(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-orange-200 rounded-lg text-slate-900 outline-none focus:border-[#D65113] box-border"
                    />
                  </div>

                  {/* Action: Add Bowl to Order & Build Another or Save Edits */}
                  <div className="flex flex-col gap-2 mt-1">
                    {editingBowlId ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveBowlChanges}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-black text-xs shadow-md shadow-emerald-600/20 transition-all border-none cursor-pointer outline-none flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Save Bowl Changes
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="w-full bg-transparent hover:bg-slate-100 text-slate-600 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all border-none cursor-pointer outline-none text-center"
                        >
                          Cancel Editing
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleAddBowlToOrder}
                          className="w-full bg-[#D65113] hover:bg-[#5B240B] text-white py-2.5 px-3 rounded-xl font-black text-xs shadow-md shadow-[#D65113]/20 transition-all border-none cursor-pointer outline-none flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Bowl to Order / Build Another
                        </button>
                        <button
                          type="button"
                          onClick={resetDiyBuilder}
                          className="w-full bg-transparent hover:bg-red-50 text-red-500 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all border-none cursor-pointer outline-none text-center"
                        >
                          Reset Current Bowl
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 m-0 leading-relaxed">
                    Select a ramyeon base in Step 1 to customize a bowl.
                  </p>
                </div>
              )}
            </div>

            {/* --- SECTION 2: SAVED GROUP ORDER CART --- */}
            <div className="border-t border-dashed border-[#5B240B]/15 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-[#5B240B] flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#D65113]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Group Order Cart ({cartItemCount})
                </span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer outline-none"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length > 0 ? (
                <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl flex flex-col gap-1.5 relative group transition-all ${
                        editingBowlId === item.id
                          ? 'border-2 border-amber-400 bg-amber-50/40 shadow-sm'
                          : 'bg-slate-50 border border-slate-200/80 hover:border-[#D65113]/40'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#5B240B] leading-tight">
                            {item.name}
                          </span>
                          {editingBowlId === item.id && (
                            <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full uppercase">
                              Editing
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-[#D65113] whitespace-nowrap">
                          ₱{item.price * item.quantity}
                        </span>
                      </div>

                      {item.type === 'bowl' && item.bowlDetails && (
                        <p className="text-[10px] text-slate-500 m-0 leading-tight">
                          {item.bowlDetails.ramyeon ? item.bowlDetails.ramyeon.name : 'Custom base'}
                          {item.bowlDetails.toppings && item.bowlDetails.toppings.length > 0
                            ? ` • ${item.bowlDetails.toppings.map(t => `${t.product.name} x${t.quantity}`).join(', ')}`
                            : ''}
                          {item.bowlDetails.drinks && item.bowlDetails.drinks.length > 0
                            ? ` • 🥤 ${item.bowlDetails.drinks.map(d => `${d.product.name} x${d.quantity}`).join(', ')}`
                            : (item.bowlDetails.drink ? ` • 🥤 ${item.bowlDetails.drink.name}` : '')}
                        </p>
                      )}

                      {/* Quantity, Edit, & Delete Controls */}
                      <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-200/50">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-transparent border-none cursor-pointer outline-none px-1"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-900 min-w-[14px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-transparent border-none cursor-pointer outline-none px-1"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {item.type === 'bowl' && (
                            <button
                              type="button"
                              onClick={() => handleEditBowl(item)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer outline-none ${
                                editingBowlId === item.id
                                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                                  : 'bg-white hover:bg-orange-50 border-slate-200 text-slate-600 hover:text-[#D65113]'
                              }`}
                              title="Edit this bowl's ingredients"
                            >
                              <svg className="w-3 h-3 text-[#D65113]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span>{editingBowlId === item.id ? 'Editing' : 'Edit'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (editingBowlId === item.id) {
                                handleCancelEdit();
                              }
                              removeCartItem(item.id);
                            }}
                            className="text-slate-400 hover:text-red-500 p-1 bg-transparent border-none cursor-pointer outline-none transition-colors"
                            title="Remove from cart"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 text-center text-slate-400 text-xs">
                  No bowls added to group cart yet.
                </div>
              )}

              {/* Total Summary */}
              <div className="border-t border-dashed border-[#5B240B]/20 pt-3 flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                  ORDER TOTAL ({cartItemCount + (hasCurrentBowl && !editingBowlId ? 1 : 0)} items)
                </span>
                <span className="text-[#D65113] font-black text-xl">
                  ₱{cartTotal + (hasCurrentBowl && !editingBowlId ? diyTotal : 0)}
                </span>
              </div>

              {/* Main Checkout Button */}
              <button
                type="button"
                onClick={handleOrderDineIn}
                disabled={!hasCurrentBowl && cart.length === 0}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all border-none cursor-pointer outline-none text-center ${
                  !hasCurrentBowl && cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#D65113] hover:bg-[#5B240B] text-white shadow-[#D65113]/15 hover:shadow-lg'
                }`}
              >
                {cart.length > 0 
                  ? `Book Dine-In / Submit Order (${cartItemCount + (hasCurrentBowl && !editingBowlId ? 1 : 0)} items)`
                  : 'Book Dine-In / Submit Order'}
              </button>
            </div>

            <div className="text-center border-t border-dashed border-[#5B240B]/10 pt-3 mt-auto">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest m-0">
                Dine-In • DIY Boiling Pots • San Pablo City
              </p>
            </div>
          </div>
        </div>

      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        contactInfo={contactInfo}
        diySelection={diySelection}
        diyTotal={diyTotal}
        cart={cart}
        cartTotal={cartTotal}
        onAuthSuccess={(user) => {
          setClientUser(user);
          proceedToBookingForm(user);
        }}
        onProceedAsGuest={() => {
          proceedToBookingForm();
        }}
      />
    </section>
  );
}
