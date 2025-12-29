import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OptionCardProps {
  icon: string;
  iconColor: string;
  iconBackgroundColor: string;
  title: string;
  subtitle: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  children?: React.ReactNode;
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
  };
}

export const OptionCard: React.FC<OptionCardProps> = ({
  icon,
  iconColor,
  iconBackgroundColor,
  title,
  subtitle,
  rightElement,
  onPress,
  children,
  colors,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.optionCard, { backgroundColor: colors.cardBackground }]}>
      <CardWrapper
        style={styles.optionHeader}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.optionInfo}>
          <View style={[styles.optionIcon, { backgroundColor: iconBackgroundColor }]}>
            <IconSymbol name={icon as any} size={16} color={iconColor} />
          </View>
          <View style={styles.optionDetails}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subText }]}>
              {subtitle}
            </Text>
          </View>
        </View>
        {rightElement}
      </CardWrapper>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  optionCard: {
    borderRadius: 12,
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
});
