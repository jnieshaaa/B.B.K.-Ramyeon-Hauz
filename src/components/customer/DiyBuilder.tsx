import { useState } from 'react';
import type { Product, DIYSelection, ContactInfo } from '../../models/MenuModel';
import AuthModal from './AuthModal';

interface DiyBuilderProps {
  products: Product[];
  diySelection: DIYSelection;
  setDiyRamyeon: (product: Product | null) => void;
  addTopping: (product: Product) => void;
  removeTopping: (product: Product) => void;
  setDiyDrink: (product: Product | null) => void;
  resetDiyBuilder: () => void;
  diyTotal: number;
  clientUser: { email: string; name?: string; phone?: string } | null;
  setClientUser: (user: { email: string; name?: string; phone?: string } | null) => void;
  contactInfo: ContactInfo;
}

export default function DiyBuilder({
  products,
  diySelection,
  setDiyRamyeon,
  addTopping,
  removeTopping,
  setDiyDrink,
  resetDiyBuilder,
  diyTotal,
  clientUser,
  setClientUser,
  contactInfo
}: DiyBuilderProps) {
  // Filter products dynamically from database state so that admin modifications show up here
  const ramyeons = products.filter(p => p.category === 'ramyeon');
  const toppings = products.filter(p => p.category === 'toppings');
  const drinks = products.filter(p => p.category === 'drinks');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const getToppingQuantity = (productId: string) => {
    const found = diySelection.toppings.find(t => t.product.id === productId);
    return found ? found.quantity : 0;
  };

  const handleOrderDineIn = () => {
    if (!clientUser) {
      setIsAuthModalOpen(true);
    } else {
      proceedToBookingForm();
    }
  };

  const proceedToBookingForm = (prefilledUser?: { name?: string; phone?: string; email?: string }) => {
    // Generate a summary text to pre-fill the inquiry message
    let summary = `Hi B.B.K. Ramyeon Hauz! I'd like to dine in and order this DIY bowl combination:\n`;
    if (diySelection.ramyeon) {
      summary += `- Base: ${diySelection.ramyeon.name} (₱${diySelection.ramyeon.price})\n`;
    }
    if (diySelection.toppings.length > 0) {
      summary += `- Toppings:\n`;
      diySelection.toppings.forEach(t => {
        summary += `  * ${t.product.name} x${t.quantity} (₱${t.product.price * t.quantity})\n`;
      });
    }
    if (diySelection.drink) {
      summary += `- Drink: ${diySelection.drink.name} (₱${diySelection.drink.price})\n`;
    }
    summary += `Total Price estimate: ₱${diyTotal}\n`;
    summary += `Please reserve a dine-in slot for me!`;

    // Copy to clipboard or notify
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

    // Scroll to inquiries
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
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* STEP 1: RAMYEON BASE */}
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-[#5B240B]/5 pb-3">
              <span className="w-8 h-8 rounded-full bg-[#D65113] text-white flex items-center justify-center font-black text-sm">
                1
              </span>
              <h3 className="text-base font-extrabold text-[#5B240B] m-0">Choose Your Ramyeon Noodle Base</h3>
            </div>
            <p className="text-slate-500 text-xs font-semibold m-0">Select exactly one premium Korean instant noodle base.</p>
            <div className="flex flex-col gap-3.5">
              {ramyeons.map(p => (
                <div 
                  key={p.id} 
                  className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer hover:border-[#D65113] hover:bg-slate-50/20 transition-all ${
                    diySelection.ramyeon?.id === p.id 
                      ? 'border-2 border-[#D65113] bg-[#FAF1D6]/20' 
                      : 'border-[#5B240B]/10'
                  }`}
                  onClick={() => setDiyRamyeon(diySelection.ramyeon?.id === p.id ? null : p)}
                >
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-[#5B240B]/10" />
                  <div className="flex flex-col grow">
                    <h4 className="text-sm font-extrabold text-[#5B240B] m-0">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 m-0 mt-1 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <span className="text-sm font-black text-[#D65113]">₱{p.price}</span>
                    <div className={`w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center ${
                      diySelection.ramyeon?.id === p.id ? 'border-[#D65113] bg-[#D65113]' : ''
                    }`}>
                      {diySelection.ramyeon?.id === p.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: TOPPINGS */}
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-[#5B240B]/5 pb-3">
              <span className="w-8 h-8 rounded-full bg-[#D65113] text-white flex items-center justify-center font-black text-sm">
                2
              </span>
              <h3 className="text-base font-extrabold text-[#5B240B] m-0">Load Up on Toppings</h3>
            </div>
            <p className="text-slate-500 text-xs font-semibold m-0">Add toppings to build flavor (select as many as you like).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toppings.map(p => {
                const qty = getToppingQuantity(p.id);
                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center gap-4 border rounded-2xl p-4 hover:border-[#D65113] transition-all ${
                      qty > 0 ? 'border-2 border-[#D65113] bg-[#FAF1D6]/5' : 'border-[#5B240B]/10'
                    }`}
                  >
                    <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-[#5B240B]/10" />
                    <div className="flex flex-col">
                      <h4 className="text-xs font-extrabold text-[#5B240B] m-0">{p.name}</h4>
                      <p className="text-[11px] text-[#D65113] font-black m-0 mt-1">₱{p.price}</p>
                    </div>
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
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 border-none text-[#5B240B] font-extrabold text-sm flex items-center justify-center cursor-pointer transition-colors outline-none"
                        onClick={() => addTopping(p)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: DRINKS */}
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-[#5B240B]/5 pb-3">
              <span className="w-8 h-8 rounded-full bg-[#D65113] text-white flex items-center justify-center font-black text-sm">
                3
              </span>
              <h3 className="text-base font-extrabold text-[#5B240B] m-0">Select a Chilled Korean Drink</h3>
            </div>
            <p className="text-slate-500 text-xs font-semibold m-0">Cool down the heat with a traditional Korean soda or milk drink (optional).</p>
            <div className="flex flex-col gap-3.5">
              {drinks.map(p => (
                <div 
                  key={p.id} 
                  className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer hover:border-[#D65113] hover:bg-slate-50/20 transition-all ${
                    diySelection.drink?.id === p.id 
                      ? 'border-2 border-[#D65113] bg-[#FAF1D6]/20' 
                      : 'border-[#5B240B]/10'
                  }`}
                  onClick={() => setDiyDrink(diySelection.drink?.id === p.id ? null : p)}
                >
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-[#5B240B]/10" />
                  <div className="flex flex-col grow">
                    <h4 className="text-sm font-extrabold text-[#5B240B] m-0">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 m-0 mt-1 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <span className="text-sm font-black text-[#D65113]">₱{p.price}</span>
                    <div className={`w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center ${
                      diySelection.drink?.id === p.id ? 'border-[#D65113] bg-[#D65113]' : ''
                    }`}>
                      {diySelection.drink?.id === p.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Bill Receipt Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-[#5B240B]/10 shadow-xl p-6 md:p-8 flex flex-col gap-6 relative font-sans">
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-[#D65113] to-transparent rounded-t-3xl"></div>
            <div className="text-center border-b border-dashed border-[#5B240B]/10 pb-4">
              <h3 className="text-sm font-black tracking-widest text-[#5B240B] m-0">B.B.K. RAMYEON HAUZ</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 m-0">DIY Custom Receipt</p>
            </div>

            <div className="flex flex-col gap-4">
              {diySelection.ramyeon || diySelection.toppings.length > 0 || diySelection.drink ? (
                <>
                  {diySelection.ramyeon && (
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-none">
                      <div className="flex flex-col">
                        <strong className="text-xs text-[#5B240B]">{diySelection.ramyeon.name}</strong>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Base Noodle</span>
                      </div>
                      <span className="text-xs font-black text-[#5B240B]">₱{diySelection.ramyeon.price}</span>
                    </div>
                  )}

                  {diySelection.toppings.length > 0 && (
                    <div className="flex flex-col gap-2 py-2 border-b border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Toppings:</div>
                      {diySelection.toppings.map(t => (
                        <div key={t.product.id} className="flex justify-between items-center text-xs text-slate-600 pl-4">
                          <span className="text-xs">{t.product.name} <small className="text-slate-400 font-bold ml-1">x{t.quantity}</small></span>
                          <span className="font-semibold text-slate-700">₱{t.product.price * t.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {diySelection.drink && (
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-none">
                      <div className="flex flex-col">
                        <strong className="text-xs text-[#5B240B]">{diySelection.drink.name}</strong>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Drink</span>
                      </div>
                      <span className="text-xs font-black text-[#5B240B]">₱{diySelection.drink.price}</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-[#5B240B]/20 my-2"></div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">ESTIMATED TOTAL</span>
                    <span className="text-[#D65113] font-black text-xl">₱{diyTotal}</span>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-4">
                    <button 
                      type="button" 
                      onClick={handleOrderDineIn} 
                      className="w-full bg-[#D65113] hover:bg-[#5B240B] text-white py-3.5 px-4 rounded-xl font-bold text-xs shadow-md shadow-[#D65113]/15 hover:shadow-lg transition-all border-none cursor-pointer outline-none text-center"
                    >
                      Book Dine-In / Submit Order
                    </button>
                    <button 
                      type="button" 
                      onClick={resetDiyBuilder} 
                      className="w-full bg-transparent hover:bg-red-50 text-red-500 py-3 px-4 rounded-xl font-bold text-xs transition-all border border-dashed border-red-200 cursor-pointer outline-none text-center"
                    >
                      Reset Bowl Selection
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 flex flex-col items-center gap-3">
                  <h4 className="text-sm font-bold text-[#5B240B] m-0">Bowl is Empty</h4>
                  <p className="text-xs text-slate-400 m-0">Select a ramyeon base in Step 1 to begin building your custom recipe!</p>
                </div>
              )}
            </div>

            <div className="text-center border-t border-dashed border-[#5B240B]/10 pt-4 mt-auto">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest m-0">Dine-In • DIY Boiling Pots • San Pablo City</p>
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
