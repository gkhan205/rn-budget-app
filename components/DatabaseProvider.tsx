import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

/**
 * DatabaseProvider component
 * TODO: Update for SQLite implementation
 * Currently shows a placeholder message since database is not implemented
 */
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const { isInitialized, error } = useDatabase();

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Database Setup Required</Text>
        <Text style={styles.errorMessage}>
          SQLite database implementation needed.
        </Text>
        <Text style={styles.errorDetails}>
          The app will work with limited functionality until SQLite is set up.
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Setting up database...</Text>
      </View>
    );
  }

  // TODO: Remove this message when SQLite is implemented
  console.log('DatabaseProvider: Database not implemented yet - using placeholder');
  
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default DatabaseProvider;
