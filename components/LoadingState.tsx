import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingStateProps {
  colors: {
    primaryBlue: string;
    subText: string;
  };
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  colors,
  message = 'Loading...',
}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primaryBlue} />
      <Text style={[styles.loadingText, { color: colors.subText }]}>
        {message}
      </Text>
    </View>
  );
};

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
});

export default LoadingState;
