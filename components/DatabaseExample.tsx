import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Example component demonstrating database operations
 * TODO: Update for SQLite implementation
 * Currently shows placeholder functionality
 */
export const DatabaseExample: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([]);

  // Load budgets when component mounts
  const loadBudgets = useCallback(async () => {
    try {
      // TODO: Replace with SQLite implementation
      console.log('TODO: Load budgets from SQLite database');
      setBudgets([
        // Placeholder data
        {
          id: '1',
          name: 'Sample Budget (Placeholder)',
          icon: '💰',
          amount: 1000,
          isArchived: false
        }
      ]);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      Alert.alert('Info', 'Database not implemented yet. SQLite setup needed.');
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const createSampleBudget = async () => {
    Alert.alert('Info', 'Database operations not implemented yet. SQLite setup needed.');
  };

  const archiveBudget = async (budget: any) => {
    Alert.alert('Info', 'Database operations not implemented yet. SQLite setup needed.');
  };

  const deleteBudget = async (budget: any) => {
    Alert.alert(
      'Info',
      'Database operations not implemented yet. SQLite setup needed.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Example (Placeholder)</Text>
      <Text style={styles.subtitle}>Total budgets: {budgets.length}</Text>
      
      <TouchableOpacity style={styles.button} onPress={createSampleBudget}>
        <Text style={styles.buttonText}>Create Sample Budget (TODO)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={loadBudgets}>
        <Text style={styles.buttonText}>Refresh (TODO)</Text>
      </TouchableOpacity>

      <View style={styles.budgetList}>
        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budgetItem}>
            <Text style={styles.budgetName}>
              {budget.icon} {budget.name}
            </Text>
            <Text style={styles.budgetDetails}>
              TODO: SQLite implementation needed
            </Text>
            <View style={styles.budgetActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.archiveButton]}
                onPress={() => archiveBudget(budget)}
              >
                <Text style={styles.actionButtonText}>Archive (TODO)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteBudget(budget)}
              >
                <Text style={styles.actionButtonText}>Delete (TODO)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Database Status</Text>
          <Text style={styles.infoText}>
            ✅ Realm has been completely removed{'\n'}
            🔄 SQLite implementation needed{'\n'}
            🚀 App compiles without Realm dependencies
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  budgetList: {
    marginTop: 20,
  },
  budgetItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  budgetDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  budgetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  archiveButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default DatabaseExample;
