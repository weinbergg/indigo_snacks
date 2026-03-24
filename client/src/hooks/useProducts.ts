import { useEffect, useState } from 'react';
import { fallbackProducts } from '../data/fallback-products';
import { apiRequest } from '../lib/api';
import type { Product } from '../types/api';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export function useProducts() {
  const [state, setState] = useState<ProductsState>({
    products: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    apiRequest<Product[]>('/products')
      .then((products) => {
        if (!cancelled) {
          setState({ products, isLoading: false, error: null });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({
            products: fallbackProducts,
            isLoading: false,
            error: null
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
