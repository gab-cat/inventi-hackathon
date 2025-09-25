import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { CreateInvoiceForm } from '../types';

export interface UseInvoiceMutationsReturn {
  createInvoice: (data: CreateInvoiceForm) => Promise<Id<'invoices'>>;
  updateInvoice: (id: Id<'invoices'>, data: Partial<CreateInvoiceForm>) => Promise<void>;
  deleteInvoice: (id: Id<'invoices'>) => Promise<void>;
  updateInvoiceStatus: (id: Id<'invoices'>, status: string) => Promise<void>;
  isLoading: boolean;
}

export function useInvoiceMutations(): UseInvoiceMutationsReturn {
  const createInvoiceMutation = useMutation(api.payments.webCreateInvoice);
  const updateInvoiceMutation = useMutation(api.payments.webUpdateInvoice);
  const deleteInvoiceMutation = useMutation(api.payments.webDeleteInvoice);
  const updateStatusMutation = useMutation(api.payments.webUpdateInvoiceStatus);

  const createInvoice = async (data: CreateInvoiceForm): Promise<Id<'invoices'>> => {
    // Calculate total amount from items
    const amount = data.items.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + item.amount * quantity;
    }, 0);

    const result = await createInvoiceMutation({
      propertyId: data.propertyId as Id<'properties'>,
      unitId: data.unitId ? (data.unitId as Id<'units'>) : undefined,
      tenantId: data.tenantId as Id<'users'>,
      invoiceType: data.invoiceType,
      description: data.description,
      amount: amount,
      taxAmount: data.taxAmount,
      dueDate: new Date(data.dueDate).getTime(),
      items: data.items,
      lateFee: data.lateFee,
    });
    return result._id;
  };

  const updateInvoice = async (id: Id<'invoices'>, data: Partial<CreateInvoiceForm>): Promise<void> => {
    // Calculate total amount from items if items are provided
    let amount: number | undefined;
    if (data.items && data.items.length > 0) {
      amount = data.items.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + item.amount * quantity;
      }, 0);
    }

    await updateInvoiceMutation({
      invoiceId: id,
      propertyId: data.propertyId as Id<'properties'>,
      unitId: data.unitId ? (data.unitId as Id<'units'>) : undefined,
      tenantId: data.tenantId as Id<'users'>,
      invoiceType: data.invoiceType,
      description: data.description,
      amount: amount,
      taxAmount: data.taxAmount,
      dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
      items: data.items,
      lateFee: data.lateFee,
    });
  };

  const deleteInvoice = async (id: Id<'invoices'>): Promise<void> => {
    await deleteInvoiceMutation({ invoiceId: id });
  };

  const updateInvoiceStatus = async (id: Id<'invoices'>, status: string): Promise<void> => {
    await updateStatusMutation({
      invoiceId: id,
      status: status as 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded',
    });
  };

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    isLoading: false, // You might want to track individual mutation states
  };
}
