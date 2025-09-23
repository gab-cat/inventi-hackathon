import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Alert, Modal, TouchableOpacity, View, Text, Linking } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Id } from '@convex/_generated/dataModel';

type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'crypto';

interface Receipt {
  _id: Id<'receipts'>;
  receiptNumber: string;
  amount: number;
  blockchainTxHash: string;
  blockNumber: number;
  nftTokenId?: string;
  nftContractAddress?: string;
  createdAt: number;
  invoice: {
    _id: Id<'invoices'>;
    invoiceNumber: string;
    invoiceType: 'rent' | 'maintenance' | 'utility' | 'fine' | 'other';
    description: string;
    totalAmount: number;
    dueDate: number;
  };
  payment: {
    _id: Id<'payments'>;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    processedAt?: number;
  };
}

const paymentMethodIcons = {
  credit_card: 'card',
  bank_transfer: 'business',
  cash: 'cash',
  crypto: 'logo-bitcoin',
} as const;

const invoiceTypeColors = {
  rent: '#3B82F6',
  maintenance: '#F59E0B',
  utility: '#10B981',
  fine: '#EF4444',
  other: '#6B7280',
};

export default function ReceiptsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showReceiptDetailModal, setShowReceiptDetailModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Fetch receipts
  const receiptsData = useQuery(api.payments.getMyReceipts, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  // Mutations
  const downloadReceiptNFT = useMutation(api.payments.downloadReceiptNFT);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleViewReceiptDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptDetailModal(true);
  };

  const handleDownloadNFT = async (receipt: Receipt) => {
    try {
      const result = await downloadReceiptNFT({
        receiptId: receipt._id,
      });

      if (result.success && result.nftData) {
        // In a real app, this would open the NFT in a wallet or browser
        Alert.alert('NFT Downloaded', `Your receipt NFT has been prepared. Token ID: ${result.nftData.tokenId}`, [
          {
            text: 'View on Blockchain',
            onPress: () => {
              // Simulate opening blockchain explorer
              const explorerUrl = `https://etherscan.io/tx/${result.nftData.blockchainTxHash}`;
              Linking.openURL(explorerUrl);
            },
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to download NFT receipt');
      }
    } catch (error) {
      console.error('Error downloading NFT:', error);
      Alert.alert('Error', 'Failed to download NFT receipt');
    }
  };

  const renderReceiptCard = (receipt: Receipt) => {
    const paymentMethodIcon = paymentMethodIcons[receipt.payment.paymentMethod];
    const invoiceTypeColor = invoiceTypeColors[receipt.invoice.invoiceType];

    const cardContent = (
      <View className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3'>
        {/* Header */}
        <View className='flex-row items-center justify-between mb-3'>
          <View className='flex-row items-center flex-1'>
            <View
              className='w-10 h-10 rounded-full items-center justify-center mr-3'
              style={{ backgroundColor: `${invoiceTypeColor}20` }}
            >
              <Ionicons name='shield-checkmark' size={20} color={invoiceTypeColor} />
            </View>
            <View className='flex-1'>
              <Text className='font-semibold text-gray-900'>#{receipt.receiptNumber}</Text>
              <Text className='text-sm text-gray-600 capitalize'>{receipt.invoice.invoiceType}</Text>
            </View>
          </View>
          <View className='items-end'>
            <Text className='text-lg font-bold text-gray-900'>${receipt.amount.toFixed(2)}</Text>
            <View className='flex-row items-center mt-1'>
              <Ionicons name={paymentMethodIcon as any} size={12} color='#6B7280' />
              <Text className='text-xs text-gray-600 ml-1 capitalize'>
                {receipt.payment.paymentMethod.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View className='space-y-2 mb-3'>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-24'>Invoice:</Text>
            <Text className='text-sm text-gray-900 flex-1'>#{receipt.invoice.invoiceNumber}</Text>
          </View>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-24'>Paid:</Text>
            <Text className='text-sm text-gray-900 flex-1'>
              {receipt.payment.processedAt ? new Date(receipt.payment.processedAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-24'>Block:</Text>
            <Text className='text-sm text-gray-900 flex-1 font-mono'>#{receipt.blockNumber.toLocaleString()}</Text>
          </View>
          {receipt.nftTokenId && (
            <View className='flex-row'>
              <Text className='text-sm text-gray-600 w-24'>NFT:</Text>
              <Text className='text-sm text-blue-600 flex-1 font-mono'>{receipt.nftTokenId}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className='flex-row space-x-2 gap-2 border-t border-gray-100 pt-3'>
          <Button
            onPress={() => handleDownloadNFT(receipt)}
            variant='outline'
            size='sm'
            className='flex-1 border-blue-500'
          >
            <Ionicons name='download' size={16} color='#3B82F6' />
            <Text className='text-blue-600 font-medium ml-1 text-sm'>Download NFT</Text>
          </Button>
        </View>
      </View>
    );

    return (
      <TouchableOpacity key={receipt._id} onPress={() => handleViewReceiptDetails(receipt)} activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>
    );
  };

  return (
    <View className='flex-1 bg-gray-50'>
      <PageHeader
        title='Receipts'
        type='back'
        icon='receipt'
        subtitle='Your blockchain-verified payment receipts'
        className='mb-4'
      />

      <ScrollView
        className='flex-1 px-4'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {receiptsData === undefined ? (
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
        ) : receiptsData.success && receiptsData.receipts.length > 0 ? (
          receiptsData.receipts.map(renderReceiptCard)
        ) : (
          <View className='flex-1 items-center justify-center py-20'>
            <Ionicons name='receipt-outline' size={64} color='#D1D5DB' />
            <Text className='text-gray-500 text-center mt-4 text-lg font-medium'>No receipts found</Text>
            <Text className='text-gray-400 text-center mt-1 text-sm'>Your payment receipts will appear here</Text>
          </View>
        )}
      </ScrollView>

      {/* Receipt Detail Modal */}
      <Modal visible={showReceiptDetailModal} animationType='slide' presentationStyle='pageSheet'>
        <View className='flex-1'>
          <View className='relative'>
            <View className='absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-blue-800' />
            <View className='absolute inset-0 opacity-10'>
              <View className='absolute top-4 right-8 w-16 h-16 rounded-full bg-white' />
              <View className='absolute bottom-6 left-6 w-8 h-8 rounded-full bg-white' />
              <View className='absolute top-8 left-12 w-4 h-4 rounded-full bg-white' />
            </View>

            <View className='relative pt-14 pb-6 px-6 bg-green-800'>
              <View className='flex-row items-center justify-between'>
                <View className='flex-1'>
                  <View className='flex-row items-center mb-2'>
                    <View className='w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3'>
                      <Ionicons name='shield-checkmark' size={20} color='white' />
                    </View>
                    <Text className='text-2xl font-bold text-white'>Receipt Details</Text>
                  </View>
                  <Text className='text-green-100 text-sm font-medium'>Blockchain-verified payment receipt</Text>
                </View>
                <Button
                  onPress={() => setShowReceiptDetailModal(false)}
                  variant='ghost'
                  size='icon'
                  className='h-10 w-10 rounded-full bg-white/10 border border-white/20'
                >
                  <Ionicons name='close' size={18} color='white' />
                </Button>
              </View>
            </View>
          </View>

          <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
            {selectedReceipt && (
              <View className='p-4'>
                {/* Status Card */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <View className='flex-row items-center justify-between mb-3'>
                    <View className='flex-row items-center'>
                      <View className='w-12 h-12 rounded-lg bg-green-100 items-center justify-center mr-3'>
                        <Ionicons name='shield-checkmark' size={20} color='#10B981' />
                      </View>
                      <View>
                        <Text className='text-lg font-bold text-gray-900'>
                          Receipt #{selectedReceipt.receiptNumber}
                        </Text>
                        <Text className='text-sm text-green-600 font-medium'>Blockchain Verified</Text>
                      </View>
                    </View>
                    <View className='items-end'>
                      <Text className='text-2xl font-bold text-gray-900'>${selectedReceipt.amount.toFixed(2)}</Text>
                      <Text className='text-sm text-gray-600'>
                        Paid {new Date(selectedReceipt.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Verification Badge */}
                  <View className='flex-row items-center bg-green-50 border border-green-200 rounded-lg p-3'>
                    <Ionicons name='checkmark-circle' size={16} color='#10B981' />
                    <Text className='text-green-800 text-sm ml-2 flex-1'>
                      This receipt is secured on the blockchain and cannot be altered
                    </Text>
                  </View>
                </View>

                {/* Invoice Information */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <Text className='text-lg font-bold text-gray-900 mb-3'>Invoice Details</Text>

                  <View className='space-y-2'>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Invoice Number:</Text>
                      <Text className='text-gray-900 font-medium'>#{selectedReceipt.invoice.invoiceNumber}</Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Type:</Text>
                      <Text className='text-gray-900 font-medium capitalize'>
                        {selectedReceipt.invoice.invoiceType}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Description:</Text>
                      <Text className='text-gray-900 font-medium flex-1 text-right ml-2'>
                        {selectedReceipt.invoice.description}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Amount:</Text>
                      <Text className='text-gray-900 font-medium'>
                        ${selectedReceipt.invoice.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2'>
                      <Text className='text-gray-600'>Due Date:</Text>
                      <Text className='text-gray-900 font-medium'>
                        {new Date(selectedReceipt.invoice.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment Information */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <Text className='text-lg font-bold text-gray-900 mb-3'>Payment Details</Text>

                  <View className='space-y-2'>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Payment Method:</Text>
                      <View className='flex-row items-center'>
                        <Ionicons
                          name={paymentMethodIcons[selectedReceipt.payment.paymentMethod] as any}
                          size={16}
                          color='#6B7280'
                        />
                        <Text className='text-gray-900 font-medium ml-2 capitalize'>
                          {selectedReceipt.payment.paymentMethod.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    {selectedReceipt.payment.paymentReference && (
                      <View className='flex-row justify-between py-2 border-b border-gray-100'>
                        <Text className='text-gray-600'>Reference:</Text>
                        <Text className='text-gray-900 font-medium font-mono'>
                          {selectedReceipt.payment.paymentReference}
                        </Text>
                      </View>
                    )}
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Processed:</Text>
                      <Text className='text-gray-900 font-medium'>
                        {selectedReceipt.payment.processedAt
                          ? new Date(selectedReceipt.payment.processedAt).toLocaleString()
                          : 'N/A'}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2'>
                      <Text className='text-gray-600'>Receipt Created:</Text>
                      <Text className='text-gray-900 font-medium'>
                        {new Date(selectedReceipt.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Blockchain Information */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <Text className='text-lg font-bold text-gray-900 mb-3'>Blockchain Verification</Text>

                  <View className='space-y-2'>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Transaction Hash:</Text>
                      <Text className='text-gray-900 font-medium font-mono text-xs flex-1 text-right ml-2'>
                        {selectedReceipt.blockchainTxHash.slice(0, 20)}...
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Block Number:</Text>
                      <Text className='text-gray-900 font-medium'>#{selectedReceipt.blockNumber.toLocaleString()}</Text>
                    </View>
                    {selectedReceipt.nftTokenId && (
                      <View className='flex-row justify-between py-2 border-b border-gray-100'>
                        <Text className='text-gray-600'>NFT Token ID:</Text>
                        <Text className='text-blue-600 font-medium font-mono text-sm'>
                          {selectedReceipt.nftTokenId}
                        </Text>
                      </View>
                    )}
                    {selectedReceipt.nftContractAddress && (
                      <View className='flex-row justify-between py-2'>
                        <Text className='text-gray-600'>Contract:</Text>
                        <Text className='text-gray-900 font-medium font-mono text-xs flex-1 text-right ml-2'>
                          {selectedReceipt.nftContractAddress.slice(0, 20)}...
                        </Text>
                      </View>
                    )}
                  </View>

                  <Button
                    onPress={() => {
                      const explorerUrl = `https://etherscan.io/tx/${selectedReceipt.blockchainTxHash}`;
                      Linking.openURL(explorerUrl);
                    }}
                    variant='outline'
                    className='w-full mt-4 border-blue-500'
                  >
                    <Ionicons name='open-outline' size={16} color='#3B82F6' />
                    <Text className='text-blue-600 font-medium ml-2'>View on Blockchain Explorer</Text>
                  </Button>
                </View>

                {/* Action Buttons */}
                <View className='bg-white rounded-lg p-4 border border-gray-200'>
                  <Button
                    onPress={() => {
                      setShowReceiptDetailModal(false);
                      handleDownloadNFT(selectedReceipt);
                    }}
                    variant='default'
                    className='w-full bg-green-500'
                  >
                    <View className='flex-row items-center justify-center'>
                      <Ionicons name='download' size={16} color='white' />
                      <Text className='text-white font-medium ml-2'>Download NFT Receipt</Text>
                    </View>
                  </Button>
                </View>
              </View>
            )}
          </ScrollView>

          <View className='h-8' />
        </View>
      </Modal>
    </View>
  );
}
