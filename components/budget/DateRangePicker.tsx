import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DateRangePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
  };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isVisible,
  onClose,
  onDateRangeSelect,
  initialStartDate,
  initialEndDate,
  colors,
}) => {
  const [currentStep, setCurrentStep] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState(initialStartDate || new Date());
  const [endDate, setEndDate] = useState(initialEndDate || new Date());

  const handleNext = () => {
    if (currentStep === 'start') {
      setCurrentStep('end');
      // Set end date to start date if it's before start date
      if (endDate <= startDate) {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setEndDate(nextDay);
      }
    } else {
      onDateRangeSelect(startDate, endDate);
      onClose();
      setCurrentStep('start');
    }
  };

  const handleCancel = () => {
    onClose();
    setCurrentStep('start');
    // Reset to initial values
    if (initialStartDate) setStartDate(initialStartDate);
    if (initialEndDate) setEndDate(initialEndDate);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={[styles.cancelButton, { color: colors.primaryBlue }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Select {currentStep === 'start' ? 'Start' : 'End'} Date
          </Text>
          <TouchableOpacity onPress={handleNext}>
            <Text style={[styles.saveButton, { color: colors.primaryBlue }]}>
              {currentStep === 'start' ? 'Next' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <View style={styles.content}>
          <View style={[styles.datePickerContainer, { backgroundColor: colors.cardBackground }]}>
            <DateTimePicker
              value={currentStep === 'start' ? startDate : endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  if (currentStep === 'start') {
                    setStartDate(selectedDate);
                  } else {
                    setEndDate(selectedDate);
                  }
                }
              }}
              minimumDate={currentStep === 'end' ? startDate : undefined}
              style={[styles.datePicker]}
              textColor={colors.text}
              accentColor={colors.primaryBlue}
              themeVariant="dark"
            />
          </View>

          {/* Range Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Selected Range</Text>
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, { color: colors.subText }]}>From:</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {startDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, { color: colors.subText }]}>To:</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {endDate.toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.durationText, { color: colors.subText }]}>
              Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  datePicker: {
    alignSelf: 'center',
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 250,
    backgroundColor: 'transparent',
  },
  datePickerContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryCard: {
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
