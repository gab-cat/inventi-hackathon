import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { InvoiceForm } from './invoice-form';
import { Invoice } from '../types';
import { Edit } from 'lucide-react';

interface InvoiceEditModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  properties: any[];
  units: any[];
  tenants: any[];
}

export function InvoiceEditModal({
  invoice,
  isOpen,
  onClose,
  onSave,
  properties,
  units,
  tenants,
}: InvoiceEditModalProps) {
  if (!invoice) return null;

  // Convert invoice data to form format
  const initialData = {
    propertyId: invoice.propertyId,
    unitId: invoice.unitId || 'none',
    tenantId: invoice.tenantId,
    invoiceType: invoice.invoiceType,
    description: invoice.description,
    taxAmount: invoice.taxAmount || 0,
    dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
    items: invoice.items,
    lateFee: invoice.lateFee || 0,
  };

  const handleSave = (data: any) => {
    onSave({
      ...data,
      invoiceId: invoice._id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Invoice - {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <InvoiceForm
          initialData={initialData}
          onSubmit={handleSave}
          onCancel={onClose}
          isLoading={false}
          mode='edit'
          properties={properties}
          units={units}
          tenants={tenants}
        />
      </DialogContent>
    </Dialog>
  );
}
