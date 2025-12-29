import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from './icon-symbol';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue?: string | null;
  placeholder: string;
  onSelect: (value: string | null) => void;
  style?: any;
  textStyle?: any;
  iconColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  modalBackgroundColor?: string;
  modalContentColor?: string;
  selectedColor?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  placeholder,
  onSelect,
  style,
  textStyle,
  iconColor = '#9BA1A6',
  backgroundColor = '#2A2D32',
  borderColor = '#404348',
  textColor = '#FFFFFF',
  modalBackgroundColor = 'rgba(0, 0, 0, 0.5)',
  modalContentColor = '#1A1B1F',
  selectedColor = '#4A9EFF',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        { borderBottomColor: borderColor },
        item.value === selectedValue && { backgroundColor: selectedColor + '20' }
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={[
        styles.optionText,
        { color: textColor },
        item.value === selectedValue && { color: selectedColor }
      ]}>
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <IconSymbol name="checkmark" size={18} color={selectedColor} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdown,
          { backgroundColor, borderColor },
          style
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.dropdownText, { color: textColor }, textStyle]}>
          {displayText}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: modalBackgroundColor }]}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: modalContentColor }]}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Select {placeholder}
                </Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <IconSymbol name="xmark" size={24} color={iconColor} />
                </TouchableOpacity>
              </View>

              {/* Clear option */}
              {selectedValue && (
                <TouchableOpacity
                  style={[styles.option, { borderBottomColor: borderColor }]}
                  onPress={handleClear}
                >
                  <Text style={[styles.optionText, { color: iconColor }]}>
                    Clear Selection
                  </Text>
                  <IconSymbol name="xmark.circle" size={18} color={iconColor} />
                </TouchableOpacity>
              )}

              <FlatList
                data={options}
                renderItem={renderOption}
                keyExtractor={(item) => item.value}
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});

export default Dropdown;
