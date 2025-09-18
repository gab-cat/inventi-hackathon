import { CheckCircle, Clock, Wrench, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'available':
      return <CheckCircle className='h-4 w-4 text-green-600' />;
    case 'checked_out':
      return <Clock className='h-4 w-4 text-blue-600' />;
    case 'maintenance':
      return <Wrench className='h-4 w-4 text-orange-600' />;
    case 'retired':
      return <Trash2 className='h-4 w-4 text-gray-600' />;
    case 'lost':
      return <Trash2 className='h-4 w-4 text-red-600' />;
    default:
      return <Clock className='h-4 w-4 text-gray-600' />;
  }
};

export const getStatusBadge = (status: string) => {
  const variants = {
    available: 'default',
    checked_out: 'secondary',
    maintenance: 'destructive',
    retired: 'outline',
    lost: 'destructive',
  } as const;

  return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status.replace('_', ' ')}</Badge>;
};

export const getConditionBadge = (condition: string) => {
  const variants = {
    excellent: 'default',
    good: 'secondary',
    fair: 'outline',
    poor: 'destructive',
    broken: 'destructive',
  } as const;

  return <Badge variant={variants[condition as keyof typeof variants] || 'outline'}>{condition}</Badge>;
};

export const formatCurrency = (amount?: number) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString();
};
