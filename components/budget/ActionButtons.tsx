import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  onAddRecurring: () => void;
  onAddExpense: () => void;
  colors: {
    text: string;
    primaryBlue: string;
    border: string;
  };
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAddRecurring,
  onAddExpense,
  colors,
}) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
        onPress={onAddRecurring}
      >
        <IconSymbol name="arrow.triangle.2.circlepath" size={16} color={colors.text} />
        <Text style={[styles.actionButtonText, { color: colors.text }]}>Add Recurring</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primaryBlue }]}
        onPress={onAddExpense}
      >
        <IconSymbol name="plus" size={16} color="#FFFFFF" />
        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButton: {
    // backgroundColor set via style prop
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
