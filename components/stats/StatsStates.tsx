import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LoadingStateProps {
  colors: Record<string, string>;
}

interface ErrorStateProps {
  colors: Record<string, string>;
  error: string;
  onRetry: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ colors }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primaryBlue} />
    <Text style={[styles.loadingText, { color: colors.subText }]}>
      Loading statistics...
    </Text>
  </View>
);

export const ErrorState: React.FC<ErrorStateProps> = ({ colors, error, onRetry }) => (
  <View style={styles.errorContainer}>
    <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.red} />
    <Text style={[styles.errorTitle, { color: colors.text }]}>
      Unable to Load Statistics
    </Text>
    <Text style={[styles.errorMessage, { color: colors.subText }]}>
      {error}
    </Text>
    <TouchableOpacity 
      style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
      onPress={onRetry}
    >
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
