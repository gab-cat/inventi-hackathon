import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Modal, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  data: DropdownItem[];
  disabled?: boolean;
}

interface SelectTriggerProps {
  children?: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

interface SelectContentProps {
  portalHost?: string;
  className?: string;
  children?: React.ReactNode;
}

interface SelectGroupProps {
  children?: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  label: string;
  children?: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onValueChange,
  placeholder = 'Select an option',
  className,
  data,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const selectedItem = data.find(item => item.value === value);

  const handleSelect = (item: DropdownItem) => {
    onValueChange?.(item.value);
    setIsVisible(false);
  };

  const renderItem = ({ item }: { item: DropdownItem }) => (
    <TouchableOpacity
      style={[styles.item, item.value === value && styles.selectedItem]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.itemText, item.value === value && styles.selectedItemText]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.disabled]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.text, !selectedItem && styles.placeholderText]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Icon as={ChevronDown} size={16} className='text-gray-500' />
      </TouchableOpacity>

      <Modal visible={isVisible} transparent={true} animationType='fade' onRequestClose={() => setIsVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setIsVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              keyExtractor={item => item.value}
              renderItem={renderItem}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  // This is now handled by the Dropdown component above
  return <>{children}</>;
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  // This is now handled by the Dropdown component above
  return null;
};

export const SelectContent: React.FC<SelectContentProps> = ({ children, portalHost, className }) => {
  // This is now handled by the Dropdown component above
  return null;
};

export const SelectGroup: React.FC<SelectGroupProps> = ({ children }) => {
  // This is now handled by the Dropdown component above
  return null;
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, label, children }) => {
  // This is now handled by the Dropdown component above
  return null;
};

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#6b7280',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  list: {
    maxHeight: 200,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedItem: {
    backgroundColor: '#eff6ff',
  },
  itemText: {
    fontSize: 14,
    color: '#111827',
  },
  selectedItemText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
