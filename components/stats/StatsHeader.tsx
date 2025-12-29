import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StatsHeaderProps {
  colors: Record<string, string>;
  onBackPress: () => void;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ colors, onBackPress }) => {
  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        Statistics
      </Text>
      <TouchableOpacity style={styles.infoButton}>
        <IconSymbol name="eye" size={24} color={colors.primaryBlue} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
});

export default StatsHeader;
