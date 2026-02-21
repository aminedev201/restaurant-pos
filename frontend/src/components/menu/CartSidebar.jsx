import { MinusIcon, PlusIcon, ReceiptPercentIcon, ShoppingCartIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CartSidebar = ({ cartItems, onIncrease, onDecrease, onRemove, onPlaceOrder, orderPlacing, isOpen, onClose }) => {
  const total    = cartItems.reduce((sum, i) => sum + i.total, 0);
  const totalQty = cartItems.reduce((s, i)   => s + i.quantity, 0);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full z-40 w-[85vw] sm:w-[360px] lg:w-72 xl:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:z-auto lg:h-full`}>
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-shrink-0">
          <ShoppingCartIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex-1">Cart</h2>
          {cartItems.length > 0 && (
            <span className="text-xs bg-primary-500 text-white rounded-full px-2 py-0.5 font-semibold">{totalQty}</span>
          )}
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors ml-1">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
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
                <img src={ci.image_path_url} alt={ci.title} className="w-11 h-11 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=?'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize truncate">{ci.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{Number(ci.price).toLocaleString()} × {ci.quantity}</p>
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">{Number(ci.total).toLocaleString()} USD</p>
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
                <span>Subtotal</span><span>{total.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><ReceiptPercentIcon className="w-3.5 h-3.5" /> Tax (0%)</span>
                <span>0 USD</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Total:</span>
              <span className="text-base font-bold text-primary-600 dark:text-primary-400">{total.toLocaleString()} USD</span>
            </div>
            <button
              onClick={onPlaceOrder}
              disabled={orderPlacing}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-primary-900/30"
            >
              {orderPlacing ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Placing Order...</>
              ) : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;