import React, { useState } from 'react';
import { FlatList, RefreshControl, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { usePropertyStore } from '@/stores/user.store';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';
import { TextField } from '@/components/ui/TextField';
import { Building2, Plus, Home, MapPin, Hash } from 'lucide-react-native';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Doc, Id } from '@convex/_generated/dataModel';

type UnitFormData = {
  propertyId?: string;
  unitNumber: string;
  unitType: 'apartment' | 'condo' | 'house' | 'office' | 'retail' | 'storage';
  floor?: string;
  bedrooms?: string;
  bathrooms?: string;
  squareFootage?: string;
};

type PropertyWithRole = Doc<'properties'> & {
  userRole: string;
  permissions: string[];
};

type UnitWithProperty = Doc<'units'> & {
  property?: Doc<'properties'> | null;
};

type QueryResult<T> = {
  success: boolean;
  message?: string;
} & T;

type PropertiesQueryResult = QueryResult<{
  properties: PropertyWithRole[];
}>;

type UnitsQueryResult = QueryResult<{
  units: UnitWithProperty[];
}>;

export default function PropertiesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { selectedPropertyId, selectedUnit, setSelectedPropertyId, setSelectedUnit, clearSelection } =
    usePropertyStore();
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitFormData, setUnitFormData] = useState<UnitFormData>({
    propertyId: selectedPropertyId || undefined,
    unitNumber: '',
    unitType: 'apartment',
    floor: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
  });

  // Convex queries and mutations
  const myProperties = useQuery(api.property.getMyProperties) as PropertiesQueryResult | undefined;
  const allProperties = useQuery(api.property.getProperties, {}) as PropertiesQueryResult | undefined;
  const myUnits = useQuery(api.unit.getMyUnits) as UnitsQueryResult | undefined;
  const createAndAssignUnit = useMutation(api.unit.createAndAssignUnit);

  const isLoading = myProperties === undefined || myUnits === undefined || allProperties === undefined;
  const properties = myProperties?.success ? myProperties.properties : [];
  const allPropertiesList = allProperties?.success ? allProperties.properties : [];
  const userUnits = myUnits?.success ? myUnits.units : [];

  // Sync selectedPropertyId with form data when dialog opens
  React.useEffect(() => {
    if (showUnitForm && selectedPropertyId) {
      setUnitFormData(prev => ({ ...prev, propertyId: selectedPropertyId }));
    }
  }, [showUnitForm, selectedPropertyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const handleUnitFormSubmit = async () => {
    if (!unitFormData.propertyId || !unitFormData.unitNumber.trim()) {
      Alert.alert('Error', 'Please select a property and fill in all required fields');
      return;
    }

    try {
      // Create and assign unit to current user
      const result = await createAndAssignUnit({
        propertyId: unitFormData.propertyId as Id<'properties'>,
        unitNumber: unitFormData.unitNumber.trim(),
        unitType: unitFormData.unitType,
        floor: unitFormData.floor ? parseInt(unitFormData.floor) : undefined,
        bedrooms: unitFormData.bedrooms ? parseInt(unitFormData.bedrooms) : undefined,
        bathrooms: unitFormData.bathrooms ? parseFloat(unitFormData.bathrooms) : undefined,
        squareFootage: unitFormData.squareFootage ? parseInt(unitFormData.squareFootage) : undefined,
      });

      if (result.success) {
        Alert.alert('Success', 'Unit created and assigned successfully!');
        setShowUnitForm(false);
        setUnitFormData({
          propertyId: selectedPropertyId || undefined,
          unitNumber: '',
          unitType: 'apartment',
          floor: '',
          bedrooms: '',
          bathrooms: '',
          squareFootage: '',
        });
      } else {
        Alert.alert('Error', result.message || 'Failed to create unit');
      }
    } catch (error) {
      console.error('Unit creation error:', error);
      Alert.alert('Error', 'Failed to create unit. Please try again.');
    }
  };

  const renderPropertyCard = React.useCallback(
    ({ item, index }: { item: PropertyWithRole; index: number }) => (
      <View key={`property-${item._id}`}>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <View
              className={`
          ${selectedPropertyId === item._id ? 'bg-blue-50 border-2 border-blue-800' : 'bg-white border-0'} 
          rounded-2xl p-5 mb-4
        `}
            >
              <View className='flex-row items-center mb-4'>
                <View
                  className={`
              w-14 h-14 rounded-2xl items-center justify-center mr-4
              ${selectedPropertyId === item._id ? 'bg-blue-800' : 'bg-cyan-50'}
            `}
                >
                  <Icon
                    as={Building2}
                    size={28}
                    className={selectedPropertyId === item._id ? 'text-white' : 'text-blue-800'}
                  />
                </View>
                <View className='flex-1 mr-3'>
                  <Text
                    className={`
                text-lg font-bold mb-1 flex-1
                ${selectedPropertyId === item._id ? 'text-blue-800' : 'text-gray-900'}
              `}
                  >
                    {item.name}
                  </Text>
                  <View className='flex-row items-start'>
                    <Icon as={MapPin} size={16} className='text-blue-400 mr-2 mt-0.5' />
                    <Text className='text-sm text-gray-500 flex-1'>
                      {item.address}, {item.city}
                    </Text>
                  </View>
                </View>
                <View
                  className={`
              px-3 py-2 rounded-xl
              ${selectedPropertyId === item._id ? 'bg-blue-800' : 'bg-gray-200'}
            `}
                >
                  <Text
                    className={`
                text-xs font-semibold tracking-wide
                ${selectedPropertyId === item._id ? 'text-white' : 'text-gray-600'}
              `}
                  >
                    {item.userRole.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-5'>
                  <View className='flex-row items-center'>
                    <Icon as={Home} size={16} className='text-blue-400 mr-2' />
                    <Text className='text-sm text-gray-500 font-medium'>{item.totalUnits} units</Text>
                  </View>
                  <Text className='text-sm text-gray-500 font-medium capitalize'>{item.propertyType}</Text>
                </View>
                <Button
                  className={`
                rounded-xl px-4 py-2.5
                ${selectedPropertyId === item._id ? 'bg-blue-800' : 'bg-transparent border border-blue-800'}
              `}
                  size='sm'
                  onPress={() => (selectedPropertyId === item._id ? clearSelection() : setSelectedPropertyId(item._id))}
                >
                  <Text
                    className={`
                text-sm font-semibold
                ${selectedPropertyId === item._id ? 'text-white' : 'text-blue-800'}
              `}
                  >
                    {selectedPropertyId === item._id ? 'Selected ✓' : 'Select'}
                  </Text>
                </Button>
              </View>
            </View>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <View
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                padding: 16,
                marginTop: -8,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text className='text-sm font-medium text-foreground mb-2'>Property Details</Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text className='text-sm text-muted-foreground'>Address:</Text>
                  <Text className='text-sm text-foreground'>{item.address}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text className='text-sm text-muted-foreground'>City:</Text>
                  <Text className='text-sm text-foreground'>
                    {item.city}, {item.state} {item.zipCode}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text className='text-sm text-muted-foreground'>Country:</Text>
                  <Text className='text-sm text-foreground'>{item.country}</Text>
                </View>
              </View>
            </View>
          </CollapsibleContent>
        </Collapsible>
      </View>
    ),
    [selectedPropertyId, clearSelection, setSelectedPropertyId]
  );

  const renderMyUnitCard = React.useCallback(
    ({ item, index }: { item: UnitWithProperty; index: number }) => {
      const isSelected = selectedUnit?._id === item._id;

      return (
        <View
          key={`myunit-${item._id}`}
          className={`
          rounded-xl p-3 mb-2 border
          ${isSelected ? 'bg-blue-50 border-blue-800' : 'bg-white border-gray-200'}
        `}
        >
          <View className='flex-row items-center mb-2'>
            <View
              className={`
              w-10 h-10 rounded-lg items-center justify-center mr-3
              ${isSelected ? 'bg-blue-800' : 'bg-gray-400'}
            `}
            >
              <Icon as={Home} size={20} className='text-white' />
            </View>
            <View className='flex-1'>
              <View className='flex-row items-center mb-0.5 flex-wrap'>
                <Icon as={Hash} size={14} className={`${isSelected ? 'text-blue-800' : 'text-gray-400'} mr-1.5`} />
                <Text
                  className={`
                  text-lg font-bold flex-1
                  ${isSelected ? 'text-blue-800' : 'text-gray-900'}
                `}
                >
                  Unit {item.unitNumber}
                </Text>
                {isSelected && (
                  <View className='px-2 py-1 rounded-lg ml-2 bg-blue-800'>
                    <Text className='text-xs font-bold text-white tracking-wide'>SELECTED</Text>
                  </View>
                )}
              </View>
              <Text className='text-sm text-gray-500 font-medium leading-4'>{item.property?.name || 'Property'}</Text>
            </View>
          </View>

          <View className='flex-row flex-wrap gap-2'>
            <View className='flex-row items-center flex-1'>
              <Icon as={MapPin} size={14} className={`${isSelected ? 'text-blue-400' : 'text-gray-400'} mr-1.5`} />
              <Text className='text-sm text-gray-500 font-medium flex-1 leading-4'>
                {item.property?.address || 'Address'}
              </Text>
            </View>
            {item.floor && <Text className='text-sm text-gray-500 font-medium'>Floor {item.floor}</Text>}
          </View>
        </View>
      );
    },
    [selectedUnit]
  );

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader
        title="Properties"
        subtitle="Manage your real estate portfolio"
        type="root"
        icon="business"
        rightSlot={
          <Dialog open={showUnitForm} onOpenChange={setShowUnitForm}>
            <DialogTrigger asChild>
              <Button
                className='bg-white rounded-xl px-4 py-3'
                onPress={() => {
                  setShowUnitForm(true);
                }}
                disabled={false}
              >
                <View className='flex-row items-center gap-2'>
                  <Icon as={Plus} size={18} className='text-blue-800' />
                  <Text className='text-blue-800 text-sm font-semibold'>Add Unit</Text>
                </View>
              </Button>
            </DialogTrigger>
            <DialogContent portalHost='root' className='max-w-md bg-white p-6 border-none rounded-2xl'>
              <DialogHeader className='mb-2'>
                <DialogTitle className='text-2xl font-bold text-blue-800 mb-2'>Create Unit</DialogTitle>
                <DialogDescription className='text-sm text-gray-600 leading-5'>
                  Select a property and enter your unit details to create and assign yourself to a new unit
                </DialogDescription>
              </DialogHeader>

              <ScrollView className='max-h-96' contentContainerStyle={{ paddingVertical: 4 }}>
                <View className='gap-1'>
                  <View className='gap-3'>
                    <Text className='text-base font-semibold text-blue-800'>Select Property *</Text>
                    <View className='gap-3'>
                      {allPropertiesList.map(property => (
                        <Button
                          key={property._id}
                          onPress={() => setUnitFormData(prev => ({ ...prev, propertyId: property._id }))}
                          className={`
                            ${unitFormData.propertyId === property._id ? 'bg-blue-800 border border-blue-800' : 'bg-white border border-gray-200'}
                            rounded-xl p-4 justify-start h-fit
                          `}
                        >
                          <View className='flex-row items-center gap-3'>
                            <View
                              className={`
                              w-10 h-10 rounded-lg items-center justify-center
                              ${unitFormData.propertyId === property._id ? 'bg-white/20' : 'bg-cyan-50'}
                            `}
                            >
                              <Icon
                                as={Building2}
                                size={20}
                                className={unitFormData.propertyId === property._id ? 'text-white' : 'text-blue-800'}
                              />
                            </View>
                            <View className='flex-1 mr-2'>
                              <Text
                                className={`
                                text-base font-semibold flex-1 h-full
                                ${unitFormData.propertyId === property._id ? 'text-white' : 'text-gray-900'}
                              `}
                              >
                                {property.name}
                              </Text>
                              <Text
                                className={`
                                text-sm leading-4
                                ${unitFormData.propertyId === property._id ? 'text-white/80' : 'text-gray-500'}
                              `}
                              >
                                {property.address}
                              </Text>
                            </View>
                            {unitFormData.propertyId === property._id && (
                              <Text className='text-lg text-white font-semibold'>✓</Text>
                            )}
                          </View>
                        </Button>
                      ))}
                    </View>
                  </View>

                  <Separator className='my-1' />

                  <View className='gap-2'>
                    <Text className='text-base font-semibold text-blue-800'>Unit Number *</Text>
                    <TextField
                      placeholder='e.g. 101, 2A, B12'
                      value={unitFormData.unitNumber}
                      onChangeText={text => setUnitFormData(prev => ({ ...prev, unitNumber: text }))}
                      className='border-2 border-gray-200 rounded-lg p-3 text-gray-900'
                    />
                  </View>

                  <Separator className='my-1' />

                  <View className='gap-3'>
                    <Text className='text-base font-semibold text-blue-800'>Unit Type</Text>
                    <View className='flex-row flex-wrap gap-2.5'>
                      {(['apartment', 'condo', 'house', 'office', 'retail', 'storage'] as const).map(type => (
                        <Button
                          key={type}
                          onPress={() => setUnitFormData(prev => ({ ...prev, unitType: type }))}
                          className={`
                            ${unitFormData.unitType === type ? 'bg-blue-800  border-blue-800' : 'bg-white  border-gray-200'}
                            rounded-lg px-4 py-0 flex-1 min-w-[100px] border
                          `}
                        >
                          <Text
                            className={`
                            text-sm font-semibold text-center
                            ${unitFormData.unitType === type ? 'text-white' : 'text-gray-900'}
                          `}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </Button>
                      ))}
                    </View>
                  </View>

                  <Separator className='my-1' />

                  <View className='gap-2'>
                    <Text className='text-base font-semibold text-blue-800'>Floor (optional)</Text>
                    <TextField
                      placeholder='e.g. 1, 2, Ground'
                      value={unitFormData.floor}
                      onChangeText={text => setUnitFormData(prev => ({ ...prev, floor: text }))}
                      keyboardType='numeric'
                      className='border-2 border-gray-200 rounded-lg p-3 text-gray-900'
                    />
                  </View>

                  <Separator className='my-1' />

                  <View className='flex-row gap-3'>
                    <View className='flex-1 gap-2'>
                      <Text className='text-base font-semibold text-blue-800'>Bedrooms (optional)</Text>
                      <TextField
                        placeholder='2'
                        value={unitFormData.bedrooms}
                        onChangeText={text => setUnitFormData(prev => ({ ...prev, bedrooms: text }))}
                        keyboardType='numeric'
                        className='border-2 border-gray-200 rounded-lg p-3 text-gray-900'
                      />
                    </View>
                    <View className='flex-1 gap-2'>
                      <Text className='text-base font-semibold text-blue-800'>Bathrooms (optional)</Text>
                      <TextField
                        placeholder='1.5'
                        value={unitFormData.bathrooms}
                        onChangeText={text => setUnitFormData(prev => ({ ...prev, bathrooms: text }))}
                        keyboardType='numeric'
                        className='border-2 border-gray-200 rounded-lg p-3 text-gray-900'
                      />
                    </View>
                  </View>

                  <Separator className='my-1' />

                  <View className='gap-2'>
                    <Text className='text-base font-semibold text-blue-800'>Square Footage (optional)</Text>
                    <TextField
                      placeholder='1200'
                      value={unitFormData.squareFootage}
                      onChangeText={text => setUnitFormData(prev => ({ ...prev, squareFootage: text }))}
                      keyboardType='numeric'
                      className='border-2 border-gray-200 rounded-lg p-3 text-gray-900'
                    />
                  </View>
                </View>
              </ScrollView>

              <DialogFooter className='flex-row gap-3 pt-6 border-t border-gray-100'>
                <DialogClose asChild>
                  <Button variant='outline' className='flex-1 border border-gray-300 rounded-xl py-3'>
                    <Text className='text-gray-700 font-semibold'>Cancel</Text>
                  </Button>
                </DialogClose>
                <Button onPress={handleUnitFormSubmit} className='flex-1 bg-blue-800 rounded-xl py-3'>
                  <Text className='text-white font-semibold'>Create Unit</Text>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Content */}
      <FlatList
        data={userUnits.length > 0 ? [] : properties} // Show properties if no units, otherwise show units
        keyExtractor={item => item._id?.toString() ?? ''}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 20, paddingTop: 16 }}
        className='bg-slate-50'
        ItemSeparatorComponent={() => <View className='h-2' />}
        ListHeaderComponent={() => (
          <View>
            {/* My Units Section */}
            {userUnits.length > 0 && (
              <View className='mb-8'>
                <View className='flex-row items-center mb-4'>
                  <View className='w-1 h-6 bg-blue-800 rounded-sm mr-3' />
                  <Text className='text-xl font-bold text-blue-800'>My Units</Text>
                </View>
                {userUnits.map((unit, index) => (
                  <TouchableOpacity
                    key={unit._id}
                    activeOpacity={0.7}
                    onPress={() => {
                      const newUnit = selectedUnit?._id === unit._id ? null : unit;
                      setSelectedUnit(newUnit);
                    }}
                  >
                    {renderMyUnitCard({ item: unit, index })}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View>
            {isLoading ? (
              <View className='py-16 items-center bg-white rounded-2xl mx-1'>
                <View className='w-20 h-20 rounded-[20px] bg-cyan-50 items-center justify-center mb-5'>
                  <View className='w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin' />
                </View>
                <Text className='text-xl font-bold text-blue-800 mb-2'>Loading properties...</Text>
                <Text className='text-sm text-gray-500 text-center leading-5 px-8'>
                  Please wait while we fetch your properties and units
                </Text>
              </View>
            ) : (
              userUnits.length === 0 && (
                <View className='py-16 items-center bg-white rounded-2xl mx-1'>
                  <View className='w-20 h-20 rounded-[20px] bg-cyan-50 items-center justify-center mb-5'>
                    <Icon as={Building2} size={40} className='text-blue-400' />
                  </View>
                  <Text className='text-xl font-bold text-blue-800 mb-2'>No Properties Found</Text>
                  <Text className='text-sm text-gray-500 text-center leading-5 px-8'>
                    Contact your property manager to get access to properties and start managing your real estate
                    portfolio
                  </Text>
                </View>
              )
            )}
          </View>
        )}
        renderItem={renderPropertyCard}
        ListFooterComponent={null}
      />
    </ThemedView>
  );
}
