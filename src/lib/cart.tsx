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
const STALE_CART_ERROR_PATTERN =
  /cart.*not found|invalid.*cart|invalid id|does not exist|has already been checked out|Note that cart IDs expire/i;

type CartContextValue = {
  cart: ShopifyCart | null;
  loading: boolean;
  addItem: (variantId: string, quantity?: number, sellingPlanId?: string) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function isStaleCartError(error: unknown): boolean {
  return STALE_CART_ERROR_PATTERN.test(toErrorMessage(error));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [loading, setLoading] = useState(false);

  const clearStoredCart = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY);
    setCart(null);
  }, []);

  const persistCart = useCallback((next: ShopifyCart) => {
    setCart(next);
    localStorage.setItem(CART_ID_KEY, next.id);
  }, []);

  const refreshCart = useCallback(async () => {
    const stored = localStorage.getItem(CART_ID_KEY);
    if (!stored) {
      setCart(null);
      return;
    }

    try {
      const next = await getCart({ data: { cartId: stored } });
      if (next && next.totalQuantity > 0) {
        setCart(next);
        return;
      }
      clearStoredCart();
    } catch {
      clearStoredCart();
    }
  }, [clearStoredCart]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refreshCart()
      .catch(() => {
        // Errors are handled in refreshCart by clearing invalid cart state.
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1, sellingPlanId?: string) => {
      const line: { merchandiseId: string; quantity: number; sellingPlanId?: string } = {
        merchandiseId: variantId,
        quantity,
      };
      if (sellingPlanId) {
        line.sellingPlanId = sellingPlanId;
      }
      const lines = [line];
      setLoading(true);
      try {
        if (cart) {
          try {
            const updated = await addCartLines({ data: { cartId: cart.id, lines } });
            persistCart(updated);
            return;
          } catch (error) {
            if (!isStaleCartError(error)) {
              throw error;
            }
            clearStoredCart();
          }
        }

        const created = await createCart({ data: { lines } });
        persistCart(created);
      } finally {
        setLoading(false);
      }
    },
    [cart, persistCart, clearStoredCart],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) {
        return;
      }
      setLoading(true);
      try {
        const updated = await removeCartLines({
          data: { cartId: cart.id, lineIds: [lineId] },
        });
        if (updated.totalQuantity === 0) {
          clearStoredCart();
          return;
        }
        persistCart(updated);
      } catch (error) {
        if (isStaleCartError(error)) {
          clearStoredCart();
          return;
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cart, persistCart, clearStoredCart],
  );

  const clearCart = useCallback(() => {
    clearStoredCart();
  }, [clearStoredCart]);

  const value = useMemo(
    () => ({ cart, loading, addItem, removeItem, clearCart, refreshCart }),
    [cart, loading, addItem, removeItem, clearCart, refreshCart],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within <CartProvider>');
  }
  return ctx;
}
