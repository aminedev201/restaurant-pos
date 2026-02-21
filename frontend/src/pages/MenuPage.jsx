import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { title } from '../services/helpers';
import axiosInstance from '../config/axios';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/menu/ConfirmModal';
import BillModal    from '../components/menu/BillModal';
import ItemCard from '../components/menu/ItemCard';
import FloatingCartButton from '../components/menu/FloatingCartButton';
import CategoryDropdown from '../components/menu/CategoryDropdown';
import CategoryBar from '../components/menu/CategoryBar';
import CartSidebar from '../components/menu/CartSidebar';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CART_KEY = 'pos_order_items';

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

// ─── Main MenuPage ────────────────────────────────────────────────────────────
const MenuPage = () => {
  const [items, setItems]               = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems]       = useState(getCart);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [cartOpen, setCartOpen]         = useState(false);

  // ── Modal states ──────────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);  // Step 1: confirm dialog
  const [billOpen, setBillOpen]       = useState(false);  // Step 2: bill after success
  const [placedOrder, setPlacedOrder] = useState(null);   // { order, items }

  useEffect(() => {
    document.title = title('Menu');
    fetchData();
  }, []);

  useEffect(() => { saveCart(cartItems); }, [cartItems]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        if (!orderPlacing) setConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [orderPlacing]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes] = await Promise.all([
        axiosInstance.get('/items'),
        axiosInstance.get('/categories'),
      ]);
      if (itemsRes.data.success) setItems(itemsRes.data.data);
      if (catsRes.data.success) setCategories(catsRes.data.data);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat    = selectedCategory === null || String(item.category_id) === String(selectedCategory);
    return matchesSearch && matchesCat;
  });

  const getCartQty = useCallback(
    (itemId) => cartItems.find((ci) => ci.item_id === itemId)?.quantity || 0,
    [cartItems]
  );

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item_id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item_id === item.id
            ? { ...ci, quantity: ci.quantity + 1, total: (ci.quantity + 1) * ci.price }
            : ci
        );
      }
      return [...prev, {
        item_id: item.id, title: item.title,
        price: Number(item.price), quantity: 1, total: Number(item.price),
        image_path_url: item.image_path_url,
      }];
    });
  };

  const increaseQty    = (item)     => addToCart(item);
  const decreaseQty    = (itemOrId) => {
    const id = typeof itemOrId === 'object' ? itemOrId.id : itemOrId;
    setCartItems((prev) =>
      prev
        .map((ci) => ci.item_id === id ? { ...ci, quantity: ci.quantity - 1, total: (ci.quantity - 1) * ci.price } : ci)
        .filter((ci) => ci.quantity > 0)
    );
  };
  const removeFromCart   = (itemId) => setCartItems((prev) => prev.filter((ci) => ci.item_id !== itemId));
  const increaseCartItem = (itemId) => setCartItems((prev) =>
    prev.map((ci) => ci.item_id === itemId ? { ...ci, quantity: ci.quantity + 1, total: (ci.quantity + 1) * ci.price } : ci)
  );

  // ── Step 1: Open confirm modal ────────────────────────────────────────────
  const handlePlaceOrderClick = () => {
    if (cartItems.length === 0) return;
    setConfirmOpen(true);
  };

  // ── Step 2: Confirmed → POST /orders → show bill ──────────────────────────
  const handleConfirmOrder = async () => {
    setOrderPlacing(true);
    try {
      const payload = {
        items: cartItems.map((ci) => ({
          item_id: ci.item_id, title: ci.title,
          price: ci.price, quantity: ci.quantity, total: ci.total,
        })),
        payment_method: 'cash',
        discount: 0,
        tax: 0,
      };

      const res = await axiosInstance.post('/orders', payload);

      if (res.data.success) {
        const order = res.data.data;

        // Snapshot cart for bill before clearing
        setPlacedOrder({
          order: {
            ...order,
            payment_method: payload.payment_method,
            discount:       payload.discount,
            tax:            payload.tax,
            created_at:     order.created_at || new Date().toISOString(),
          },
          items: [...cartItems],
        });

        setConfirmOpen(false);
        setCartOpen(false);
        toast.success(`Order #${order.order_number} placed successfully!`);
        setCartItems([]);
        saveCart([]);
        setBillOpen(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order. Please try again.';
      setConfirmOpen(false);
      toast.error(message);
    } finally {
      setOrderPlacing(false);
    }
  };

  const totalQty   = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.total, 0);

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-32 sm:h-40 bg-gray-200 dark:bg-gray-700" />
      <div className="p-2.5 sm:p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mt-3" />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-130px)] gap-2 overflow-hidden">

        {/* ── Main Content ── */}
        <div className="flex-1 px-2 sm:px-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 min-w-0">

          <div className="pb-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Menu</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Browse and order from our menu</p>
              </div>
            </div>
          </div>

          <div className="pb-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-9 py-2.5 sm:py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl  focus:border-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!cartOpen && (
                <div className="lg:hidden">
                  <button onClick={() => setCartOpen(true)} className="relative flex-shrink-0 flex items-center justify-center w-11 h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                    <ShoppingCartIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {totalQty > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 bg-primary-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow">{totalQty}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="py-2 bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="flex gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[76px] sm:w-[90px] h-[100px] sm:h-[110px] bg-white dark:bg-gray-800 rounded-xl animate-pulse border border-gray-100 dark:border-gray-700" />
                ))}
              </div>
            ) : (
              <>
                {/* Dropdown — sm only */}
                <div className="sm:hidden">
                  <CategoryDropdown
                    categories={categories}
                    items={items}
                    selectedId={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
                {/* Scrollable bar — sm and above */}
                <div className="hidden sm:block">
                  <CategoryBar
                    categories={categories}
                    items={items}
                    selectedId={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
              </>
            )}
          </div>

          <div className="py-1.5 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {loading ? (
                <span className="inline-block w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <>
                  <span className="font-semibold text-gray-900 dark:text-white">{filteredItems.length}</span>{' '}items found
                  {selectedCategory && categories.find(c => String(c.id) === String(selectedCategory)) && (
                    <span className="ml-1">in <span className="text-primary-600 dark:text-primary-400 font-semibold capitalize">{categories.find(c => String(c.id) === String(selectedCategory))?.name}</span></span>
                  )}
                </>
              )}
            </p>
            {(searchTerm || selectedCategory) && !loading && (
              <button onClick={() => { setSearchTerm(''); setSelectedCategory(null); }} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1">
                <XMarkIcon className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <MagnifyingGlassIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-500 dark:text-gray-400">No items found</p>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} cartQty={getCartQty(item.id)} onAdd={addToCart} onIncrease={increaseQty} onDecrease={decreaseQty} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Cart Sidebar ── */}
        <CartSidebar
          cartItems={cartItems}
          onIncrease={increaseCartItem}
          onDecrease={decreaseQty}
          onRemove={removeFromCart}
          onPlaceOrder={handlePlaceOrderClick}
          orderPlacing={orderPlacing}
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
        />
      </div>

      <FloatingCartButton count={totalQty} total={totalPrice} onClick={() => setCartOpen(true)} />

      {/* ── Step 1: Confirm Order ── */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => !orderPlacing && setConfirmOpen(false)}
        onConfirm={handleConfirmOrder}
        loading={orderPlacing}
        title="Place Order?"
        message={`You have ${totalQty} item${totalQty !== 1 ? 's' : ''} totaling ${totalPrice.toLocaleString()} USD. Confirm to place the order.`}
        confirmText="Place Order"
        cancelText="Go Back"
        variant="primary"
      />

      {/* ── Step 2: Bill Modal ── */}
      <BillModal
        isOpen={billOpen}
        onClose={() => setBillOpen(false)}
        order={placedOrder?.order}
        items={placedOrder?.items || []}
      />
    </DashboardLayout>
  );
};

export default MenuPage;