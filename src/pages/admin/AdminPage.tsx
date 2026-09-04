import React, { useState, useMemo, useEffect } from 'react';
import type { Product, Inquiry, InventoryItem, AuditLogEntry, StockMovement, ContactInfo, Category, CustomerOrder } from '../../models/MenuModel';
import AdminLogin from './AdminLogin';
import AdminSidebar from '../../components/layout/AdminSidebar';
import DashboardOverview from './views/OverviewView';
import CatalogManager from './views/CatalogManagerView';
import BookingsManager from './views/BookingsView';
import InventoryManager from './views/InventoryView';
import AuditLogsManager from './views/AuditLogsView';
import SettingsManager from './views/SettingsView';
import PosTerminalView from './views/PosTerminalView';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface AdminDashboardProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  editProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProducts: () => Promise<void>;

  // Inquiry management props
  inquiries: Inquiry[];
  resolveInquiry: (id: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  // Inventory management props
  inventory: InventoryItem[];
  auditLogs: AuditLogEntry[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastAudited'>) => Promise<InventoryItem>;
  logAuditRecord: (entry: Omit<AuditLogEntry, 'id' | 'itemName' | 'recordedCount' | 'discrepancy'>) => Promise<void>;
  resetInventory: () => Promise<void>;
  stockMovements: StockMovement[];
  logStockMovement: (entry: Omit<StockMovement, 'id' | 'itemName'>) => Promise<void>;
  resetStockMovements: () => Promise<void>;

  // Settings props
  contactInfo: ContactInfo;
  updateContactInfo: (newInfo: ContactInfo) => void;

  // Category management props
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  editCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Global toast prop
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Maintenance props
  maintenanceMode: { active: boolean; message: string };
  updateMaintenanceMode: (active: boolean, message?: string) => Promise<void>;

  // Cooking fee props
  cookingFee?: number;
  updateCookingFee?: (fee: number) => Promise<void>;

  // Customer orders props
  orders?: CustomerOrder[];
  lookupOrder?: (transactionNumber: string) => Promise<CustomerOrder | undefined> | CustomerOrder | undefined;
  completeCustomerOrder?: (transactionNumber: string) => Promise<void> | void;
}

export default function AdminDashboard({
  products,
  addProduct,
  editProduct,
  deleteProduct,
  resetProducts,
  inquiries,
  resolveInquiry,
  deleteInquiry,
  inventory,
  auditLogs,
  addInventoryItem,
  logAuditRecord,
  resetInventory,
  stockMovements,
  logStockMovement,
  resetStockMovements,
  contactInfo,
  updateContactInfo,
  categories,
  addCategory,
  editCategory,
  deleteCategory,
  showToast,
  maintenanceMode,
  updateMaintenanceMode,
  cookingFee,
  updateCookingFee,
  orders,
  lookupOrder,
  completeCustomerOrder
}: AdminDashboardProps) {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('bbk_admin_auth') === 'true';
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check active Supabase Auth session or local fallback session
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        sessionStorage.setItem('bbk_admin_auth', 'true');
      }
    });

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        sessionStorage.setItem('bbk_admin_auth', 'true');
      } else {
        const isLocalAuth = sessionStorage.getItem('bbk_local_admin') === 'true';
        if (!isLocalAuth) {
          setIsLoggedIn(false);
          sessionStorage.removeItem('bbk_admin_auth');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Mobile sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tab navigation page state
  const [currentPage, setCurrentPage] = useState<'overview' | 'pos' | 'products' | 'bookings' | 'inventory' | 'audit-logs' | 'settings'>('overview');

  // Calculates quick statistics counts
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalInquiries = inquiries.length;
    const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
    const lowStockCount = inventory.filter(item => item.currentStock <= item.minStockLevel).length;
    const totalAuditLogs = auditLogs.length;

    return {
      totalProducts,
      totalInquiries,
      pendingInquiries,
      lowStockCount,
      totalAuditLogs
    };
  }, [products, inquiries, inventory, auditLogs]);

  // Login handler using native Supabase Auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username.trim().toLowerCase(),
          password: password.trim()
        });

        if (error) {
          // If Supabase auth failed, verify if using local demo credentials as fallback
          if (username.trim().toLowerCase() === 'admin@bbk.com' && password === 'admin123') {
            localVerify();
            return;
          }
          setLoginError(error.message || 'Invalid administrative username or password.');
          return;
        }

        if (data?.user) {
          sessionStorage.setItem('bbk_admin_auth', 'true');
          sessionStorage.removeItem('bbk_local_admin');
          setIsLoggedIn(true);
          setLoginError('');
          showToast('Successfully logged in as Administrator via Supabase Auth!', 'success');
        }
      } catch (err: any) {
        console.error('Database login error, falling back to local verification:', err);
        localVerify();
      }
    } else {
      localVerify();
    }

    function localVerify() {
      if (username.trim().toLowerCase() === 'admin@bbk.com' && password === 'admin123') {
        sessionStorage.setItem('bbk_admin_auth', 'true');
        sessionStorage.setItem('bbk_local_admin', 'true');
        setIsLoggedIn(true);
        setLoginError('');
        showToast('Successfully logged in as Administrator (Local Demo Mode)!', 'success');
      } else {
        setLoginError('Invalid administrative username or password.');
      }
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    }
    sessionStorage.removeItem('bbk_admin_auth');
    sessionStorage.removeItem('bbk_local_admin');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    showToast('Logged out of Admin Panel.', 'info');
    setShowLogoutConfirm(false);
  };

  // Render Login wall
  if (!isLoggedIn) {
    return (
      <AdminLogin
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        onSubmit={handleLoginSubmit}
        onBackToSite={() => { window.location.search = ''; }}
      />
    );
  }

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-white font-sans text-slate-800">
        {/* Sidebar Layout component */}
        <AdminSidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pendingInquiriesCount={stats.pendingInquiries}
          lowStockCount={stats.lowStockCount}
          onLogout={handleLogoutClick}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto w-full">
          <header className="px-4 py-4 md:px-8 md:py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 gap-4">
            <div className="flex items-center min-w-0">
              {/* Hamburger Button for mobile */}
              <button
                type="button"
                className="md:hidden mr-3 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl bg-transparent border-none outline-none cursor-pointer shrink-0 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 font-sans tracking-tight truncate">
                {currentPage === 'overview' && 'Dashboard Overview'}
                {currentPage === 'pos' && 'Point of Sale (POS) Terminal'}
                {currentPage === 'products' && 'Product Catalog'}
                {currentPage === 'bookings' && 'Reservations & Inquiries'}
                {currentPage === 'inventory' && 'Inventory Ledger'}
                {currentPage === 'audit-logs' && 'Physical Audit History'}
                {currentPage === 'settings' && 'Contact & Info Settings'}
              </h1>
            </div>
            
            {/* Quick stats indicator */}
            <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Database Active
              </span>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
            {currentPage === 'overview' && (
              <DashboardOverview
                stats={stats}
                inventory={inventory}
                inquiries={inquiries}
                onViewInventory={() => setCurrentPage('inventory')}
                onViewBookings={() => setCurrentPage('bookings')}
                onOpenPos={() => setCurrentPage('pos')}
              />
            )}

            {currentPage === 'pos' && (
              <PosTerminalView
                products={products}
                categories={categories}
                inventory={inventory}
                logStockMovement={logStockMovement}
                contactInfo={contactInfo}
                showToast={showToast}
                cookingFee={cookingFee}
                orders={orders}
                lookupOrder={lookupOrder}
                completeCustomerOrder={completeCustomerOrder}
              />
            )}

            {currentPage === 'products' && (
              <CatalogManager
                products={products}
                addProduct={addProduct}
                editProduct={editProduct}
                deleteProduct={deleteProduct}
                resetProducts={resetProducts}
                categories={categories}
                addCategory={addCategory}
                editCategory={editCategory}
                deleteCategory={deleteCategory}
              />
            )}

            {currentPage === 'bookings' && (
              <BookingsManager
                inquiries={inquiries}
                resolveInquiry={resolveInquiry}
                deleteInquiry={deleteInquiry}
              />
            )}

            {currentPage === 'inventory' && (
              <InventoryManager
                inventory={inventory}
                addInventoryItem={addInventoryItem}
                logAuditRecord={logAuditRecord}
                resetInventory={resetInventory}
                stockMovements={stockMovements}
                logStockMovement={logStockMovement}
                resetStockMovements={resetStockMovements}
                products={products}
              />
            )}

            {currentPage === 'audit-logs' && (
              <AuditLogsManager
                auditLogs={auditLogs}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsManager
                contactInfo={contactInfo}
                updateContactInfo={updateContactInfo}
                maintenanceMode={maintenanceMode}
                updateMaintenanceMode={updateMaintenanceMode}
                cookingFee={cookingFee}
                updateCookingFee={updateCookingFee}
              />
            )}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1 font-sans">Confirm Logout</h3>
            <p className="text-sm text-slate-500 mb-6 font-sans leading-relaxed">
              Are you sure you want to log out of the B.B.K. admin panel?
            </p>

            <div className="flex gap-3 w-full">
              <button 
                type="button"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all font-sans cursor-pointer bg-transparent"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-600/10 active:scale-95 transition-all font-sans cursor-pointer"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
