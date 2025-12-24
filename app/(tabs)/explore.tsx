import { DatabaseBackupModal } from '@/components/DatabaseBackupModal';
import { ExpenseExportModal } from '@/components/ExpenseExportModal';
import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SettingsItem {
  id: string;
  title: string;
  value?: string;
  icon: string;
  iconColor: string;
  hasToggle?: boolean;
  isEnabled?: boolean;
}

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

export default function MoreScreen() {
  const router = useRouter();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
  
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

  const sections: SettingsSection[] = [
    {
      id: 'transactions',
      title: 'TRANSACTION & GENERAL',
      items: [
        {
          id: 'currency',
          title: 'Currency',
          value: 'USD $',
          icon: 'dollarsign.circle',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'monthly_start',
          title: 'Monthly Start Date',
          value: '1st',
          icon: 'calendar',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'budget_carryover',
          title: 'Budget Carry-over',
          icon: 'chart.line.uptrend.xyaxis',
          iconColor: colors.primaryBlue,
          hasToggle: true,
          isEnabled: true,
        },
        {
          id: 'default_account',
          title: 'Default Account',
          value: 'Cash',
          icon: 'creditcard',
          iconColor: colors.primaryBlue,
        },
      ],
    },
    {
      id: 'management',
      title: 'MANAGEMENT',
      items: [
        {
          id: 'categories',
          title: 'Categories',
          icon: 'folder',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'recurring_manager',
          title: 'Recurring Manager',
          icon: 'arrow.clockwise',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'accounts',
          title: 'Accounts',
          icon: 'building.columns',
          iconColor: colors.primaryBlue,
        },
      ],
    },
    {
      id: 'data_security',
      title: 'DATA & SECURITY',
      items: [
        {
          id: 'app_lock',
          title: 'App Lock',
          value: 'FaceID',
          icon: 'lock',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'backup_restore',
          title: 'Backup & Restore',
          value: 'Last: Today',
          icon: 'icloud',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'export_data',
          title: 'Export Data',
          icon: 'square.and.arrow.up',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'import_backup',
          title: 'Database Backup',
          icon: 'server.rack',
          iconColor: '#9B59B6',
        },
      ],
    },
    {
      id: 'app_info',
      title: 'APP INFO',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          value: 'Dark',
          icon: 'moon',
          iconColor: colors.primaryBlue,
        },
        {
          id: 'about',
          title: 'About',
          icon: 'info.circle',
          iconColor: colors.primaryBlue,
        },
      ],
    },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
    </View>
  );

  const renderPremiumCard = () => (
    <View style={[styles.premiumCard, { backgroundColor: colors.premiumBlue }]}>
      <View style={styles.premiumIcon}>
        <IconSymbol name="star.fill" size={20} color="#FFFFFF" />
      </View>
      
      <View style={styles.premiumContent}>
        <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
        <Text style={styles.premiumSubtitle}>
          Unlock Cloud Sync, Unlimited Budgets, and AI insights.
        </Text>
        
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={() => router.push('/premium')}
        >
          <Text style={styles.premiumButtonText}>Go Pro</Text>
          <IconSymbol name="arrow.right" size={16} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOnboardingCard = () => (
    <View style={[styles.premiumCard, { backgroundColor: '#2A2D32' }]}>
      <View style={styles.premiumIcon}>
        <IconSymbol name="graduationcap.fill" size={20} color={colors.primaryBlue} />
      </View>
      
      <View style={styles.premiumContent}>
        <Text style={styles.premiumTitle}>Try Onboarding Flow</Text>
        <Text style={styles.premiumSubtitle}>
          Experience the complete onboarding process with all 6 screens.
        </Text>
        
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={() => router.push('/onboarding/welcome')}
        >
          <Text style={styles.premiumButtonText}>Start Onboarding</Text>
          <IconSymbol name="arrow.right" size={16} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderToggle = (isEnabled: boolean) => (
    <View style={[
      styles.toggle,
      { backgroundColor: isEnabled ? colors.primaryBlue : colors.border }
    ]}>
      <View style={[
        styles.toggleKnob,
        {
          backgroundColor: '#FFFFFF',
          transform: [{ translateX: isEnabled ? 20 : 2 }]
        }
      ]} />
    </View>
  );

  const renderSettingsItem = (item: SettingsItem) => {
    const handlePress = () => {
      if (item.id === 'export_data') {
        setIsExportModalVisible(true);
      } else if (item.id === 'import_backup') {
        setIsBackupModalVisible(true);
      }
      // Add other navigation logic here as needed
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingsItem, { borderBottomColor: colors.border }]}
        onPress={handlePress}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.itemIcon, { backgroundColor: item.iconColor + '20' }]}>
            <IconSymbol 
              name={item.icon as any} 
              size={20} 
              color={item.iconColor} 
            />
          </View>
          <Text style={[styles.itemTitle, { color: colors.text }]}>
            {item.title}
          </Text>
        </View>
        
        <View style={styles.itemRight}>
          {item.hasToggle ? (
            renderToggle(item.isEnabled || false)
          ) : (
            <>
              {item.value && (
                <Text style={[styles.itemValue, { color: colors.subText }]}>
                  {item.value}
                </Text>
              )}
              <IconSymbol name="chevron.right" size={16} color={colors.subText} />
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingsSection) => (
    <View key={section.id} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.sectionHeader }]}>
        {section.title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.cardBackground }]}>
        {section.items.map(renderSettingsItem)}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: colors.subText }]}>
        Version 2.4.0 (Build 302)
      </Text>
      <View style={styles.footerMade}>
        <Text style={[styles.footerText, { color: colors.subText }]}>
          Made with 
        </Text>
        <IconSymbol name="heart.fill" size={12} color="#E74C3C" />
        <Text style={[styles.footerText, { color: colors.subText }]}>
          {' '}by BudgetApp
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
          showsVerticalScrollIndicator={false}
        >
          {renderPremiumCard()}
          {renderOnboardingCard()}
          
          {sections.map(renderSection)}
          
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
