import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Product } from '../types/api';
import { apiRequest } from '../lib/api';
import {
  subscriptionFormSchema,
  type SubscriptionFormValues
} from '../lib/validation';
import { formatCurrency } from '../lib/format';
import { subscriptionOptions } from '../data/brand';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { StatusBanner } from '../components/ui/StatusBanner';
import { Reveal } from '../components/Reveal';

interface SubscriptionSectionProps {
  products: Product[];
}

export function SubscriptionSection({ products }: SubscriptionSectionProps) {
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null
  );
  const variants = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          productName: product.name,
          priceKopecks: variant.priceKopecks,
          description: variant.description,
          image: variant.image || product.baseImage || '/assets/brand/product-pack.jpeg'
        }))
      ),
    [products]
  );

  const defaultItems = useMemo(
    () =>
      variants.map((variant) => ({
        variantId: variant.id,
        quantity: 0
      })),
    [variants]
  );

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      items: defaultItems,
      frequency: 'MONTHLY',
      address: '',
      comment: ''
    }
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = form;
  const { fields, replace } = useFieldArray({
    control,
    name: 'items'
  });
  const selectedItems = watch('items') || [];
  const selectedUnits = selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const selectedKinds = selectedItems.filter((item) => item.quantity > 0).length;

  useEffect(() => {
    if (defaultItems.length === 0) {
      return;
    }

    const structureChanged =
      fields.length !== defaultItems.length ||
      fields.some((field, index) => field.variantId !== defaultItems[index]?.variantId);

    if (structureChanged) {
      replace(defaultItems);
    }
  }, [defaultItems, fields, replace]);

  async function onSubmit(values: SubscriptionFormValues) {
    setStatus(null);

    try {
      await apiRequest('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      setStatus({
        tone: 'success',
        text: 'Запрос сохранен. Мы свяжемся с вами, чтобы подтвердить ритм поставок и адрес.'
      });
      reset({
        name: '',
        phone: '',
        email: '',
        items: defaultItems,
        frequency: 'MONTHLY',
        address: '',
        comment: ''
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text:
          error instanceof Error ? error.message : 'Не удалось отправить заявку на подписку.'
      });
    }
  }

  return (
    <section id="subscription" className="section-space">
      <Container>
        <div className="grid gap-7 rounded-[2rem] border border-line/70 bg-brand-deep p-5 text-white shadow-lift sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:p-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/60">
              Регулярные заказы
            </p>
            <h2 className="mt-4 max-w-xl font-display text-4xl text-white sm:text-5xl">
              Если снеки нужны постоянно, оставьте запрос
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              Этот формат подойдет, если вы хотите получать несколько фасовок регулярно
              без повторного заполнения формы каждый раз.
            </p>
            <div className="mt-8 space-y-3 text-sm leading-7 text-white/75">
              <p>Можно собрать любую комбинацию из фасовок 50 г, 100 г и 500 г.</p>
              <p>Выберите еженедельный, двухнедельный или ежемесячный ритм.</p>
              <p>Мы свяжемся с вами, чтобы подтвердить адрес, частоту и удобный способ оплаты.</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <form
              className="grid gap-5 rounded-[1.8rem] bg-panel p-5 text-ink shadow-soft sm:p-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Имя" placeholder="Как к вам обращаться" error={errors.name?.message} {...register('name')} />
                <Input label="Телефон" placeholder="+7 ..." error={errors.phone?.message} {...register('phone')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <Input label="Электронная почта" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
                <Select label="Периодичность" error={errors.frequency?.message} {...register('frequency')}>
                  {subscriptionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-ink">Фасовки для подписки</p>
                  <p className="text-sm text-muted">
                    {selectedUnits > 0
                      ? `${selectedKinds} вида · ${selectedUnits} уп.`
                      : 'Выберите нужные количества'}
                  </p>
                </div>
                <div className="grid gap-3">
                  {fields.map((field, index) => {
                    const variant = variants.find((entry) => entry.id === field.variantId);

                    if (!variant) {
                      return null;
                    }

                    return (
                      <div
                        key={field.id}
                        className="grid gap-3 rounded-[1.5rem] border border-line/70 bg-white/75 p-4 sm:grid-cols-[4.5rem_1fr_7.25rem] sm:items-center"
                      >
                        <div className="h-[5.25rem] w-[4.5rem] overflow-hidden rounded-[1rem] border border-line/70 bg-brand-soft/30">
                          <img
                            src={variant.image}
                            alt={`${variant.productName} ${variant.label}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-ink">
                            {variant.productName} · {variant.label}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {formatCurrency(variant.priceKopecks)}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted">{variant.description}</p>
                        </div>
                        <div>
                          <input type="hidden" {...register(`items.${index}.variantId` as const)} />
                          <Input
                            label="Количество"
                            type="number"
                            min={0}
                            max={30}
                            error={errors.items?.[index]?.quantity?.message}
                            {...register(`items.${index}.quantity` as const, {
                              valueAsNumber: true
                            })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {typeof errors.items?.message === 'string' ? (
                  <p className="text-sm text-red-600">{errors.items.message}</p>
                ) : null}
              </div>
              <Input
                label="Адрес"
                placeholder="Город, улица, дом, квартира"
                error={errors.address?.message}
                {...register('address')}
              />
              <Textarea
                label="Комментарий"
                placeholder="Удобное время связи, пожелания по доставке, комментарий к заказу"
                error={errors.comment?.message}
                {...register('comment')}
              />
              {status ? <StatusBanner tone={status.tone} text={status.text} /> : null}
              <Button type="submit" fullWidth disabled={isSubmitting || variants.length === 0}>
                {isSubmitting ? 'Отправляем...' : 'Оставить запрос на регулярный заказ'}
              </Button>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
