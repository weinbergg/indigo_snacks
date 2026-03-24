import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '../lib/api';
import { leadFormSchema, type LeadFormValues } from '../lib/validation';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { StatusBanner } from '../components/ui/StatusBanner';

export function LeadSection() {
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null
  );
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
      consent: false
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = form;

  async function onSubmit(values: LeadFormValues) {
    setStatus(null);

    try {
      await apiRequest('/leads', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      setStatus({
        tone: 'success',
        text: 'Заявка сохранена. Менеджер свяжется с вами в ближайшее время.'
      });
      reset();
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Не удалось отправить заявку.'
      });
    }
  }

  return (
    <section id="lead-form" className="section-space">
      <Container>
        <div className="rounded-[2rem] border border-line/70 bg-white/80 p-7 shadow-soft lg:p-10">
          <SectionHeading
            eyebrow="Связаться с нами"
            title="Если нужен совет по заказу, оставьте сообщение"
            description="Подскажем по продукту, доставке, регулярным заказам или покупке нескольких упаковок."
          />

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Имя" placeholder="Как к вам обращаться" error={errors.name?.message} {...register('name')} />
              <Input label="Телефон" placeholder="+7 ..." error={errors.phone?.message} {...register('phone')} />
            </div>
            <Input label="Электронная почта" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
            <Textarea
              label="Сообщение / комментарий"
              placeholder="Например: хочу оформить несколько упаковок, уточнить доставку или регулярный заказ"
              error={errors.message?.message}
              {...register('message')}
            />
            <Checkbox
              label="Согласен(на) на обработку персональных данных для обратной связи по заявке."
              error={errors.consent?.message}
              {...register('consent')}
            />
            {status ? <StatusBanner tone={status.tone} text={status.text} /> : null}
            <Button type="submit" className="sm:w-fit" disabled={isSubmitting}>
              {isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
