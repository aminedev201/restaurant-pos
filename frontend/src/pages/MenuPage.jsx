import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { title } from '../services/helpers';
import axiosInstance from '../config/axios';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CART_KEY = 'pos_order_items';

const SvgPreview = ({ svg, className = 'w-5 h-5' }) => {
  if (!svg) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
};

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

// ─── Category Bar ─────────────────────────────────────────────────────────────
const CategoryBar = ({ categories, items, selectedId, onSelect }) => {
  const getCount = (catId) =>
    catId === null
      ? items.length
      : items.filter((i) => String(i.category_id) === String(catId)).length;

  const all = [{ id: null, name: 'All', icon: null }, ...categories];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {all.map((cat) => {
        const active = selectedId === cat.id;
        return (
          <button
            key={cat.id ?? 'all'}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 transition-all duration-200 min-w-[76px] sm:min-w-[90px] ${
              active
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md shadow-primary-100 dark:shadow-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors ${
                active
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {cat.icon ? (
                <SvgPreview svg={cat.icon} className="w-4 h-4 sm:w-5 sm:h-5 [&>svg]:w-full [&>svg]:h-full" />
              ) : (
                <AdjustmentsHorizontalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <span
              className={`text-xs font-semibold capitalize leading-tight text-center ${
                active ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {cat.name}
            </span>
            <span
              className={`text-xs font-medium ${
                active ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {getCount(cat.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Item Card ────────────────────────────────────────────────────────────────
const ItemCard = ({ item, cartQty, onAdd, onIncrease, onDecrease }) => {
  const inCart = cartQty > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col">
      <div className="relative overflow-hidden h-32 sm:h-40">
        <img
          src={item.image_path_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x160?text=No+Image'; }}
        />
        {inCart && (
          <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            {cartQty}
          </div>
        )}
        {item.category && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full capitalize">
              {item.category.icon && (
                <span className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full opacity-90" dangerouslySetInnerHTML={{ __html: item.category.icon }} />
              )}
              {item.category.name}
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1.5 sm:gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white capitalize leading-snug line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm sm:text-base font-bold text-primary-600 dark:text-primary-400 mt-auto">
          {Number(item.price).toLocaleString()} USD
        </p>

        {inCart ? (
          <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 rounded-lg px-1 py-1">
            <button onClick={() => onDecrease(item)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors">
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300 min-w-[20px] text-center">{cartQty}</span>
            <button onClick={() => onIncrease(item)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors">
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            className="w-full py-1.5 sm:py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
const CartSidebar = ({ cartItems, onIncrease, onDecrease, onRemove, onPlaceOrder, orderPlacing, orderPlaced, isOpen, onClose }) => {
  const total    = cartItems.reduce((sum, i) => sum + i.total, 0);
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full z-40
          w-[85vw] sm:w-[360px] lg:w-72 xl:w-80
          bg-white dark:bg-gray-800
          border-l border-gray-200 dark:border-gray-700
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:h-full
        `}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-shrink-0">
          <ShoppingCartIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex-1">Cart</h2>
          {cartItems.length > 0 && (
            <span className="text-xs bg-primary-500 text-white rounded-full px-2 py-0.5 font-semibold">
              {totalQty}
            </span>
          )}
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors ml-1">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items — scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <ShoppingCartIcon className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Your cart is empty</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Add items from the menu</p>
            </div>
          ) : (
            cartItems.map((ci) => (
              <div key={ci.item_id} className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5">
                <img
                  src={ci.image_path_url}
                  alt={ci.title}
                  className="w-11 h-11 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=?'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize truncate">{ci.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {Number(ci.price).toLocaleString()} × {ci.quantity}
                  </p>
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                    {Number(ci.total).toLocaleString()} USD
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => onRemove(ci.item_id)} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onDecrease(ci.item_id)} className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-gray-700 dark:text-gray-300 transition-colors">
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-gray-800 dark:text-white">{ci.quantity}</span>
                    <button onClick={() => onIncrease(ci.item_id)} className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-gray-700 dark:text-gray-300 transition-colors">
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{total.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <ReceiptPercentIcon className="w-3.5 h-3.5" /> Tax (0%)
                </span>
                <span>0 USD</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Total:</span>
              <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                {total.toLocaleString()} USD
              </span>
            </div>
            <button
              onClick={onPlaceOrder}
              disabled={orderPlacing || orderPlaced}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-primary-900/30"
            >
              {orderPlaced ? (
                <><CheckCircleIcon className="w-5 h-5" /> Order Placed!</>
              ) : orderPlacing ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Placing Order...</>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Floating Cart Button ─────────────────────────────────────────────────────
const FloatingCartButton = ({ count, total, onClick }) => {
  if (count === 0) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-20 lg:hidden flex items-center gap-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-primary-300 dark:shadow-primary-900/50 transition-all duration-200 active:scale-95"
    >
      <div className="relative">
        <ShoppingCartIcon className="w-5 h-5" />
        <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {count}
        </span>
      </div>
      <span className="text-sm font-bold">{total.toLocaleString()} USD</span>
    </button>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ show, type = 'success', message }) => {
  if (!show) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 font-semibold text-sm animate-bounce text-white ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
      {isSuccess
        ? <CheckCircleIcon className="w-5 h-5" />
        : <ExclamationCircleIcon className="w-5 h-5" />
      }
      {message}
    </div>
  );
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
  const [orderPlaced, setOrderPlaced]   = useState(false);
  const [toast, setToast]               = useState({ show: false, type: 'success', message: '' });
  const [cartOpen, setCartOpen]         = useState(false);

  useEffect(() => {
    document.title = title('Menu');
    fetchData();
  }, []);

  useEffect(() => { saveCart(cartItems); }, [cartItems]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setCartOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
  };

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
    const matchesCat = selectedCategory === null || String(item.category_id) === String(selectedCategory);
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
        item_id:        item.id,
        title:          item.title,
        price:          Number(item.price),
        quantity:       1,
        total:          Number(item.price),
        image_path_url: item.image_path_url,
      }];
    });
  };

  const increaseQty = (item) => addToCart(item);

  const decreaseQty = (itemOrId) => {
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

  // ── Place Order — POST to /orders ─────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || orderPlacing) return;

    setOrderPlacing(true);
    try {
      const payload = {
        items: cartItems.map((ci) => ({
          item_id:  ci.item_id,
          title:    ci.title,
          price:    ci.price,
          quantity: ci.quantity,
          total:    ci.total,
        })),
        payment_method: 'cash',
        discount: 0,
        tax: 0,
      };

      const res = await axiosInstance.post('/orders', payload);

      if (res.data.success) {
        setOrderPlaced(true);
        showToast('success', `Order ${res.data.data.order_number} placed successfully!`);
        setTimeout(() => {
          setCartItems([]);
          saveCart([]);
          setOrderPlaced(false);
          setCartOpen(false);
        }, 2000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order. Please try again.';
      showToast('error', message);
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

          {/* Header */}
          <div className="pb-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Menu</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Browse and order from our menu</p>
              </div>
            </div>
          </div>

          {/* Search + cart toggle */}
          <div className="pb-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-9 py-2.5 sm:py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Cart toggle — mobile only, when closed */}
              {!cartOpen && (
                <div className="lg:hidden">
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative flex-shrink-0 flex items-center justify-center w-11 h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
                  >
                    <ShoppingCartIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {totalQty > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 bg-primary-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow">
                        {totalQty}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category Bar */}
          <div className="py-2 bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="flex gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[76px] sm:w-[90px] h-[100px] sm:h-[110px] bg-white dark:bg-gray-800 rounded-xl animate-pulse border border-gray-100 dark:border-gray-700" />
                ))}
              </div>
            ) : (
              <CategoryBar categories={categories} items={items} selectedId={selectedCategory} onSelect={setSelectedCategory} />
            )}
          </div>

          {/* Results header */}
          <div className="py-1.5 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {loading ? (
                <span className="inline-block w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <>
                  <span className="font-semibold text-gray-900 dark:text-white">{filteredItems.length}</span>{' '}items found
                  {selectedCategory && categories.find(c => String(c.id) === String(selectedCategory)) && (
                    <span className="ml-1">in <span className="text-primary-600 dark:text-primary-400 font-semibold capitalize">
                      {categories.find(c => String(c.id) === String(selectedCategory))?.name}
                    </span></span>
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

          {/* Items Grid */}
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
                  <ItemCard
                    key={item.id}
                    item={item}
                    cartQty={getCartQty(item.id)}
                    onAdd={addToCart}
                    onIncrease={increaseQty}
                    onDecrease={decreaseQty}
                  />
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
          onPlaceOrder={handlePlaceOrder}
          orderPlacing={orderPlacing}
          orderPlaced={orderPlaced}
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
        />
      </div>

      <FloatingCartButton count={totalQty} total={totalPrice} onClick={() => setCartOpen(true)} />
      <Toast show={toast.show} type={toast.type} message={toast.message} />
    </DashboardLayout>
  );
};

export default MenuPage;