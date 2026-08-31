import React, { useState, useMemo } from 'react';
import type { Product, Inquiry, InventoryItem, AuditLogEntry, StockMovement, ContactInfo, Category } from '../../models/MenuModel';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import DashboardOverview from './DashboardOverview';
import CatalogManager from './CatalogManager';
import BookingsManager from './BookingsManager';
import InventoryManager from './InventoryManager';
import AuditLogsManager from './AuditLogsManager';
import SettingsManager from './SettingsManager';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { sha256 } from '../../utils/crypto';

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
  deleteCategory
}: AdminDashboardProps) {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('bbk_admin_auth') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  // Mobile sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tab navigation page state
  const [currentPage, setCurrentPage] = useState<'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs' | 'settings'>('overview');

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

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isSupabaseConfigured && supabase) {
      try {
        // Hash the password input with SHA-256
        const hashedInputPassword = await sha256(password);

        // Fetch user from DB, join with roles
        const { data, error } = await supabase
          .from('users')
          .select('password_hash, roles(role_hash)')
          .eq('email', username)
          .single();

        if (error || !data) {
          setLoginError('Invalid administrative username or password.');
          return;
        }

        // Check password hash
        if (data.password_hash !== hashedInputPassword) {
          setLoginError('Invalid administrative username or password.');
          return;
        }

        // Verify role is 'admin' (check role_hash)
        const adminRoleHash = await sha256('admin');
        const rolesData = data.roles as any;
        if (!rolesData || rolesData.role_hash !== adminRoleHash) {
          setLoginError('Unauthorized access: User role does not possess administrative privileges.');
          return;
        }

        sessionStorage.setItem('bbk_admin_auth', 'true');
        setIsLoggedIn(true);
        setLoginError('');
      } catch (err) {
        console.error('Database login error, falling back to local verification:', err);
        localVerify();
      }
    } else {
      localVerify();
    }

    function localVerify() {
      if (username === 'admin@bbk.com' && password === 'admin123') {
        sessionStorage.setItem('bbk_admin_auth', 'true');
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError('Invalid administrative username or password.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bbk_admin_auth');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
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
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans text-slate-800">
      {/* Sidebar Layout component */}
      <AdminSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pendingInquiriesCount={stats.pendingInquiries}
        lowStockCount={stats.lowStockCount}
        onLogout={handleLogout}
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
            <div className="min-w-0">
              <h2 className="text-base md:text-xl font-extrabold text-slate-900 m-0 truncate">
                {currentPage === 'overview' && 'Portal Performance Overview'}
                {currentPage === 'products' && 'Menu Catalog Manager'}
                {currentPage === 'bookings' && 'Customer Reservations & Orders'}
                {currentPage === 'inventory' && 'Inventory Stock & Auditing'}
                {currentPage === 'audit-logs' && 'Historical Physical Audit Logs'}
                {currentPage === 'settings' && 'Store Information Settings'}
              </h2>
              <p className="text-[10px] md:text-xs text-slate-400 font-semibold mt-1 m-0 truncate">
                {currentPage === 'overview' && 'Real-time sales indicators, booking feeds, and inventory thresholds.'}
                {currentPage === 'products' && 'Add, edit, or delete items from the customer catalog.'}
                {currentPage === 'bookings' && 'Track dine-in bookings, details, and order specifications.'}
                {currentPage === 'inventory' && 'Conduct audits, log physical counts, and review safety levels.'}
                {currentPage === 'audit-logs' && 'Audit trail records of physical inventory adjustments.'}
                {currentPage === 'settings' && 'Modify contact numbers, email address, locations, and landmarks.'}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              className="bg-transparent hover:bg-[#D65113] hover:text-white text-[#D65113] border border-[#D65113] px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none"
              onClick={() => { window.location.search = ''; }}
            >
              View Site
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 box-border">
          {currentPage === 'overview' && (
            <DashboardOverview
              stats={stats}
              inventory={inventory}
              inquiries={inquiries}
              onViewInventory={() => setCurrentPage('inventory')}
              onViewBookings={() => setCurrentPage('bookings')}
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
            />
          )}
        </div>
      </div>
    </div>
  );
}
