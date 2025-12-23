import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  dueDate: string;
  account: string;
  icon: string;
  iconColor: string;
  isIncome?: boolean;
}

const RecurringScreen: React.FC = () => {
  const router = useRouter();

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    border: '#404348',
  };

  // Sample recurring expenses data
  const recurringData: RecurringExpense[] = [
    {
      id: '1',
      name: 'Netflix Subscription',
      amount: 15.99,
      frequency: 'Monthly',
      dueDate: 'Due Oct 15',
      account: 'Chase',
      icon: 'play.rectangle.fill',
      iconColor: '#E50914',
    },
    {
      id: '2',
      name: 'Gym Membership',
      amount: 25.00,
      frequency: 'Bi-Weekly',
      dueDate: 'Due Oct 20',
      account: 'Debit',
      icon: 'figure.strengthtraining.traditional',
      iconColor: '#FF8A4A',
    },
    {
      id: '3',
      name: 'Apartment Rent',
      amount: 1200.00,
      frequency: 'Monthly',
      dueDate: 'Due Nov 01',
      account: 'Checking',
      icon: 'house.fill',
      iconColor: '#4A9EFF',
    },
    {
      id: '4',
      name: 'Spotify',
      amount: 9.99,
      frequency: 'Monthly',
      dueDate: 'Due Nov 05',
      account: 'PayPal',
      icon: 'music.note',
      iconColor: '#1DB954',
    },
    {
      id: '5',
      name: 'Salary',
      amount: 3200.00,
      frequency: 'Bi-Weekly',
      dueDate: 'Due Nov 15',
      account: 'Main',
      icon: 'dollarsign.circle.fill',
      iconColor: '#2ECC71',
      isIncome: true,
    },
    {
      id: '6',
      name: 'Internet Bill',
      amount: 85.00,
      frequency: 'Monthly',
      dueDate: 'Due Nov 18',
      account: 'Amex',
      icon: 'wifi',
      iconColor: '#9B59B6',
    },
  ];

  // Total from design

  const handleBack = () => {
    router.back();
  };

  const handleAddRecurring = () => {
    router.push('/add-recurring' as any);
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={20} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recurring</Text>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
          Total: $1,424.00
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddRecurring}>
        <IconSymbol name="plus" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: colors.primaryBlue }]}>
      <View style={styles.summaryContent}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>NEXT 7 DAYS</Text>
          <Text style={styles.summaryAmount}>$40.99</Text>
          <View style={styles.billsNotification}>
            <IconSymbol name="bell.fill" size={12} color="#FFFFFF" />
            <Text style={styles.billsText}>2 bills due soon</Text>
          </View>
        </View>
        <View style={[styles.calendarIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <IconSymbol name="calendar" size={20} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );

  const renderRecurringItem = ({ item }: { item: RecurringExpense }) => (
    <View style={[styles.recurringCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          <View style={[styles.itemIcon, { backgroundColor: item.iconColor + '20' }]}>
            <IconSymbol name={item.icon as any} size={20} color={item.iconColor} />
          </View>
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.itemMeta}>
              <Text style={[styles.itemFrequency, { color: colors.subText }]}>
                {item.frequency}
              </Text>
              <Text style={[styles.metaDot, { color: colors.subText }]}>•</Text>
              <View style={styles.accountContainer}>
                <IconSymbol 
                  name={
                    item.account === 'PayPal' ? 'p.circle.fill' : 
                    item.account === 'Amex' ? 'creditcard.fill' :
                    item.account === 'Chase' ? 'minus.circle.fill' :
                    item.account === 'Checking' ? 'building.columns.fill' :
                    item.account === 'Main' ? 'building.columns.fill' :
                    'creditcard.fill'
                  } 
                  size={12} 
                  color={colors.subText} 
                />
                <Text style={[styles.itemAccount, { color: colors.subText }]}>{item.account}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={[
            styles.itemAmount, 
            { color: item.isIncome ? colors.green : colors.text }
          ]}>
            {item.isIncome ? '+' : ''}${item.amount.toFixed(2)}
          </Text>
          <Text style={[styles.itemDue, { color: colors.subText }]}>{item.dueDate}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <FlatList
        data={recurringData}
        renderItem={renderRecurringItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View>
            {renderHeader()}
            {renderSummaryCard()}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primaryBlue }]}
        onPress={handleAddRecurring}
      >
        <IconSymbol name="plus" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  billsNotification: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billsText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  calendarIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recurringCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemFrequency: {
    fontSize: 14,
  },
  metaDot: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAccount: {
    fontSize: 14,
    marginLeft: 4,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDue: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default RecurringScreen;
