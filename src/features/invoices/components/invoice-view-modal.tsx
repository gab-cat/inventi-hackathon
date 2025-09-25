import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Invoice } from '../types';
import {
  Calendar,
  Building,
  User,
  DollarSign,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
}

export function InvoiceViewModal({ invoice, isOpen, onClose, onEdit }: InvoiceViewModalProps) {
  if (!invoice) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case 'overdue':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      case 'cancelled':
        return <XCircle className='h-4 w-4 text-gray-500' />;
      case 'refunded':
        return <CreditCard className='h-4 w-4 text-blue-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      overdue: 'destructive',
      cancelled: 'outline',
      refunded: 'default',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {getStatusIcon(status)}
        <span className='ml-1 capitalize'>{status}</span>
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      rent: 'default',
      maintenance: 'secondary',
      utility: 'outline',
      fine: 'destructive',
      other: 'secondary',
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Invoice Details - {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header Section */}
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold'>{invoice.invoiceNumber}</h3>
              <p className='text-sm text-gray-600'>{invoice.description}</p>
            </div>
            <div className='flex items-center gap-2'>
              {getStatusBadge(invoice.status)}
              {getTypeBadge(invoice.invoiceType)}
            </div>
          </div>

          <Separator />

          {/* Property & Unit Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Building className='h-5 w-5 text-gray-400 mt-0.5' />
                <div>
                  <h4 className='font-medium'>Property</h4>
                  <p className='text-sm text-gray-600'>{invoice.property.name}</p>
                  <p className='text-xs text-gray-500'>{invoice.property.address}</p>
                </div>
              </div>

              {invoice.unit && (
                <div className='flex items-start gap-3'>
                  <Building className='h-5 w-5 text-gray-400 mt-0.5' />
                  <div>
                    <h4 className='font-medium'>Unit</h4>
                    <p className='text-sm text-gray-600'>Unit {invoice.unit.unitNumber}</p>
                    {invoice.unit.floor && <p className='text-xs text-gray-500'>Floor {invoice.unit.floor}</p>}
                  </div>
                </div>
              )}

              <div className='flex items-start gap-3'>
                <User className='h-5 w-5 text-gray-400 mt-0.5' />
                <div>
                  <h4 className='font-medium'>Tenant</h4>
                  <p className='text-sm text-gray-600'>
                    {invoice.tenant.firstName} {invoice.tenant.lastName}
                  </p>
                  <p className='text-xs text-gray-500'>{invoice.tenant.email}</p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Calendar className='h-5 w-5 text-gray-400 mt-0.5' />
                <div>
                  <h4 className='font-medium'>Due Date</h4>
                  <p className='text-sm text-gray-600'>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <Calendar className='h-5 w-5 text-gray-400 mt-0.5' />
                <div>
                  <h4 className='font-medium'>Created</h4>
                  <p className='text-sm text-gray-600'>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {invoice.paidAt && (
                <div className='flex items-start gap-3'>
                  <CheckCircle className='h-5 w-5 text-green-500 mt-0.5' />
                  <div>
                    <h4 className='font-medium'>Paid Date</h4>
                    <p className='text-sm text-gray-600'>{format(new Date(invoice.paidAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className='space-y-4'>
            <h4 className='font-medium flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              Financial Details
            </h4>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-600'>Subtotal</p>
                <p className='text-lg font-semibold'>${invoice.amount.toFixed(2)}</p>
              </div>

              {invoice.taxAmount && invoice.taxAmount > 0 && (
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-sm text-gray-600'>Tax</p>
                  <p className='text-lg font-semibold'>${invoice.taxAmount.toFixed(2)}</p>
                </div>
              )}

              {invoice.lateFee && invoice.lateFee > 0 && (
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-sm text-gray-600'>Late Fee</p>
                  <p className='text-lg font-semibold'>${invoice.lateFee.toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
              <div className='flex justify-between items-center'>
                <p className='text-lg font-medium'>Total Amount</p>
                <p className='text-2xl font-bold text-blue-600'>${invoice.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {invoice.totalPaid > 0 && (
              <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                <div className='flex justify-between items-center'>
                  <p className='text-lg font-medium'>Total Paid</p>
                  <p className='text-2xl font-bold text-green-600'>${invoice.totalPaid.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className='space-y-4'>
            <h4 className='font-medium flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Invoice Items
            </h4>

            <div className='space-y-2'>
              {invoice.items.map((item, index) => (
                <div key={index} className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium'>{item.description}</p>
                    {item.quantity && item.quantity > 1 && (
                      <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
                    )}
                  </div>
                  <p className='font-semibold'>${(item.amount * (item.quantity || 1)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          {invoice.paymentCount > 0 && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='font-medium flex items-center gap-2'>
                  <CreditCard className='h-4 w-4' />
                  Payment History
                </h4>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-sm text-gray-600'>{invoice.paymentCount} payment(s) made</p>
                  <p className='text-sm text-gray-600'>Total paid: ${invoice.totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </>
          )}

          {/* Blockchain Information */}
          {invoice.blockchainTxHash && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='font-medium'>Blockchain Transaction</h4>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-sm text-gray-600 break-all'>{invoice.blockchainTxHash}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          {invoice.status === 'pending' && <Button onClick={() => onEdit(invoice)}>Edit Invoice</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
