import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deliveryOptions, paymentOptions } from '../data/brand';
import { apiRequest } from '../lib/api';
import { formatCurrency, pluralizeItems } from '../lib/format';
import {
  checkoutFormSchema,
  type CheckoutFormValues
} from '../lib/validation';
import { cartSelectors, useCartStore } from '../store/cart';
import type { DeliveryQuote, OrderResponse } from '../types/api';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { StatusBanner } from '../components/ui/StatusBanner';
import { usePageMeta } from '../hooks/usePageMeta';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clear);
  const subtotalKopecks = cartSelectors.subtotalKopecks(items);
  const totalWeightGrams = cartSelectors.totalWeightGrams(items);
  const itemCount = cartSelectors.itemCount(items);

  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<{
    tone: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  usePageMeta(
    'Корзина и оформление заказа | Индиго Снэкс',
    'Оформление заказа Индиго: фасовки 50, 100 и 500 г, адрес доставки и подтверждение заказа.'
  );

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      postalCode: '',
      comment: '',
      deliveryMethod: 'CDEK',
      paymentMethod: 'ONLINE_PLACEHOLDER'
    }
  });

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = form;

  const deliveryMethod = watch('deliveryMethod');
  const deliveryCostKopecks = deliveryQuote?.amountKopecks ?? 0;
  const totalKopecks = subtotalKopecks + deliveryCostKopecks;

  useEffect(() => {
    if (items.length === 0) {
      setDeliveryQuote(null);
      setDeliveryError(null);
      return;
    }

    let cancelled = false;
    setDeliveryError(null);

    apiRequest<DeliveryQuote>('/delivery/calculate', {
      method: 'POST',
      body: JSON.stringify({
        deliveryMethod,
        subtotalKopecks,
        totalWeightGrams
      })
    })
      .then((quote) => {
        if (!cancelled) {
          setDeliveryQuote(quote);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setDeliveryError(error.message || 'Не удалось рассчитать доставку.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deliveryMethod, items.length, subtotalKopecks, totalWeightGrams]);

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) {
      setSubmitState({ tone: 'error', text: 'Корзина пуста. Добавьте товары из каталога.' });
      return;
    }

    setSubmitState(null);

    try {
      const response = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity
          }))
        })
      });

      setSubmitState({
        tone: 'success',
        text: `Заказ ${response.orderNumber} сохранен. ${response.paymentMessage}`
      });
      clearCart();
      setDeliveryQuote(null);
      reset({
        name: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        postalCode: '',
        comment: '',
        deliveryMethod: 'CDEK',
        paymentMethod: 'ONLINE_PLACEHOLDER'
      });
    } catch (error) {
      setSubmitState({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Не удалось оформить заказ.'
      });
    }
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Оформление заказа"
              title="Проверьте упаковку и укажите адрес"
              description="После оформления мы подтвердим детали, доставку и удобный способ оплаты."
            />

            <div className="glass-panel space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-ink">Корзина</p>
                <p className="text-sm text-muted">{pluralizeItems(itemCount)}</p>
              </div>

              {items.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-line px-5 py-8 text-center text-muted">
                  Корзина пуста. <Link to="/catalog" className="text-brand">Перейти в каталог</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="rounded-[1.4rem] border border-line/70 bg-white/80 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-ink">{item.productName}</p>
                          <p className="text-sm text-muted">{item.variantLabel}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label="Уменьшить количество"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm font-semibold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            aria-label="Увеличить количество"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="ml-2 text-sm font-medium text-muted transition hover:text-red-600"
                            onClick={() => removeItem(item.variantId)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-muted">
                        <span>{formatCurrency(item.unitPriceKopecks)} за упаковку</span>
                        <span className="font-semibold text-ink">
                          {formatCurrency(item.unitPriceKopecks * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel space-y-3">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Товары</span>
                <span className="font-semibold text-ink">{formatCurrency(subtotalKopecks)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Доставка</span>
                <span className="font-semibold text-ink">
                  {deliveryQuote ? formatCurrency(deliveryQuote.amountKopecks) : 'Рассчитываем'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line/70 pt-3 text-base">
                <span className="font-semibold text-ink">Итого</span>
                <span className="font-semibold text-ink">{formatCurrency(totalKopecks)}</span>
              </div>
              {deliveryQuote ? (
                <StatusBanner
                  tone="info"
                  text={`${deliveryQuote.label}: ${deliveryQuote.note}. Срок: ${deliveryQuote.etaText}.`}
                />
              ) : null}
              {deliveryError ? <StatusBanner tone="error" text={deliveryError} /> : null}
            </div>
          </div>

          <div className="glass-panel">
            <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Имя" error={errors.name?.message} {...register('name')} />
                <Input label="Телефон" error={errors.phone?.message} {...register('phone')} />
              </div>
              <Input label="Электронная почта" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Город" error={errors.city?.message} {...register('city')} />
                <Input label="Индекс" error={errors.postalCode?.message} {...register('postalCode')} />
              </div>
              <Input label="Адрес" error={errors.address?.message} {...register('address')} />
              <Select label="Способ доставки" error={errors.deliveryMethod?.message} {...register('deliveryMethod')}>
                {deliveryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <p className="-mt-2 text-sm text-muted">
                {deliveryOptions.find((option) => option.value === deliveryMethod)?.hint}
              </p>
              <Select label="Способ оплаты" error={errors.paymentMethod?.message} {...register('paymentMethod')}>
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <p className="-mt-2 text-sm text-muted">
                {paymentOptions.find((option) => option.value === watch('paymentMethod'))?.hint}
              </p>
              <Textarea
                label="Комментарий к заказу"
                placeholder="Комментарий по доставке, код домофона, удобное время связи"
                error={errors.comment?.message}
                {...register('comment')}
              />
              {submitState ? <StatusBanner tone={submitState.tone} text={submitState.text} /> : null}
              <Button type="submit" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? 'Оформляем заказ...' : 'Отправить заказ'}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
