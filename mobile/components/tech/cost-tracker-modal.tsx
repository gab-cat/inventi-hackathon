import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text } from '../ui/text';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { X, Calculator, DollarSign, Clock, Package } from 'lucide-react-native';
import { TextField } from '../ui/TextField';

interface CostTrackerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (costData: CostData) => void;
  initialData?: Partial<CostData>;
}

interface CostData {
  materialsCost: number;
  laborHours: number;
  laborRate: number;
  notes: string;
}

export function CostTrackerModal({ visible, onClose, onSave, initialData }: CostTrackerModalProps) {
  const [materialsCost, setMaterialsCost] = useState(initialData?.materialsCost?.toString() || '');
  const [laborHours, setLaborHours] = useState(initialData?.laborHours?.toString() || '');
  const [laborRate, setLaborRate] = useState(initialData?.laborRate?.toString() || '50'); // Default $50/hour
  const [notes, setNotes] = useState(initialData?.notes || '');

  const materialsCostNum = parseFloat(materialsCost) || 0;
  const laborHoursNum = parseFloat(laborHours) || 0;
  const laborRateNum = parseFloat(laborRate) || 50;
  const laborCost = laborHoursNum * laborRateNum;
  const totalCost = materialsCostNum + laborCost;

  const handleSave = () => {
    if (materialsCostNum < 0 || laborHoursNum < 0 || laborRateNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for costs and hours.');
      return;
    }

    onSave({
      materialsCost: materialsCostNum,
      laborHours: laborHoursNum,
      laborRate: laborRateNum,
      notes: notes.trim(),
    });

    // Reset form
    setMaterialsCost('');
    setLaborHours('');
    setLaborRate('50');
    setNotes('');
  };

  const handleClose = () => {
    // Reset form when closing
    setMaterialsCost('');
    setLaborHours('');
    setLaborRate('50');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View className='flex-1 bg-black/50 items-center justify-end'>
        <View className='bg-white dark:bg-gray-900 rounded-t-3xl w-full max-h-4/5 border-t border-gray-200/50 dark:border-gray-700/50'>
          {/* Header */}
          <View className='flex-row justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50'>
            <View className='flex-row items-center gap-3'>
              <View className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center'>
                <Icon as={Calculator} size={20} className='text-blue-600' />
              </View>
              <View>
                <Text className='text-xl font-semibold text-foreground'>Cost Tracking</Text>
                <Text className='text-sm text-muted-foreground'>Track materials and labor costs</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Icon as={X} size={24} className='text-muted-foreground' />
            </TouchableOpacity>
          </View>

          <ScrollView className='p-6'>
            {/* Materials Cost */}
            <View className='mb-6'>
              <View className='flex-row items-center gap-2 mb-2'>
                <Icon as={Package} size={16} className='text-muted-foreground' />
                <Text className='text-sm font-medium'>Materials Cost</Text>
              </View>
              <TextField
                placeholder='0.00'
                value={materialsCost}
                onChangeText={setMaterialsCost}
                keyboardType='decimal-pad'
                className='text-right'
              />
            </View>

            {/* Labor Hours */}
            <View className='mb-6'>
              <View className='flex-row items-center gap-2 mb-2'>
                <Icon as={Clock} size={16} className='text-muted-foreground' />
                <Text className='text-sm font-medium'>Labor Hours</Text>
              </View>
              <TextField
                placeholder='0.0'
                value={laborHours}
                onChangeText={setLaborHours}
                keyboardType='decimal-pad'
                className='text-right'
              />
            </View>

            {/* Labor Rate */}
            <View className='mb-6'>
              <View className='flex-row items-center gap-2 mb-2'>
                <Icon as={DollarSign} size={16} className='text-muted-foreground' />
                <Text className='text-sm font-medium'>Hourly Rate ($)</Text>
              </View>
              <TextField
                placeholder='50.00'
                value={laborRate}
                onChangeText={setLaborRate}
                keyboardType='decimal-pad'
                className='text-right'
              />
            </View>

            {/* Notes */}
            <View className='mb-6'>
              <Text className='text-sm font-medium mb-2'>Notes (Optional)</Text>
              <TextField
                placeholder='Additional cost details...'
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                className='min-h-20'
              />
            </View>

            {/* Cost Summary */}
            <View className='bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 border border-gray-200/50 dark:border-gray-700/50'>
              <Text className='text-lg font-semibold mb-3 text-foreground'>Cost Summary</Text>

              <View className='space-y-2'>
                <View className='flex-row justify-between'>
                  <Text className='text-sm text-muted-foreground'>Materials</Text>
                  <Text className='text-sm font-medium text-foreground'>${materialsCostNum.toFixed(2)}</Text>
                </View>

                <View className='flex-row justify-between'>
                  <Text className='text-sm text-muted-foreground'>
                    Labor ({laborHoursNum}h × ${laborRateNum}/h)
                  </Text>
                  <Text className='text-sm font-medium text-foreground'>${laborCost.toFixed(2)}</Text>
                </View>

                <View className='border-t border-gray-200/50 dark:border-gray-700/50 pt-2 mt-2'>
                  <View className='flex-row justify-between'>
                    <Text className='font-semibold text-foreground'>Total Cost</Text>
                    <Text className='font-semibold text-green-600'>${totalCost.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className='flex-row gap-3 p-6 border-t border-gray-200/50 dark:border-gray-700/50'>
            <Button onPress={handleClose} variant='outline' className='flex-1 gap-2'>
              <Icon as={X} size={16} />
              <Text>Cancel</Text>
            </Button>
            <Button onPress={handleSave} variant='default' className='flex-1 gap-2'>
              <Icon as={DollarSign} size={16} className='text-white' />
              <Text>Save Cost</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
