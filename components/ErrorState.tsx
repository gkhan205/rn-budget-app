import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  colors: {
    text: string;
    primaryBlue: string;
  };
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  colors,
}) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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

export default ErrorState;
