import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createCart,
  addCartLines,
  getCart,
  removeCartLines,
  type ShopifyCart,
} from '../server/shopify';

const CART_ID_KEY = 'yutori_cart_id';

type CartContextValue = {
  cart: ShopifyCart | null;
  loading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore cart from localStorage on mount (client only)
  useEffect(() => {
    const stored = localStorage.getItem(CART_ID_KEY);
    if (!stored) return;

    let cancelled = false;
    setLoading(true);
    getCart({ data: { cartId: stored } })
      .then((c) => {
        if (cancelled) return;
        if (c && c.totalQuantity > 0) {
          setCart(c);
        } else {
          localStorage.removeItem(CART_ID_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(CART_ID_KEY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistCart = useCallback((c: ShopifyCart) => {
    setCart(c);
    localStorage.setItem(CART_ID_KEY, c.id);
  }, []);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setLoading(true);
      try {
        const lines = [{ merchandiseId: variantId, quantity }];
        if (cart) {
          const updated = await addCartLines({ data: { cartId: cart.id, lines } });
          persistCart(updated);
        } else {
          const created = await createCart({ data: { lines } });
          persistCart(created);
        }
      } finally {
        setLoading(false);
      }
    },
    [cart, persistCart],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updated = await removeCartLines({
          data: { cartId: cart.id, lineIds: [lineId] },
        });
        if (updated.totalQuantity === 0) {
          setCart(null);
          localStorage.removeItem(CART_ID_KEY);
        } else {
          persistCart(updated);
        }
      } finally {
        setLoading(false);
      }
    },
    [cart, persistCart],
  );

  const clearCart = useCallback(() => {
    setCart(null);
    localStorage.removeItem(CART_ID_KEY);
  }, []);

  const value = useMemo(
    () => ({ cart, loading, addItem, removeItem, clearCart }),
    [cart, loading, addItem, removeItem, clearCart],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
