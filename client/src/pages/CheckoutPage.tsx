import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deliveryOptions } from '../data/brand';
import { apiRequest } from '../lib/api';
import { formatCurrency, pluralizeItems } from '../lib/format';
import {
  checkoutFormSchema,
  type CheckoutFormValues
} from '../lib/validation';
import { cartSelectors, useCartStore } from '../store/cart';
import type {
  DeliveryQuote,
  OrderResponse,
  OzonPaymentInitResponse,
  OzonPaymentSyncResponse
} from '../types/api';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { StatusBanner } from '../components/ui/StatusBanner';
import { usePageMeta } from '../hooks/usePageMeta';

export default function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
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
      paymentMethod: 'OZON_ACQUIRING'
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

  useEffect(() => {
    const paymentResult = searchParams.get('payment');
    const orderNumber = searchParams.get('order');

    if (!paymentResult) {
      return;
    }

    if (!orderNumber) {
      setSubmitState({
        tone: paymentResult === 'success' ? 'info' : 'error',
        text:
          paymentResult === 'success'
            ? 'Возврат после оплаты выполнен, но номер заказа не передан в URL.'
            : 'Оплата не была завершена. Номер заказа не передан в URL.'
      });
      return;
    }

    let cancelled = false;

    setSubmitState({
      tone: 'info',
      text: `Проверяем статус оплаты заказа ${orderNumber}...`
    });

    apiRequest<OzonPaymentSyncResponse>(
      `/orders/${encodeURIComponent(orderNumber)}/payments/ozon/sync`,
      {
        method: 'POST'
      }
    )
      .then((result) => {
        if (cancelled) {
          return;
        }

        const isPaid = result.paymentStatus === 'PAID';
        setSubmitState({
          tone: isPaid ? 'success' : paymentResult === 'failed' ? 'error' : 'info',
          text: isPaid
            ? `Оплата заказа ${result.orderNumber} подтверждена.`
            : `Заказ ${result.orderNumber} сохранен. Текущий статус оплаты: ${result.paymentStatus}.`
        });
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }

        setSubmitState({
          tone: paymentResult === 'failed' ? 'error' : 'info',
          text:
            error.message ||
            `Не удалось проверить статус оплаты заказа ${orderNumber}.`
        });
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('payment');
        nextParams.delete('order');
        setSearchParams(nextParams, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);

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
        paymentMethod: 'OZON_ACQUIRING'
      });

      try {
        const payment = await apiRequest<OzonPaymentInitResponse>(
          `/orders/${encodeURIComponent(response.orderNumber)}/payments/ozon/init`,
          {
            method: 'POST'
          }
        );

        if (payment.redirectUrl) {
          setSubmitState({
            tone: 'info',
            text: `Заказ ${response.orderNumber} сохранен. Перенаправляем на страницу оплаты Ozon...`
          });
          window.location.assign(payment.redirectUrl);
          return;
        }

        setSubmitState({
          tone: 'success',
          text: `Заказ ${response.orderNumber} сохранен. ${response.paymentMessage}`
        });
      } catch (error) {
        setSubmitState({
          tone: 'error',
          text:
            error instanceof Error
              ? `Заказ ${response.orderNumber} сохранен, но не удалось запустить оплату Ozon: ${error.message}`
              : `Заказ ${response.orderNumber} сохранен, но оплата Ozon не стартовала.`
        });
      }
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
              <input type="hidden" {...register('paymentMethod')} value="OZON_ACQUIRING" />
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
              <div className="rounded-[1.4rem] border border-line/70 bg-white/80 px-5 py-4">
                <p className="text-sm uppercase tracking-[0.28em] text-brand/70">Оплата</p>
                <p className="mt-2 text-base font-semibold text-ink">Защищенная страница Ozon</p>
                <p className="mt-2 text-sm text-muted">
                  После подтверждения заказа вы сразу перейдете на страницу оплаты Ozon Acquiring.
                </p>
              </div>
              <Textarea
                label="Комментарий к заказу"
                placeholder="Комментарий по доставке, код домофона, удобное время связи"
                error={errors.comment?.message}
                {...register('comment')}
              />
              {submitState ? <StatusBanner tone={submitState.tone} text={submitState.text} /> : null}
              <Button type="submit" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? 'Оформляем заказ...' : 'Оплатить'}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
