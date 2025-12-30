import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MonthStartPickerProps {
  selectedDate: number;
  options: { value: number; label: string }[];
  onSelect: (date: number) => void;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
  };
}

export const MonthStartPicker: React.FC<MonthStartPickerProps> = ({
  selectedDate,
  options,
  onSelect,
  colors,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === selectedDate
  );

  const handleSelect = (date: number) => {
    onSelect(date);
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Date Selector Button */}
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsModalVisible(true)}>
        <View style={styles.selectorContent}>
          <View style={styles.dateInfo}>
            <View
              style={[
                styles.dateIcon,
                { backgroundColor: colors.primaryBlue + '20' },
              ]}>
              <IconSymbol
                name='calendar'
                size={16}
                color={colors.primaryBlue}
              />
            </View>
            <View style={styles.dateDetails}>
              <Text style={[styles.dateName, { color: colors.text }]}>
                {selectedOption?.label} of every month
              </Text>
              <Text style={[styles.dateDescription, { color: colors.subText }]}>
                Budget periods will start on this date
              </Text>
            </View>
          </View>
          <IconSymbol name='chevron.right' size={16} color={colors.subText} />
        </View>
      </TouchableOpacity>

      {/* Date Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setIsModalVisible(false)}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}>
          {/* Modal Header */}
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <IconSymbol name='xmark' size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Monthly Start Date
            </Text>
            <View style={styles.closeButton} />
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: colors.subText }]}>
              Choose the day of the month when your budget periods begin. For
              example, if you select the 15th, your monthly budgets will run
              from the 15th of one month to the 14th of the next month.
            </Text>
          </View>

          {/* Date List */}
          <ScrollView
            style={styles.dateList}
            showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.dateItem, { borderBottomColor: colors.border }]}
                onPress={() => handleSelect(option.value)}>
                <View style={styles.dateItemContent}>
                  <View style={styles.dateItemInfo}>
                    <Text
                      style={[styles.dateItemLabel, { color: colors.text }]}>
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateItemSubtext,
                        { color: colors.subText },
                      ]}>
                      {option.value === 1
                        ? 'First day of the month'
                        : option.value === 15
                        ? 'Mid-month start'
                        : `${option.label} of every month`}
                    </Text>
                  </View>
                  {selectedDate === option.value && (
                    <IconSymbol
                      name='checkmark'
                      size={16}
                      color={colors.primaryBlue}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    borderRadius: 12,
    // borderWidth: 1,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateDetails: {
    flex: 1,
  },
  dateName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateDescription: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  dateList: {
    flex: 1,
  },
  dateItem: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  dateItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  dateItemInfo: {
    flex: 1,
  },
  dateItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateItemSubtext: {
    fontSize: 14,
  },
});
