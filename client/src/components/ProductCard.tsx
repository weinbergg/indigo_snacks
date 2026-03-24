import { useState } from 'react';
import type { Product } from '../types/api';
import { formatCurrency, formatWeight } from '../lib/format';
import { Button } from './ui/Button';
import { Reveal } from './Reveal';
import { useCartStore } from '../store/cart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [addedVariantId, setAddedVariantId] = useState<string | null>(null);

  return (
    <Reveal className="glass-panel overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[26rem] overflow-hidden rounded-[2rem] bg-brand-soft/55 p-6 sm:min-h-[30rem] lg:min-h-[34rem]">
          <div className="absolute inset-6 rounded-[1.5rem] border border-white/50" />
          <div className="absolute inset-8 overflow-hidden rounded-[1.5rem]">
            <img
              src={product.baseImage || '/assets/brand/product-pack.jpeg'}
              alt={`${product.name} Индиго`}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          {product.badge ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand">
              {product.badge}
            </p>
          ) : null}
          <h3 className="font-display text-4xl text-ink">{product.name}</h3>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">{product.description}</p>

          <div className="mt-8 grid gap-4">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-[1.6rem] border border-line/70 bg-white/75 p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[1.1rem] border border-line/70 bg-brand-soft/35">
                      <img
                        src={variant.image || product.baseImage || '/assets/brand/product-pack.jpeg'}
                        alt={`${product.name} ${variant.label}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-ink">{variant.label}</p>
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                          {formatWeight(variant.weightGrams)}
                        </span>
                      </div>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                        {variant.description || 'Деликатные кусочки индейки для прогулки, дома и ежедневного поощрения.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-[180px] flex-col gap-3 sm:items-end">
                    <div className="text-right">
                      <p className="text-xl font-semibold text-ink">
                        {formatCurrency(variant.priceKopecks)}
                      </p>
                      {variant.compareAtPriceKopecks ? (
                        <p className="text-sm text-muted line-through">
                          {formatCurrency(variant.compareAtPriceKopecks)}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant={variant.isAvailable ? 'primary' : 'secondary'}
                      disabled={!variant.isAvailable}
                      onClick={() => {
                        addItem({
                          variantId: variant.id,
                          sku: variant.sku,
                          productSlug: product.slug,
                          productName: product.name,
                          variantLabel: variant.label,
                          weightGrams: variant.weightGrams,
                          unitPriceKopecks: variant.priceKopecks,
                          image: variant.image || product.baseImage
                        });
                        setAddedVariantId(variant.id);
                      }}
                    >
                      {!variant.isAvailable
                        ? 'Нет в наличии'
                        : addedVariantId === variant.id
                          ? 'Добавлено'
                          : 'В корзину'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
