import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Alert, Modal, TouchableOpacity, View, Text } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/providers/notification.provider';
import { Id } from '@convex/_generated/dataModel';
import { cn } from '@/lib/utils';

type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'crypto';

interface Invoice {
  _id: Id<'invoices'>;
  invoiceNumber: string;
  invoiceType: 'rent' | 'maintenance' | 'utility' | 'fine' | 'other';
  description: string;
  amount: number;
  totalAmount: number;
  dueDate: number;
  status: InvoiceStatus;
  paidAt?: number;
  paymentMethod?: string;
  items: {
    description: string;
    amount: number;
    quantity?: number;
  }[];
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  _creationTime: number;
}

const statusColors = {
  pending: '#F59E0B',
  paid: '#10B981',
  overdue: '#EF4444',
  cancelled: '#6B7280',
  refunded: '#8B5CF6',
};

const statusIcons = {
  pending: 'time-outline',
  paid: 'checkmark-circle-outline',
  overdue: 'warning-outline',
  cancelled: 'close-circle-outline',
  refunded: 'return-up-back-outline',
} as const;

const invoiceTypeColors = {
  rent: '#3B82F6',
  maintenance: '#F59E0B',
  utility: '#10B981',
  fine: '#EF4444',
  other: '#6B7280',
};

export default function PaymentsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');

  const { isTokenRegistered } = useNotifications();

  // Fetch invoices
  const invoicesData = useQuery(api.payments.getMyInvoices, {
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    paginationOpts: { numItems: 50, cursor: null },
  });

  // Mutations
  const payInvoice = useMutation(api.payments.payInvoice);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handlePayInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleViewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetailModal(true);
  };

  const handleViewReceipts = () => {
    router.push('/payments/receipts');
  };

  const submitPayment = async () => {
    if (!selectedInvoice) return;

    try {
      const result = await payInvoice({
        invoiceId: selectedInvoice._id,
        paymentMethod: selectedPaymentMethod,
      });

      if (result.success) {
        Alert.alert('Success', 'Payment processed successfully!', [
          {
            text: 'View Receipt',
            onPress: () => {
              setShowPaymentModal(false);
              handleViewReceipts();
            },
          },
          {
            text: 'OK',
            onPress: () => setShowPaymentModal(false),
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const renderInvoiceCard = (invoice: Invoice) => {
    const statusColor = statusColors[invoice.status];
    const statusIcon = statusIcons[invoice.status];
    const invoiceTypeColor = invoiceTypeColors[invoice.invoiceType];
    const isOverdue = invoice.status === 'pending' && new Date(invoice.dueDate) < new Date();
    const canPay = invoice.status === 'pending';

    const cardContent = (
      <View className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3'>
        {/* Header */}
        <View className='flex-row items-center justify-between mb-3'>
          <View className='flex-row items-center flex-1'>
            <View
              className='w-10 h-10 rounded-full items-center justify-center mr-3'
              style={{ backgroundColor: `${invoiceTypeColor}20` }}
            >
              <Ionicons name='document-text-outline' size={20} color={invoiceTypeColor} />
            </View>
            <View className='flex-1'>
              <Text className='font-semibold text-gray-900 capitalize'>{invoice.invoiceType}</Text>
              <Text className='text-sm text-gray-600'>#{invoice.invoiceNumber}</Text>
            </View>
          </View>
          <View className='items-end'>
            <Text className='text-lg font-bold text-gray-900'>${invoice.totalAmount.toFixed(2)}</Text>
            <View
              className='flex-row items-center mt-1 px-2 py-1 rounded-full'
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <Ionicons name={statusIcon} size={12} color={statusColor} />
              <Text className='text-xs font-medium ml-1 capitalize' style={{ color: statusColor }}>
                {invoice.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View className='space-y-2 mb-3'>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-20'>Due:</Text>
            <Text className={cn('text-sm flex-1', isOverdue ? 'text-red-600 font-medium' : 'text-gray-900')}>
              {new Date(invoice.dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </Text>
          </View>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-20'>Items:</Text>
            <Text className='text-sm text-gray-900 flex-1'>{invoice.items.length} item(s)</Text>
          </View>
          {invoice.paidAt && (
            <View className='flex-row'>
              <Text className='text-sm text-gray-600 w-20'>Paid:</Text>
              <Text className='text-sm text-gray-900 flex-1'>{new Date(invoice.paidAt).toLocaleDateString()}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {canPay && (
          <View className='flex-row space-x-2 gap-2 border-t border-gray-100 pt-3'>
            <Button
              onPress={() => handlePayInvoice(invoice)}
              variant='default'
              size='sm'
              className='flex-1 bg-green-500 hover:bg-green-600'
            >
              <Ionicons name='card' size={16} color='white' />
              <Text className='text-white font-medium ml-1 text-sm'>Pay Now</Text>
            </Button>
          </View>
        )}
      </View>
    );

    return (
      <TouchableOpacity key={invoice._id} onPress={() => handleViewInvoiceDetails(invoice)} activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>
    );
  };

  const statusFilters = [
    { key: 'all' as const, label: 'All', count: invoicesData?.invoices?.length || 0 },
    {
      key: 'pending' as const,
      label: 'Pending',
      count: invoicesData?.invoices?.filter(inv => inv.status === 'pending').length || 0,
    },
    {
      key: 'paid' as const,
      label: 'Paid',
      count: invoicesData?.invoices?.filter(inv => inv.status === 'paid').length || 0,
    },
    {
      key: 'overdue' as const,
      label: 'Overdue',
      count: invoicesData?.invoices?.filter(inv => inv.status === 'overdue').length || 0,
    },
  ];

  return (
    <View className='flex-1 bg-gray-50'>
      <PageHeader
        title='Payments'
        type='back'
        icon='card'
        subtitle='Manage your invoices and payments'
        className='mb-4'
      />

      {!isTokenRegistered && (
        <View className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-4 mb-4'>
          <View className='flex-row items-center'>
            <Ionicons name='warning' size={20} color='#F59E0B' />
            <Text className='text-yellow-800 ml-2 flex-1 text-sm'>
              Push notifications are not enabled. You may miss payment reminders.
            </Text>
          </View>
        </View>
      )}

      {/* Header Actions */}
      <View className='flex-row justify-between items-center px-4 mb-4'>
        <Text className='text-lg font-semibold text-gray-900'>My Invoices</Text>
        <Button onPress={handleViewReceipts} variant='outline' size='sm'>
          <Ionicons name='receipt' size={16} color='#6B7280' />
          <Text className='text-gray-700 font-medium ml-1 text-sm'>Receipts</Text>
        </Button>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='px-4 mb-4' style={{ flexGrow: 0 }}>
        <View className='flex-row space-x-2 gap-1'>
          {statusFilters.map(filter => (
            <Button
              key={filter.key}
              onPress={() => setStatusFilter(filter.key)}
              variant={statusFilter === filter.key ? 'default' : 'outline'}
              size='sm'
              className='rounded-full'
            >
              <Text className={cn('text-sm font-medium', statusFilter === filter.key ? 'text-white' : 'text-gray-900')}>
                {filter.label} ({filter.count})
              </Text>
            </Button>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        className='flex-1 px-4'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {invoicesData === undefined ? (
          // Loading state
          <View className='space-y-3'>
            {[1, 2, 3].map(i => (
              <View key={i} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
                <View className='animate-pulse'>
                  <View className='h-4 bg-gray-200 rounded w-3/4 mb-2'></View>
                  <View className='h-3 bg-gray-200 rounded w-full mb-1'></View>
                  <View className='h-3 bg-gray-200 rounded w-2/3'></View>
                </View>
              </View>
            ))}
          </View>
        ) : invoicesData.success && invoicesData.invoices.length > 0 ? (
          invoicesData.invoices.map(renderInvoiceCard)
        ) : (
          <View className='flex-1 items-center justify-center py-20'>
            <Ionicons name='document-text-outline' size={64} color='#D1D5DB' />
            <Text className='text-gray-500 text-center mt-4 text-lg font-medium'>No invoices found</Text>
            <Text className='text-gray-400 text-center mt-1 text-sm'>
              {statusFilter === 'all' ? "You don't have any invoices yet" : `No ${statusFilter} invoices`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType='slide' presentationStyle='pageSheet'>
        <View className='flex-1 bg-slate-50'>
          <PageHeader
            title='Make Payment'
            subtitle='Secure blockchain-verified transaction'
            type='back'
            icon='card'
            rightSlot={
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <View className='bg-blue-800/10 border border-blue-800/20 rounded-lg px-3 py-2'>
                  <Ionicons name='close' size={16} color='#1e40af' />
                </View>
              </TouchableOpacity>
            }
            className='mb-4'
          />

          <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
            <View className='px-4 py-4'>
              {selectedInvoice && (
                <>
                  {/* Invoice Summary */}
                  <View className='bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm'>
                    <View className='flex-row items-center mb-4'>
                      <View className='w-8 h-8 rounded-lg bg-blue-100 items-center justify-center mr-3'>
                        <Ionicons name='document-text' size={16} color='#3B82F6' />
                      </View>
                      <Text className='text-lg font-bold text-gray-900'>Invoice Summary</Text>
                    </View>

                    <View className='bg-gray-50 rounded-lg p-4'>
                      <View className='flex-row justify-between items-center mb-2'>
                        <Text className='text-gray-600'>Invoice #</Text>
                        <Text className='font-semibold text-gray-900'>{selectedInvoice.invoiceNumber}</Text>
                      </View>
                      <View className='flex-row justify-between items-center mb-2'>
                        <Text className='text-gray-600'>Type</Text>
                        <Text className='font-semibold text-gray-900 capitalize'>{selectedInvoice.invoiceType}</Text>
                      </View>
                      <View className='flex-row justify-between items-center mb-2'>
                        <Text className='text-gray-600'>Due Date</Text>
                        <Text className='font-semibold text-gray-900'>
                          {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className='flex-row justify-between items-center pt-2 border-t border-gray-200'>
                        <Text className='text-lg font-bold text-gray-900'>Total Amount</Text>
                        <Text className='text-2xl font-bold text-green-600'>
                          ${selectedInvoice.totalAmount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Method Selection */}
                  <View className='bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm'>
                    <View className='flex-row items-center mb-4'>
                      <View className='w-8 h-8 rounded-lg bg-green-100 items-center justify-center mr-3'>
                        <Ionicons name='card' size={16} color='#10B981' />
                      </View>
                      <Text className='text-lg font-bold text-gray-900'>Payment Method</Text>
                    </View>

                    <Text className='text-gray-600 text-sm mb-4'>Choose your preferred payment method</Text>

                    <View className='space-y-3 gap-2'>
                      {[
                        { key: 'credit_card', label: 'Credit Card', icon: 'card' },
                        { key: 'bank_transfer', label: 'Bank Transfer', icon: 'business' },
                        { key: 'cash', label: 'Cash', icon: 'cash' },
                        { key: 'crypto', label: 'Cryptocurrency', icon: 'logo-bitcoin' },
                      ].map(method => (
                        <Button
                          key={method.key}
                          onPress={() => setSelectedPaymentMethod(method.key as PaymentMethod)}
                          variant={selectedPaymentMethod === method.key ? 'default' : 'outline'}
                          className={cn(
                            'w-full justify-start p-4 h-auto border',
                            selectedPaymentMethod === method.key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <View className='flex-row items-center flex-1'>
                            <View
                              className='w-12 h-12 rounded-lg items-center justify-center mr-4'
                              style={{
                                backgroundColor: selectedPaymentMethod === method.key ? '#3B82F6' : '#F3F4F6',
                              }}
                            >
                              <Ionicons
                                name={method.icon as any}
                                size={20}
                                color={selectedPaymentMethod === method.key ? 'white' : '#6B7280'}
                              />
                            </View>
                            <Text
                              className={cn(
                                'text-base font-medium',
                                selectedPaymentMethod === method.key ? 'text-blue-900' : 'text-gray-700'
                              )}
                            >
                              {method.label}
                            </Text>
                            {selectedPaymentMethod === method.key && (
                              <View className='ml-auto'>
                                <Ionicons name='checkmark-circle' size={20} color='#3B82F6' />
                              </View>
                            )}
                          </View>
                        </Button>
                      ))}
                    </View>
                  </View>

                  {/* Pay Button */}
                  <View className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm'>
                    <Button onPress={submitPayment} variant='default' className='w-full rounded-lg bg-green-500 mb-4'>
                      <View className='flex-row items-center justify-center'>
                        <Ionicons name='shield-checkmark' size={16} color='white' />
                        <Text className='text-white font-semibold text-lg ml-2'>
                          Pay ${selectedInvoice.totalAmount.toFixed(2)}
                        </Text>
                      </View>
                    </Button>

                    <View className='flex-row items-center justify-center'>
                      <Ionicons name='shield-checkmark' size={14} color='#10B981' />
                      <Text className='text-green-600 text-sm ml-1'>Blockchain secured • Instant verification</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal visible={showInvoiceDetailModal} animationType='slide' presentationStyle='pageSheet'>
        <View className='flex-1 bg-slate-50'>
          <PageHeader
            title='Invoice Details'
            subtitle='Complete invoice information'
            type='back'
            icon='document-text'
            rightSlot={
              <TouchableOpacity onPress={() => setShowInvoiceDetailModal(false)}>
                <View className='bg-blue-800/10 border border-blue-800/20 rounded-lg px-3 py-2'>
                  <Ionicons name='close' size={18} color='#1e40af' />
                </View>
              </TouchableOpacity>
            }
            className='mb-4'
          />

          <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
            {selectedInvoice && (
              <View className='p-4'>
                {/* Status Card */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <View className='flex-row items-center mb-3'>
                    <View
                      className='w-12 h-12 rounded-lg items-center justify-center mr-3'
                      style={{ backgroundColor: statusColors[selectedInvoice.status] }}
                    >
                      <Ionicons name={statusIcons[selectedInvoice.status]} size={20} color='white' />
                    </View>
                    <View className='flex-1'>
                      <Text className='text-lg font-bold text-gray-900'>Invoice #{selectedInvoice.invoiceNumber}</Text>
                      <Text
                        className='text-sm text-gray-600 capitalize'
                        style={{ color: statusColors[selectedInvoice.status] }}
                      >
                        {selectedInvoice.status}
                      </Text>
                    </View>
                  </View>

                  <View className='flex-row justify-between items-center pt-2 border-t border-gray-100'>
                    <Text className='text-2xl font-bold text-gray-900'>${selectedInvoice.totalAmount.toFixed(2)}</Text>
                    <View className='items-end'>
                      <Text className='text-sm text-gray-600'>
                        Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </Text>
                      {selectedInvoice.paidAt && (
                        <Text className='text-sm text-green-600'>
                          Paid: {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Invoice Information */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <Text className='text-lg font-bold text-gray-900 mb-3'>Invoice Information</Text>

                  <View className='space-y-2'>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Type:</Text>
                      <Text className='text-gray-900 font-medium capitalize'>{selectedInvoice.invoiceType}</Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Description:</Text>
                      <Text className='text-gray-900 font-medium flex-1 text-right ml-2'>
                        {selectedInvoice.description}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Subtotal:</Text>
                      <Text className='text-gray-900 font-medium'>${selectedInvoice.amount.toFixed(2)}</Text>
                    </View>
                    {selectedInvoice.totalAmount > selectedInvoice.amount && (
                      <View className='flex-row justify-between py-2 border-b border-gray-100'>
                        <Text className='text-gray-600'>Tax/Fees:</Text>
                        <Text className='text-gray-900 font-medium'>
                          ${(selectedInvoice.totalAmount - selectedInvoice.amount).toFixed(2)}
                        </Text>
                      </View>
                    )}
                    <View className='flex-row justify-between py-2'>
                      <Text className='text-gray-900 font-bold'>Total:</Text>
                      <Text className='text-gray-900 font-bold text-lg'>${selectedInvoice.totalAmount.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                {/* Line Items */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <Text className='text-lg font-bold text-gray-900 mb-3'>Line Items</Text>

                  <View className='space-y-2'>
                    {selectedInvoice.items.map((item, index) => (
                      <View key={index} className='flex-row justify-between py-2 border-b border-gray-100'>
                        <View className='flex-1'>
                          <Text className='text-gray-900 font-medium'>{item.description}</Text>
                          {item.quantity && item.quantity > 1 && (
                            <Text className='text-sm text-gray-600'>Qty: {item.quantity}</Text>
                          )}
                        </View>
                        <Text className='text-gray-900 font-medium'>${item.amount.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                {selectedInvoice.status === 'pending' && (
                  <View className='bg-white rounded-lg p-4 border border-gray-200'>
                    <Button
                      onPress={() => {
                        setShowInvoiceDetailModal(false);
                        handlePayInvoice(selectedInvoice);
                      }}
                      variant='default'
                      className='w-full bg-green-500'
                    >
                      <View className='flex-row items-center justify-center'>
                        <Ionicons name='card' size={16} color='white' />
                        <Text className='text-white font-medium ml-2'>Pay Invoice</Text>
                      </View>
                    </Button>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View className='h-8' />
        </View>
      </Modal>
    </View>
  );
}
