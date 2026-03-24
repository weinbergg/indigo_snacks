import { prisma } from '../db/prisma';
import type { LeadInput } from '../validators/lead.validator';

export async function createLead(input: LeadInput) {
  return prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      consent: input.consent,
      status: 'NEW'
    },
    select: {
      id: true,
      createdAt: true
    }
  });
}
