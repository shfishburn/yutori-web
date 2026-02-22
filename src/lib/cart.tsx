import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createDraftOrder,
} from '../server/shopify';

type CartContextValue = {
  loading: boolean;
  /** Creates a Draft Order and returns its invoice URL for checkout. */
  addItem: (variantId: string, quantity?: number) => Promise<string>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setLoading(true);
      try {
        const res = await createDraftOrder({ data: { variantId, quantity } });
        return res.invoiceUrl;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ loading, addItem }),
    [loading, addItem],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
