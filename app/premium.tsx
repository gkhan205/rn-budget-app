import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  savings?: string;
  isRecommended?: boolean;
  isSelected?: boolean;
}

export default function PremiumScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    checkBlue: '#4A9EFF',
    border: '#404348',
    recommendedBlue: '#4A9EFF',
  };

  const features = [
    'Unlimited budgets & accounts',
    'Recurring expenses & reminders',
    'Cloud backup & multi-device sync',
    'CSV/Excel data export',
    'Unlimited transaction history',
    'Custom categories & icons',
    'Advanced insights & graphs',
  ];

  const plans: PricingPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$4.99',
      period: '/ mo',
      isSelected: selectedPlan === 'monthly',
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$39.99',
      period: '/ yr',
      savings: 'Save 33%',
      isRecommended: true,
      isSelected: selectedPlan === 'yearly',
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '$99.99',
      period: 'one-time',
      isSelected: selectedPlan === 'lifetime',
    },
  ];

  const handleClose = () => {
    router.back();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <IconSymbol name="xmark" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.proText, { color: colors.subText }]}>PRO</Text>
    </View>
  );

  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      <View style={[styles.heroIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
        <View style={[styles.heroIconInner, { backgroundColor: colors.primaryBlue }]}>
          <IconSymbol name="star.fill" size={24} color="#FFFFFF" />
        </View>
      </View>
      
      <Text style={[styles.heroTitle, { color: colors.text }]}>Premium Upgrade</Text>
      <Text style={[styles.heroSubtitle, { color: colors.subText }]}>
        Unlock the full budgeting experience with unlimited access.
      </Text>
    </View>
  );

  const renderFeaturesList = () => (
    <View style={[styles.featuresContainer, { backgroundColor: colors.cardBackground }]}>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <View style={[styles.checkIcon, { backgroundColor: colors.checkBlue }]}>
            <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
          </View>
          <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
        </View>
      ))}
    </View>
  );

  const renderPricingCard = (plan: PricingPlan) => {
    const isSelected = plan.isSelected;
    const cardStyle = [
      styles.pricingCard,
      { 
        backgroundColor: colors.cardBackground,
        borderColor: isSelected ? colors.primaryBlue : colors.border,
        borderWidth: isSelected ? 2 : 1,
      }
    ];

    return (
      <TouchableOpacity
        key={plan.id}
        style={cardStyle}
        onPress={() => setSelectedPlan(plan.id)}
      >
        {plan.isRecommended && (
          <View style={[styles.recommendedBadge, { backgroundColor: colors.recommendedBlue }]}>
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        )}
        
        <View style={styles.pricingHeader}>
          <View style={styles.pricingLeft}>
            <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.planPrice, { color: colors.text }]}>{plan.price}</Text>
              <Text style={[styles.planPeriod, { color: colors.subText }]}> {plan.period}</Text>
            </View>
            {plan.savings && (
              <Text style={[styles.savings, { color: colors.primaryBlue }]}>{plan.savings}</Text>
            )}
          </View>
          
          <View style={[
            styles.radioButton,
            { 
              borderColor: isSelected ? colors.primaryBlue : colors.border,
              backgroundColor: isSelected ? colors.primaryBlue : 'transparent',
            }
          ]}>
            {isSelected && (
              <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSubscribeSection = () => (
    <View style={styles.subscribeSection}>
      <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: colors.primaryBlue }]}>
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.restoreButton}>
        <Text style={[styles.restoreButtonText, { color: colors.subText }]}>
          Restore Purchases
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.footerLinks}>
        <TouchableOpacity>
          <Text style={[styles.footerLink, { color: colors.subText }]}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={[styles.footerLink, { color: colors.subText }]}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeroSection()}
          {renderFeaturesList()}
          
          <View style={styles.pricingSection}>
            {plans.map(renderPricingCard)}
          </View>
          
          {renderSubscribeSection()}
          {renderFooter()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroIconInner: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pricingCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLeft: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: '500',
  },
  savings: {
    fontSize: 14,
    fontWeight: '600',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  subscribeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
});
