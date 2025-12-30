import { DatabaseBackupModal } from '@/components/DatabaseBackupModal';
import { ExpenseExportModal } from '@/components/ExpenseExportModal';
import MainLayout from '@/components/MainLayout';
import { CurrencySelector, MonthStartPicker } from '@/components/settings';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/hooks/useSettings';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MoreScreen() {
  const router = useRouter();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);

  // Settings hook for managing settings state
  const {
    currentCurrency,
    monthStartDate,
    updateCurrency,
    updateMonthStartDate,
    availableCurrencies,
    monthStartOptions,
    isInitialized,
  } = useSettings();

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    premiumBlue: '#4A9EFF',
    border: '#404348',
    sectionHeader: '#9BA1A6',
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
    </View>
  );

  // Render the Management section with navigation buttons
  const renderManagementSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.sectionHeader }]}>
        MANAGEMENT
      </Text>
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: colors.cardBackground },
        ]}>
        {/* Categories are hidden as requested */}

        {/* Recurring Expenses Button */}
        <TouchableOpacity
          style={[styles.settingsItem, { borderBottomColor: colors.border }]}
          onPress={() => router.push('/recurring')}>
          <View style={styles.itemLeft}>
            <View
              style={[
                styles.itemIcon,
                { backgroundColor: colors.primaryBlue + '20' },
              ]}>
              <IconSymbol
                name='arrow.clockwise'
                size={20}
                color={colors.primaryBlue}
              />
            </View>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Recurring Expenses
            </Text>
          </View>
          <View style={styles.itemRight}>
            <IconSymbol name='chevron.right' size={16} color={colors.subText} />
          </View>
        </TouchableOpacity>

        {/* Accounts Button */}
        <TouchableOpacity
          style={[styles.settingsItem, { borderBottomWidth: 0 }]}
          onPress={() => router.push('/(tabs)/accounts')}>
          <View style={styles.itemLeft}>
            <View
              style={[
                styles.itemIcon,
                { backgroundColor: colors.primaryBlue + '20' },
              ]}>
              <IconSymbol
                name='building.columns'
                size={20}
                color={colors.primaryBlue}
              />
            </View>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Accounts
            </Text>
          </View>
          <View style={styles.itemRight}>
            <IconSymbol name='chevron.right' size={16} color={colors.subText} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render the Transaction & General section with functional components
  const renderTransactionGeneralSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.sectionHeader }]}>
        TRANSACTION & GENERAL
      </Text>
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: colors.cardBackground },
        ]}>
        {/* Currency Selector */}
        <CurrencySelector
          selectedCurrency={currentCurrency}
          currencies={availableCurrencies}
          onSelect={updateCurrency}
          colors={colors}
        />

        {/* Month Start Date Picker */}
        <View
          style={{
            marginTop: 1,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
          <MonthStartPicker
            selectedDate={monthStartDate}
            options={monthStartOptions}
            onSelect={updateMonthStartDate}
            colors={colors}
          />
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: colors.subText }]}>
        Version 1.0.0
      </Text>
      <View style={styles.footerMade}>
        <Text style={[styles.footerText, { color: colors.subText }]}>
          Made with{' '}
        </Text>
        <IconSymbol name='heart.fill' size={12} color='#E74C3C' />
        <Text style={[styles.footerText, { color: colors.subText }]}>
          {' '}
          by Ghazi Khan
        </Text>
      </View>
    </View>
  );

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* {renderPremiumCard()} */}
          {/* {renderOnboardingCard()} */}

          {/* Transaction & General Section - Functional */}
          {isInitialized && renderTransactionGeneralSection()}

          {/* Management Section - Custom Components */}
          {renderManagementSection()}

          {/* Other sections */}
          {/* {renderSection(dataSecuritySection)} */}
          {/* {renderSection(appInfoSection)} */}

          {renderFooter()}
        </ScrollView>

        <ExpenseExportModal
          visible={isExportModalVisible}
          onClose={() => setIsExportModalVisible(false)}
        />

        <DatabaseBackupModal
          visible={isBackupModalVisible}
          onClose={() => setIsBackupModalVisible(false)}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1B1F',
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  sectionContent: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 16,
    marginRight: 8,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerMade: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
