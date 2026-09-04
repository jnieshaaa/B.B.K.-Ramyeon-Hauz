import { useState } from 'react';
import type { ContactInfo, DIYSelection, CartItem } from '../../models/MenuModel';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { sha256 } from '../../utils/crypto';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: ContactInfo;
  diySelection?: DIYSelection;
  diyTotal?: number;
  cart?: CartItem[];
  cartTotal?: number;
  onAuthSuccess: (user: { email: string; name?: string; phone?: string }) => void;
  onProceedAsGuest: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  contactInfo,
  diySelection,
  diyTotal,
  cart,
  cartTotal,
  onAuthSuccess,
  onProceedAsGuest
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('All fields are required.');
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const hashedPassword = await sha256(password.trim());
        const clientRoleHash = await sha256('client');

        // Fetch user from DB
        const { data, error } = await supabase
          .from('users')
          .select('email, password_hash, roles(role_hash)')
          .eq('email', email.trim().toLowerCase())
          .single();

        if (error || !data) {
          setErrorMsg('Invalid email or password credentials.');
          setLoading(false);
          return;
        }

        if (data.password_hash !== hashedPassword) {
          setErrorMsg('Invalid email or password credentials.');
          setLoading(false);
          return;
        }

        const rolesData = data.roles as any;
        if (!rolesData || rolesData.role_hash !== clientRoleHash) {
          setErrorMsg('Unauthorized: This user account does not possess a client role.');
          setLoading(false);
          return;
        }

        // Successfully logged in
        onAuthSuccess({ email: data.email });
        onClose();
      } catch (err) {
        console.error('Client login database error:', err);
        setErrorMsg('Database error occurred. Please try checking out as a guest.');
      }
    } else {
      // Mock local client login for demo
      if (email.trim().toLowerCase() === 'client@bbk.com' && password === 'client123') {
        onAuthSuccess({ email: 'client@bbk.com', name: 'Demo Client', phone: '0900 000 0000' });
        onClose();
      } else {
        setErrorMsg('Local demo verification failed. Use client@bbk.com / client123 or proceed as Guest.');
      }
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim() || !name.trim() || !phone.trim()) {
      setErrorMsg('All fields are required.');
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const hashedPassword = await sha256(password.trim());
        const clientRoleHash = await sha256('client');

        // 1. Find client role_id
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('role_hash', clientRoleHash)
          .single();

        if (roleError || !roleData) {
          setErrorMsg('Error retrieving client registration rules. Please contact shop.');
          setLoading(false);
          return;
        }

        // 2. Insert new user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            email: email.trim().toLowerCase(),
            password_hash: hashedPassword,
            role_id: roleData.id
          });

        if (insertError) {
          if (insertError.code === '23505') {
            setErrorMsg('An account with this email address already exists.');
          } else {
            setErrorMsg('Registration failed: ' + insertError.message);
          }
          setLoading(false);
          return;
        }

        // Successfully registered & auto logged in
        onAuthSuccess({ email: email.trim().toLowerCase(), name: name.trim(), phone: phone.trim() });
        alert('Account created successfully! Proceeding to reserve your order...');
        onClose();
      } catch (err) {
        console.error('Client registration database error:', err);
        setErrorMsg('Database error occurred. Please try checking out as a guest.');
      }
    } else {
      // Mock local client register
      onAuthSuccess({ email: email.trim().toLowerCase(), name: name.trim(), phone: phone.trim() });
      alert('Mock account created successfully!');
      onClose();
    }
    setLoading(false);
  };

  // Helper trigger to download receipt as an e-invoice image
  const handleDownloadReceiptClick = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 450;
    const items = (cart && cart.length > 0) ? cart : [];
    const effectiveTotal = cartTotal || diyTotal || 0;

    // Calculate height dynamically
    let height = 300;
    if (items.length > 0) {
      items.forEach(item => {
        height += 50;
        if (item.type === 'bowl' && item.bowlDetails) {
          if (item.bowlDetails.toppings) height += item.bowlDetails.toppings.length * 22;
          if (item.bowlDetails.drinks && item.bowlDetails.drinks.length > 0) {
            height += item.bowlDetails.drinks.length * 22;
          } else if (item.bowlDetails.drink) {
            height += 25;
          }
        }
      });
    } else {
      const toppingsCount = diySelection?.toppings?.length || 0;
      const drinksCount = diySelection?.drinks?.length || (diySelection?.drink ? 1 : 0);
      height = 340 + (toppingsCount > 0 ? 40 + toppingsCount * 28 : 0) + (drinksCount > 0 ? 40 + drinksCount * 28 : 0);
    }

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Border outline
    ctx.strokeStyle = '#5B240B';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Header Title
    ctx.fillStyle = '#5B240B';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Courier New';
    ctx.fillText('B.B.K. RAMYEON HAUZ', width / 2, 45);

    ctx.font = 'bold 12px Courier New';
    ctx.fillText('GROUP DINE-IN E-INVOICE', width / 2, 70);
    ctx.font = '10px Courier New';
    ctx.fillText('San Pablo City, Philippines', width / 2, 88);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, width / 2, 105);

    // Dashed Divider
    ctx.strokeStyle = '#5B240B';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(25, 120);
    ctx.lineTo(width - 25, 120);
    ctx.stroke();

    let y = 145;

    if (items.length > 0) {
      items.forEach((item, index) => {
        ctx.textAlign = 'left';
        ctx.font = 'bold 12px Courier New';
        ctx.fillText(`${index + 1}. ${item.name.toUpperCase()} (x${item.quantity})`, 30, y);
        ctx.textAlign = 'right';
        ctx.fillText(`PHP ${item.price * item.quantity}`, width - 35, y);
        y += 20;

        if (item.type === 'bowl' && item.bowlDetails) {
          ctx.font = '11px Courier New';
          if (item.bowlDetails.ramyeon) {
            ctx.textAlign = 'left';
            ctx.fillText(`   Base: ${item.bowlDetails.ramyeon.name}`, 35, y);
            y += 18;
          }
          if (item.bowlDetails.toppings && item.bowlDetails.toppings.length > 0) {
            item.bowlDetails.toppings.forEach(t => {
              ctx.textAlign = 'left';
              ctx.fillText(`   + ${t.product.name} (x${t.quantity})`, 35, y);
              y += 18;
            });
          }
          if (item.bowlDetails.drinks && item.bowlDetails.drinks.length > 0) {
            item.bowlDetails.drinks.forEach(d => {
              ctx.textAlign = 'left';
              ctx.fillText(`   + Drink: ${d.product.name} (x${d.quantity})`, 35, y);
              y += 18;
            });
          } else if (item.bowlDetails.drink) {
            ctx.textAlign = 'left';
            ctx.fillText(`   + Drink: ${item.bowlDetails.drink.name}`, 35, y);
            y += 18;
          }
        }
        y += 8;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();
        y += 15;
      });
    } else if (diySelection) {
      // Single bowl fallback
      ctx.textAlign = 'left';
      ctx.font = 'bold 12px Courier New';
      ctx.fillText('BASE RAMYEON NOODLE', 30, y);
      ctx.font = '13px Courier New';
      ctx.fillText(diySelection.ramyeon ? diySelection.ramyeon.name : 'None Selected', 35, y + 22);
      ctx.textAlign = 'right';
      ctx.fillText(diySelection.ramyeon ? `PHP ${diySelection.ramyeon.price}` : 'PHP 0', width - 35, y + 22);
      y += 45;

      if (diySelection.toppings && diySelection.toppings.length > 0) {
        diySelection.toppings.forEach(t => {
          y += 24;
          ctx.textAlign = 'left';
          ctx.fillText(`${t.product.name} (x${t.quantity})`, 35, y);
          ctx.textAlign = 'right';
          ctx.fillText(`PHP ${t.product.price * t.quantity}`, width - 35, y);
        });
        y += 22;
      }

      const fallbackDrinks = diySelection.drinks && diySelection.drinks.length > 0
        ? diySelection.drinks
        : (diySelection.drink ? [{ product: diySelection.drink, quantity: 1 }] : []);

      if (fallbackDrinks.length > 0) {
        fallbackDrinks.forEach(d => {
          y += 24;
          ctx.textAlign = 'left';
          ctx.fillText(`🥤 ${d.product.name} (x${d.quantity})`, 35, y);
          ctx.textAlign = 'right';
          ctx.fillText(`PHP ${d.product.price * d.quantity}`, width - 35, y);
        });
        y += 22;
      }
    }

    // Total Section
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(width - 25, y);
    ctx.stroke();
    y += 25;

    ctx.textAlign = 'left';
    ctx.font = 'bold 14px Courier New';
    ctx.fillText('GRAND TOTAL', 30, y);
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px Courier New';
    ctx.fillText(`PHP ${effectiveTotal}`, width - 35, y);

    // Footer Section
    y += 25;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(width - 25, y);
    ctx.stroke();
    
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px Courier New';
    ctx.fillText('MAKE • EAT • ENJOY', width / 2, y + 25);
    ctx.font = '9px Courier New';
    ctx.fillText('Send this e-invoice receipt image to our FB Page/Email', width / 2, y + 42);
    ctx.fillText('to complete your order reservation.', width / 2, y + 54);

    // Download PNG link trigger
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `bbk-group-order-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-[3000] p-4 box-border font-sans">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h3 className="text-base font-black text-[#5B240B] m-0">Secure Your Order</h3>
          <button 
            type="button" 
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none text-xl font-bold cursor-pointer outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Modal Scrollable Contents */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 shrink-0">
            <button
              type="button"
              className={`flex-1 py-2.5 font-bold text-xs cursor-pointer border-none outline-none transition-all ${
                activeTab === 'login' 
                  ? 'border-b-2 border-b-blue-600 text-blue-600 bg-blue-50/10' 
                  : 'bg-transparent text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setShowPassword(false); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 font-bold text-xs cursor-pointer border-none outline-none transition-all ${
                activeTab === 'register' 
                  ? 'border-b-2 border-b-blue-600 text-blue-600 bg-blue-50/10' 
                  : 'bg-transparent text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setShowPassword(false); }}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-xs font-bold text-center shrink-0">
              {errorMsg}
            </div>
          )}

          {/* Tab Views */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                <input
                  type="email"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all box-border"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password *</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all box-border"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none outline-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none py-3 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/15 transition-all outline-none text-center disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In & Proceed'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                  <input
                    type="text"
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all box-border"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone Number *</label>
                  <input
                    type="tel"
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all box-border"
                    placeholder="e.g. 0912 345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                <input
                  type="email"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all box-border"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password *</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all box-border"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none outline-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none py-3 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/15 transition-all outline-none text-center disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account & Proceed'}
              </button>
            </form>
          )}

          {/* OR Guest Checkout Section */}
          <div className="border-t border-slate-100 pt-6 flex flex-col gap-4 text-center shrink-0">
            <div className="relative flex py-2 items-center justify-center shrink-0">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or Continue as Guest</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed m-0">
              No account? No problem! Order directly via our Facebook Page or Email. We recommend downloading your DIY recipe e-invoice to send it to us:
            </p>

            <div className="bg-[#FAF1D6]/40 border border-[#5B240B]/10 rounded-2xl p-4 text-left flex flex-col gap-2.5">
              <div className="text-[11px] text-[#5B240B]/90 font-semibold flex flex-col gap-1">
                <span><strong>Messenger:</strong> <a href={contactInfo.messengerLink} target="_blank" rel="noopener noreferrer" className="text-[#D65113] hover:underline font-bold">{contactInfo.messengerName}</a></span>
                <span><strong>Email:</strong> <a href={`mailto:${contactInfo.email}`} className="text-[#D65113] hover:underline font-bold">{contactInfo.email}</a></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDownloadReceiptClick}
                className="w-full bg-[#5B240B] hover:bg-[#D65113] text-white border-none py-3 rounded-xl font-bold text-xs cursor-pointer transition-all outline-none text-center"
              >
                Download e-Invoice
              </button>
              <button
                type="button"
                onClick={() => {
                  onProceedAsGuest();
                  onClose();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-none py-3 rounded-xl font-bold text-xs cursor-pointer transition-all outline-none text-center"
              >
                Continue to Form
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
