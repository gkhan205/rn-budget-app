import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingCompleteScreen() {
  const router = useRouter();

  const colors = {
    background: '#1A1B1F',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    successGreen: '#00C851',
  };

  const handleGoToDashboard = () => {
    // Mark onboarding as complete and navigate to main app
    // This would typically:
    // 1. Store onboarding completion flag
    // 2. Create the budget, accounts, and recurring items
    // 3. Navigate to the main budgets screen
    router.push('/(tabs)'); // Navigate to main app tabs
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.successGreen }]}>
              <IconSymbol name="checkmark" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: colors.text }]}>
              You&apos;re all set!
            </Text>
            
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              Your budget is ready. Start tracking your spending and stay on top of your finances with complete privacy and offline access.
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="shield.fill" size={16} color={colors.primaryBlue} />
              <Text style={[styles.featureText, { color: colors.subText }]}>
                100% Private & Secure
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconSymbol name="wifi.slash" size={16} color={colors.primaryBlue} />
              <Text style={[styles.featureText, { color: colors.subText }]}>
                Works Completely Offline
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={16} color={colors.primaryBlue} />
              <Text style={[styles.featureText, { color: colors.subText }]}>
                Smart Budget Tracking
              </Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primaryBlue }]}
            onPress={handleGoToDashboard}
          >
            <Text style={styles.ctaButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    marginBottom: 48,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresList: {
    marginBottom: 48,
    gap: 16,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
