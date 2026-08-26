import type { Product, DIYSelection } from '../models/MenuModel';
import { PRODUCTS } from '../data/menuData';

interface DiyBuilderProps {
  diySelection: DIYSelection;
  setDiyRamyeon: (product: Product | null) => void;
  addTopping: (product: Product) => void;
  removeTopping: (product: Product) => void;
  setDiyDrink: (product: Product | null) => void;
  resetDiyBuilder: () => void;
  diyTotal: number;
}

export default function DiyBuilder({
  diySelection,
  setDiyRamyeon,
  addTopping,
  removeTopping,
  setDiyDrink,
  resetDiyBuilder,
  diyTotal
}: DiyBuilderProps) {
  // Filter products by category for easy step selection
  const ramyeons = PRODUCTS.filter(p => p.category === 'ramyeon');
  const toppings = PRODUCTS.filter(p => p.category === 'toppings');
  const drinks = PRODUCTS.filter(p => p.category === 'drinks');

  const getToppingQuantity = (productId: string) => {
    const found = diySelection.toppings.find(t => t.product.id === productId);
    return found ? found.quantity : 0;
  };

  const handleOrderDineIn = () => {
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
    <section id="diy-builder" className="diy-builder-section">
      <div className="section-header">
        <span className="section-subtitle">Interactive Calculator</span>
        <h2 className="section-title">DIY Bowl Constructor</h2>
        <p className="section-desc">
          Combine ingredients to build your dream Korean Ramyeon bowl. We'll prep the boiling pot, and you cook it your way!
        </p>
      </div>

      <div className="diy-builder-grid">
        {/* Step Selector Panels */}
        <div className="diy-steps-container">
          
          {/* STEP 1: RAMYEON BASE */}
          <div className="diy-step-card">
            <div className="step-header">
              <span className="step-num">1</span>
              <h3>Choose Your Ramyeon Noodle Base</h3>
            </div>
            <p className="step-instructions">Select exactly one premium Korean instant noodle base.</p>
            <div className="diy-options-list">
              {ramyeons.map(p => (
                <div 
                  key={p.id} 
                  className={`diy-option-item clickable ${diySelection.ramyeon?.id === p.id ? 'selected' : ''}`}
                  onClick={() => setDiyRamyeon(diySelection.ramyeon?.id === p.id ? null : p)}
                >
                  <img src={p.image} alt={p.name} className="diy-option-thumb" />
                  <div className="diy-option-info">
                    <h4>{p.name}</h4>
                    <p className="diy-option-desc">{p.description}</p>
                  </div>
                  <div className="diy-option-right">
                    <span className="diy-option-price">₱{p.price}</span>
                    <div className="radio-circle"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: TOPPINGS */}
          <div className="diy-step-card">
            <div className="step-header">
              <span className="step-num">2</span>
              <h3>Load Up on Toppings</h3>
            </div>
            <p className="step-instructions">Add toppings to build flavor (select as many as you like).</p>
            <div className="diy-options-list horizontal">
              {toppings.map(p => {
                const qty = getToppingQuantity(p.id);
                return (
                  <div key={p.id} className={`diy-topping-item-card ${qty > 0 ? 'selected' : ''}`}>
                    <img src={p.image} alt={p.name} className="diy-topping-thumb" />
                    <div className="diy-topping-details">
                      <h4>{p.name}</h4>
                      <p className="diy-topping-price">₱{p.price}</p>
                    </div>
                    <div className="quantity-controller">
                      <button 
                        type="button" 
                        className="qty-btn minus"
                        onClick={() => removeTopping(p)}
                        disabled={qty === 0}
                      >
                        &minus;
                      </button>
                      <span className="qty-count">{qty}</span>
                      <button 
                        type="button" 
                        className="qty-btn plus"
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
          <div className="diy-step-card">
            <div className="step-header">
              <span className="step-num">3</span>
              <h3>Select a Chilled Korean Drink</h3>
            </div>
            <p className="step-instructions">Cool down the heat with a traditional Korean soda or milk drink (optional).</p>
            <div className="diy-options-list">
              {drinks.map(p => (
                <div 
                  key={p.id} 
                  className={`diy-option-item clickable ${diySelection.drink?.id === p.id ? 'selected' : ''}`}
                  onClick={() => setDiyDrink(diySelection.drink?.id === p.id ? null : p)}
                >
                  <img src={p.image} alt={p.name} className="diy-option-thumb" />
                  <div className="diy-option-info">
                    <h4>{p.name}</h4>
                    <p className="diy-option-desc">{p.description}</p>
                  </div>
                  <div className="diy-option-right">
                    <span className="diy-option-price">₱{p.price}</span>
                    <div className="radio-circle"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Bill Receipt Summary */}
        <div className="diy-receipt-container">
          <div className="diy-receipt">
            <div className="receipt-header">
              <h3>B.B.K. RAMYEON HAUZ</h3>
              <p>DIY Custom Receipt</p>
              <div className="receipt-border-decor"></div>
            </div>

            <div className="receipt-body">
              {diySelection.ramyeon || diySelection.toppings.length > 0 || diySelection.drink ? (
                <>
                  {diySelection.ramyeon && (
                    <div className="receipt-line-item">
                      <div className="item-name">
                        <strong>🍜 {diySelection.ramyeon.name}</strong>
                        <span>Base Noodle</span>
                      </div>
                      <span className="item-price">₱{diySelection.ramyeon.price}</span>
                    </div>
                  )}

                  {diySelection.toppings.length > 0 && (
                    <div className="receipt-toppings-group">
                      <div className="group-label">Toppings:</div>
                      {diySelection.toppings.map(t => (
                        <div key={t.product.id} className="receipt-line-item nested">
                          <span className="item-name">{t.product.name} <small>x{t.quantity}</small></span>
                          <span className="item-price">₱{t.product.price * t.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {diySelection.drink && (
                    <div className="receipt-line-item">
                      <div className="item-name">
                        <strong>🥤 {diySelection.drink.name}</strong>
                        <span>Drink</span>
                      </div>
                      <span className="item-price">₱{diySelection.drink.price}</span>
                    </div>
                  )}

                  <div className="receipt-separator"></div>

                  <div className="receipt-total-row">
                    <span>ESTIMATED TOTAL</span>
                    <span className="total-price">₱{diyTotal}</span>
                  </div>

                  <div className="receipt-actions">
                    <button 
                      type="button" 
                      onClick={handleOrderDineIn} 
                      className="btn-receipt-action"
                    >
                      Book Dine-In / Submit Order
                    </button>
                    <button 
                      type="button" 
                      onClick={resetDiyBuilder} 
                      className="btn-receipt-reset"
                    >
                      Reset Bowl Selection
                    </button>
                  </div>
                </>
              ) : (
                <div className="receipt-empty-state">
                  <div className="empty-ramen-bowl">🍜</div>
                  <h4>Bowl is Empty</h4>
                  <p>Select a ramyeon base in Step 1 to begin building your custom recipe!</p>
                </div>
              )}
            </div>

            <div className="receipt-footer">
              <p>Dine-In • DIY Boiling Pots • San Pablo City</p>
              <div className="receipt-border-decor bottom"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
