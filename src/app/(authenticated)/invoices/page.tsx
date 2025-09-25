'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { usePropertyStore } from '@/features/property';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText } from 'lucide-react';
import { InvoiceForm, InvoiceList, useInvoiceMutations } from '@/features/invoices';
import { useToast } from '@/hooks/use-toast';
import { InvoiceWithDetails } from '@/features/invoices/types';

export default function InvoicesPage() {
  const { selectedPropertyId } = usePropertyStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const { createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } = useInvoiceMutations(); // Invoice mutations

  // Get invoices for the selected property
  const invoices = useQuery(
    api.payments.webGetInvoicesByProperty,
    selectedPropertyId
      ? {
          propertyId: selectedPropertyId,
        }
      : 'skip'
  ) as InvoiceWithDetails[] | undefined;

  // Get properties and units for the form
  const properties = useQuery(api.property.webGetManagerProperties);

  // Get units for the selected property (will be filtered in the form)
  const units = useQuery(api.unit.getUnitsByProperty, selectedPropertyId ? { propertyId: selectedPropertyId } : 'skip');

  const handleEdit = async (data: any) => {
    try {
      await updateInvoice(data.invoiceId, data);
      toast({
        title: 'Success',
        description: 'Invoice updated successfully.',
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleView = (invoice: InvoiceWithDetails) => {
    // View functionality is now handled by the InvoiceViewModal
    // This function is kept for compatibility but not used
  };

  const handleDelete = async (invoice: InvoiceWithDetails) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(invoice._id);
        toast({
          title: 'Success',
          description: 'Invoice deleted successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete invoice.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleStatusChange = async (invoice: InvoiceWithDetails, status: string) => {
    try {
      await updateInvoiceStatus(invoice._id, status);
      toast({
        title: 'Success',
        description: `Invoice status updated to ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice status.',
        variant: 'destructive',
      });
    }
  };

  if (!selectedPropertyId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-600'>Please select a property to view invoices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Invoices</h1>
          <p className='text-muted-foreground'>Manage and track all invoices for your properties</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className='bg-blue-500 hover:bg-blue-600 text-white'>
          <Plus className='h-4 w-4 mr-2' />
          Create Invoice
        </Button>
      </div>

      <InvoiceList
        invoices={invoices || []}
        isLoading={invoices === undefined}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        properties={properties || []}
        units={Array.isArray(units) ? units : []}
        tenants={[]} // Will be fetched dynamically in the edit modal
      />

      {/* Create Invoice Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          {properties ? (
            <InvoiceForm
              onSubmit={async data => {
                try {
                  await createInvoice(data);
                  toast({
                    title: 'Success',
                    description: 'Invoice created successfully.',
                  });
                  setShowCreateForm(false);
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to create invoice. Please try again.',
                    variant: 'destructive',
                  });
                }
              }}
              onCancel={() => setShowCreateForm(false)}
              isLoading={false}
              mode='create'
              properties={properties.map(p => ({ _id: p._id, name: p.name, address: p.address }))}
              units={[]} // Units will be fetched dynamically in the form based on selected property
              tenants={[]} // Tenants will be fetched dynamically in the form based on selected property/unit
            />
          ) : (
            <div className='flex items-center justify-center h-32'>
              <p className='text-gray-600'>Loading form data...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
