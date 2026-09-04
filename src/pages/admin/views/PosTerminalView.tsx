import { useState, useMemo } from 'react';
import type { Product, Category, InventoryItem, StockMovement, ContactInfo } from '../../../models/MenuModel';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { downloadEInvoiceReceipt } from '../../../utils/receiptGenerator';

interface PosOrderItem {
  product: Product;
  quantity: number;
}

interface PosCompletedSale {
  orderNumber: string;
  timestamp: string;
  orderType: 'Dine-In' | 'Takeout' | 'Delivery';
  tableNumber: string;
  customerName: string;
  items: PosOrderItem[];
  subtotal: number;
  discountType: 'none' | 'senior_pwd' | 'promo' | 'custom';
  discountAmount: number;
  totalDue: number;
  paymentMethod: 'Cash' | 'GCash' | 'Maya' | 'Card';
  amountTendered: number;
  changeDue: number;
  paymentReference?: string;
}

interface PosTerminalViewProps {
  products: Product[];
  categories: Category[];
  inventory: InventoryItem[];
  logStockMovement: (entry: Omit<StockMovement, 'id' | 'itemName'>) => Promise<void>;
  contactInfo: ContactInfo;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function PosTerminalView({
  products,
  categories,
  inventory,
  logStockMovement,
  contactInfo,
  showToast
}: PosTerminalViewProps) {
  // Order ticket state
  const [orderItems, setOrderItems] = useState<PosOrderItem[]>([]);
  const [orderType, setOrderType] = useState<'Dine-In' | 'Takeout' | 'Delivery'>('Dine-In');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [customerName, setCustomerName] = useState('');

  // Filtering states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Discount states
  const [discountType, setDiscountType] = useState<'none' | 'senior_pwd' | 'promo' | 'custom'>('none');
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // Payment modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | 'Maya' | 'Card'>('Cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState('');

  // Receipt modal state
  const [completedSale, setCompletedSale] = useState<PosCompletedSale | null>(null);

  // Quick category list with virtual "All Items"
  const fullCategories = useMemo(() => {
    return [{ id: 'all', name: 'All Menu Items', iconName: 'menu' }, ...categories];
  }, [categories]);

  // Filtered products for selection grid
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Add product to POS ticket
  const handleAddItem = (product: Product) => {
    const inv = inventory.find((i) => i.id === product.id);
    const stockAvailable = inv ? inv.currentStock : 999;

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= stockAvailable) {
          showToast(`Cannot add more "${product.name}". Maximum available stock (${stockAvailable}) reached.`, 'error');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (stockAvailable <= 0) {
          showToast(`"${product.name}" is currently out of stock.`, 'error');
          return prev;
        }
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  // Update quantity in POS ticket
  const handleUpdateQty = (productId: string, delta: number) => {
    const inv = inventory.find((i) => i.id === productId);
    const stockAvailable = inv ? inv.currentStock : 999;

    setOrderItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > stockAvailable) {
              showToast(`Only ${stockAvailable} available in stock.`, 'error');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PosOrderItem[];
    });
  };

  // Remove item from ticket
  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear ticket
  const handleClearOrder = () => {
    if (orderItems.length === 0) return;
    if (confirm('Are you sure you want to void and clear the current order ticket?')) {
      setOrderItems([]);
      setDiscountType('none');
      setCustomDiscount(0);
      setCustomerName('');
    }
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [orderItems]);

  const discountAmount = useMemo(() => {
    if (discountType === 'senior_pwd') return Math.round(subtotal * 0.2);
    if (discountType === 'promo') return Math.round(subtotal * 0.1);
    if (discountType === 'custom') return Math.min(subtotal, Math.max(0, customDiscount));
    return 0;
  }, [subtotal, discountType, customDiscount]);

  const totalDue = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const numericTendered = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, numericTendered - totalDue);
  const isCashInsufficient = paymentMethod === 'Cash' && numericTendered < totalDue;

  // Open checkout modal
  const handleOpenCheckout = () => {
    if (orderItems.length === 0) {
      showToast('Please add items to the ticket before checkout.', 'error');
      return;
    }
    setAmountTendered(totalDue.toString());
    setPaymentReference('');
    setIsCheckoutOpen(true);
  };

  // Finalize POS sale
  const handleCompleteSale = async () => {
    if (isCashInsufficient) {
      showToast('Tendered cash is less than the total due.', 'error');
      return;
    }

    const orderNumber = `BBK-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    // Log stock movements for each sold item
    try {
      for (const item of orderItems) {
        await logStockMovement({
          itemId: item.product.id,
          date: today,
          displayedQty: 0,
          soldQty: item.quantity
        });
      }
    } catch (e) {
      console.error('Error logging stock movement from POS:', e);
    }

    const saleRecord: PosCompletedSale = {
      orderNumber,
      timestamp: new Date().toISOString(),
      orderType,
      tableNumber: orderType === 'Dine-In' ? tableNumber : 'N/A',
      customerName: customerName.trim() || 'Walk-in Customer',
      items: [...orderItems],
      subtotal,
      discountType,
      discountAmount,
      totalDue,
      paymentMethod,
      amountTendered: paymentMethod === 'Cash' ? numericTendered : totalDue,
      changeDue: paymentMethod === 'Cash' ? changeDue : 0,
      paymentReference: paymentReference.trim() || undefined
    };

    setCompletedSale(saleRecord);
    setIsCheckoutOpen(false);
    showToast(`Order #${orderNumber} successfully processed!`, 'success');
  };

  // Reset POS for next customer
  const handleNextOrder = () => {
    setCompletedSale(null);
    setOrderItems([]);
    setDiscountType('none');
    setCustomDiscount(0);
    setCustomerName('');
    setTableNumber('Table 1');
    setPaymentMethod('Cash');
    setAmountTendered('');
    setPaymentReference('');
  };

  // Download e-invoice receipt image
  const handleDownloadInvoiceImage = () => {
    if (!completedSale) return;

    // Convert PosOrderItems to CartItems format
    const cartFormat = completedSale.items.map((it) => ({
      id: it.product.id,
      name: it.product.name,
      type: 'product' as const,
      price: it.product.price,
      quantity: it.quantity,
      product: it.product
    }));

    downloadEInvoiceReceipt({
      cart: cartFormat,
      cartTotal: completedSale.totalDue
    });
  };

  // Trigger browser print for physical thermal receipt
  const handlePrintThermalSlip = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px] font-sans">
      
      {/* 1. LEFT COLUMN: Menu Catalog & Fast Item Selector */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden min-w-0">
        
        {/* Search and Category Filter Header */}
        <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#D65113] outline-none transition-all box-border font-sans"
                placeholder="Quick search product name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer font-bold text-sm"
                  onClick={() => setSearchQuery('')}
                >
                  &times;
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 shrink-0">
              <span>{filteredProducts.length} items available</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {fullCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer outline-none ${
                  activeCategory === cat.id
                    ? 'bg-[#5B240B] text-white border-[#5B240B] shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pt-4 pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map((product) => {
            const inv = inventory.find((i) => i.id === product.id);
            const stock = inv ? inv.currentStock : 0;
            const isOut = stock <= 0;
            const inCartItem = orderItems.find((it) => it.product.id === product.id);

            return (
              <div
                key={product.id}
                onClick={() => !isOut && handleAddItem(product)}
                className={`group relative flex flex-col p-3 rounded-2xl border transition-all select-none ${
                  isOut
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    : 'bg-white border-slate-200/80 hover:border-[#D65113] hover:shadow-md cursor-pointer active:scale-98'
                } ${inCartItem ? 'ring-2 ring-[#D65113]/30 border-[#D65113]' : ''}`}
              >
                {/* Product Thumbnail */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {inCartItem && (
                    <span className="absolute top-1.5 right-1.5 bg-[#D65113] text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {inCartItem.quantity}
                    </span>
                  )}
                  {isOut && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[9px] font-black uppercase tracking-wider text-white bg-red-600 px-2 py-0.5 rounded-md">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col grow justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 m-0 mt-0.5" title={product.name}>
                      {product.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-black text-[#5B240B]">
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        stock <= 5
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {stock} left
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT COLUMN: POS Register / Order Ticket */}
      <div className="w-full lg:w-96 flex flex-col bg-white border border-slate-200 rounded-3xl p-5 shadow-sm shrink-0 overflow-hidden">
        
        {/* Ticket Top Header & Order Mode */}
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-black text-[#5B240B] m-0">Current Order Ticket</h3>
            </div>
            {orderItems.length > 0 && (
              <button
                type="button"
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer"
                onClick={handleClearOrder}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Dine-In / Takeout Toggle */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {(['Dine-In', 'Takeout', 'Delivery'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  orderType === type
                    ? 'bg-white text-[#5B240B] shadow-xs'
                    : 'bg-transparent text-slate-500 hover:text-slate-800'
                }`}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Table / Customer Reference Input */}
          <div className="grid grid-cols-2 gap-2">
            {orderType === 'Dine-In' ? (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Table #</label>
                <select
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 2">Table 2</option>
                  <option value="Table 3">Table 3</option>
                  <option value="Table 4">Table 4</option>
                  <option value="Table 5">Table 5</option>
                  <option value="Table 6">Table 6</option>
                  <option value="Bar Table A">Bar Table A</option>
                  <option value="Bar Table B">Bar Table B</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Note</label>
                <input
                  type="text"
                  placeholder="e.g. For Pickup"
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none box-border"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Name</label>
              <input
                type="text"
                placeholder="Optional name"
                className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none box-border"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Ticket Line Items */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 min-h-0">
          {orderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <svg className="w-10 h-10 mb-2 text-slate-300 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-bold">Ticket is empty</span>
              <p className="text-[10px] text-slate-400 m-0 mt-1">Tap items on the left menu to build this customer order.</p>
            </div>
          ) : (
            orderItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate m-0">{item.product.name}</h5>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {formatCurrency(item.product.price)} each
                  </span>
                </div>

                {/* Qty +/- stepper */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center cursor-pointer hover:bg-slate-100 active:scale-95"
                    onClick={() => handleUpdateQty(item.product.id, -1)}
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center cursor-pointer hover:bg-slate-100 active:scale-95"
                    onClick={() => handleUpdateQty(item.product.id, 1)}
                  >
                    +
                  </button>
                </div>

                <div className="w-16 text-right shrink-0">
                  <span className="text-xs font-black text-[#5B240B]">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>

                <button
                  type="button"
                  className="text-slate-300 hover:text-rose-500 bg-transparent border-none cursor-pointer p-1"
                  onClick={() => handleRemoveItem(item.product.id)}
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Discount Section */}
        <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5 shrink-0">
          {/* Discount Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Discount:</span>
            <div className="flex items-center gap-1">
              <select
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
              >
                <option value="none">None (0%)</option>
                <option value="senior_pwd">Senior/PWD (20%)</option>
                <option value="promo">Promo / Staff (10%)</option>
                <option value="custom">Custom ₱ Amount</option>
              </select>
              {discountType === 'custom' && (
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                  placeholder="₱"
                  value={customDiscount || ''}
                  onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                />
              )}
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-500 font-semibold">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 font-bold">
              <span>Discount applied</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-[#FAF1D6]/60 border border-[#5B240B]/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5B240B]/70">Amount Due</span>
              <span className="text-xs text-slate-400 font-semibold">
                {orderItems.reduce((acc, it) => acc + it.quantity, 0)} total units
              </span>
            </div>
            <span className="text-xl font-black text-[#5B240B]">{formatCurrency(totalDue)}</span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full py-3.5 rounded-xl bg-[#D65113] hover:bg-[#5B240B] text-white font-extrabold text-sm shadow-md shadow-[#D65113]/20 hover:shadow-lg transition-all border-none cursor-pointer outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
            disabled={orderItems.length === 0}
            onClick={handleOpenCheckout}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Proceed to Payment ({formatCurrency(totalDue)})</span>
          </button>
        </div>
      </div>

      {/* 3. PAYMENT / TENDER CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div
          className="fixed inset-0 z-[3000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 m-0">Payment Tender</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  {orderType} • {orderType === 'Dine-In' ? tableNumber : 'Takeout'}
                </p>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none text-xl font-bold cursor-pointer"
                onClick={() => setIsCheckoutOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Total Due Banner */}
            <div className="p-6 bg-[#5B240B] text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF1D6]/70">Total Amount Due</span>
                <h2 className="text-3xl font-black m-0 text-white">{formatCurrency(totalDue)}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-[#FAF1D6]/80">Items: {orderItems.length}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2">
                {(['Cash', 'GCash', 'Maya', 'Card'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-[#D65113] text-white border-[#D65113] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method !== 'Cash') {
                        setAmountTendered(totalDue.toString());
                      }
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Cash Tender Fields */}
              {paymentMethod === 'Cash' && (
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-700">Cash Tendered by Customer</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₱</span>
                    <input
                      type="number"
                      step="any"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-lg text-slate-900 outline-none focus:bg-white focus:border-[#D65113] box-border"
                      placeholder="0.00"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Quick cash denomination chips */}
                  <div className="flex gap-2 flex-wrap">
                    {[totalDue, 100, 200, 500, 1000].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border-none cursor-pointer transition-colors"
                        onClick={() => setAmountTendered(amt.toString())}
                      >
                        {idx === 0 ? 'Exact' : `₱${amt}`}
                      </button>
                    ))}
                  </div>

                  {/* Change Due Display */}
                  <div className={`p-4 rounded-2xl flex justify-between items-center border ${
                    isCashInsufficient
                      ? 'bg-rose-50 border-rose-100 text-rose-800'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  }`}>
                    <span className="text-xs font-bold">
                      {isCashInsufficient ? 'Short by' : 'Change Due'}
                    </span>
                    <span className="text-xl font-black">
                      {isCashInsufficient
                        ? formatCurrency(totalDue - numericTendered)
                        : formatCurrency(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* Digital E-Wallet / Card Reference Input */}
              {paymentMethod !== 'Cash' && (
                <div className="flex flex-col gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
                    Customer is paying via <strong>{paymentMethod}</strong>. Request customer to scan merchant QR or swipe card on POS terminal.
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Reference / Approval Code</label>
                    <input
                      type="text"
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 box-border"
                      placeholder="e.g. GCash Ref # 10023485"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Confirm Checkout Button */}
              <button
                type="button"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all border-none cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                disabled={isCashInsufficient}
                onClick={handleCompleteSale}
              >
                Complete Sale & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETED SALE & THERMAL RECEIPT MODAL */}
      {completedSale && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Actions Header */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h4 className="text-xs font-black text-slate-800 m-0 uppercase tracking-wider">Sale Completed</h4>
              </div>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold border-none cursor-pointer"
                onClick={handleNextOrder}
              >
                Done / Next Order
              </button>
            </div>

            {/* Receipt Thermal Slip Preview Container */}
            <div className="p-6 overflow-y-auto flex flex-col items-center bg-slate-100">
              <div
                id="printable-receipt"
                className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-200 font-mono text-slate-800 text-xs flex flex-col gap-4"
              >
                {/* Store Header */}
                <div className="text-center flex flex-col items-center">
                  <h3 className="font-bold text-base text-[#5B240B] m-0">B.B.K. RAMYEON HAUZ</h3>
                  <p className="text-[10px] text-slate-500 m-0 mt-0.5">DIY Korean Ramyeon Specialty Store</p>
                  <p className="text-[10px] text-slate-500 m-0">{contactInfo.address}</p>
                  <p className="text-[10px] text-slate-500 m-0">Tel: {contactInfo.phone}</p>
                </div>

                <div className="border-t border-dashed border-slate-300"></div>

                {/* Ticket Details */}
                <div className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Receipt No:</span>
                    <strong className="text-slate-900">{completedSale.orderNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Date/Time:</span>
                    <span>{formatDateTime(completedSale.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <strong className="text-[#D65113]">{completedSale.orderType}</strong>
                  </div>
                  {completedSale.orderType === 'Dine-In' && (
                    <div className="flex justify-between">
                      <span>Table:</span>
                      <span>{completedSale.tableNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{completedSale.customerName}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300"></div>

                {/* Line Items */}
                <div className="flex flex-col gap-2">
                  {completedSale.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <div className="flex-1 pr-2">
                        <span>{it.quantity}x {it.product.name}</span>
                        <div className="text-[9px] text-slate-400">@ {formatCurrency(it.product.price)}</div>
                      </div>
                      <span className="font-bold">{formatCurrency(it.product.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-300"></div>

                {/* Financials */}
                <div className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(completedSale.subtotal)}</span>
                  </div>
                  {completedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-{formatCurrency(completedSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300">
                    <span>TOTAL DUE:</span>
                    <span>{formatCurrency(completedSale.totalDue)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Payment ({completedSale.paymentMethod}):</span>
                    <span>{formatCurrency(completedSale.amountTendered)}</span>
                  </div>
                  {completedSale.paymentMethod === 'Cash' && (
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Change:</span>
                      <span>{formatCurrency(completedSale.changeDue)}</span>
                    </div>
                  )}
                  {completedSale.paymentReference && (
                    <div className="text-[9px] text-slate-500 pt-0.5">
                      Ref: {completedSale.paymentReference}
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-slate-300"></div>

                {/* Footer Greetings */}
                <div className="text-center flex flex-col gap-0.5 text-[10px] text-slate-500">
                  <span className="font-bold text-[#5B240B]">MAKE • EAT • ENJOY</span>
                  <span>Thank you for dining with us!</span>
                  <span>Please come again.</span>
                </div>
              </div>
            </div>

            {/* Slip Action Buttons */}
            <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-3 shrink-0">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border-none cursor-pointer transition-colors shadow-sm"
                onClick={handlePrintThermalSlip}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Slip</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5B240B] hover:bg-[#D65113] text-white font-bold text-xs border-none cursor-pointer transition-colors shadow-sm"
                onClick={handleDownloadInvoiceImage}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Save E-Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
