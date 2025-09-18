import { CheckCircle, Clock, Wrench, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'available':
      return <CheckCircle className='h-4 w-4 text-green-800' />;
    case 'checked_out':
      return <Clock className='h-4 w-4 text-blue-800' />;
    case 'maintenance':
      return <Wrench className='h-4 w-4 text-orange-800' />;
    case 'retired':
      return <Trash2 className='h-4 w-4 text-gray-800' />;
    case 'lost':
      return <Trash2 className='h-4 w-4 text-red-800' />;
    default:
      return <Clock className='h-4 w-4 text-gray-800' />;
  }
};

export const getStatusBadge = (status: string) => {
  const statusConfig = {
    available: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    checked_out: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    maintenance: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    retired: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    lost: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.retired;

  return (
    <Badge variant='outline' className={`${config.bg} ${config.text} ${config.border} border`}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

export const getConditionBadge = (condition: string) => {
  const conditionConfig = {
    excellent: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    good: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    fair: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    poor: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    broken: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  } as const;

  const config = conditionConfig[condition as keyof typeof conditionConfig] || conditionConfig.fair;

  return (
    <Badge variant='outline' className={`${config.bg} ${config.text} ${config.border} border`}>
      {condition}
    </Badge>
  );
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
