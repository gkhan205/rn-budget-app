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

export default function OnboardingWelcomeScreen() {
  const router = useRouter();

  const colors = {
    background: '#1A1B1F',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    illustrationBg: '#2A2D32',
  };

  const handleGetStarted = () => {
    // Navigate to next onboarding step
    router.push('/onboarding/money-management');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Illustration Section */}
          <View style={styles.illustrationContainer}>
            <View style={[styles.illustrationBg, { backgroundColor: colors.illustrationBg }]}>
              <View style={styles.illustrationGrid}>
                {/* Create abstract geometric shapes representing budget/finance visualization */}
                <View style={[styles.illustrationCard, { backgroundColor: colors.primaryBlue }]} />
                <View style={[styles.illustrationCard, { backgroundColor: colors.primaryBlue, opacity: 0.7 }]} />
                <View style={[styles.illustrationCard, { backgroundColor: colors.primaryBlue, opacity: 0.5 }]} />
                <View style={[styles.illustrationCard, { backgroundColor: colors.primaryBlue, opacity: 0.3 }]} />
                <View style={[styles.illustrationCard, { backgroundColor: colors.primaryBlue, opacity: 0.6 }]} />
                <View style={[styles.illustrationCard, { backgroundColor: colors.primaryBlue, opacity: 0.4 }]} />
              </View>
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={[styles.headline, { color: colors.text }]}>
              Plan better.{'\n'}Spend smarter.{'\n'}
              <Text style={{ color: colors.primaryBlue }}>Always offline.</Text>
            </Text>
            
            <Text style={[styles.supportingText, { color: colors.subText }]}>
              Secure, private, and powerful budgeting that works even without an internet connection.
            </Text>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primaryBlue }]}
            onPress={handleGetStarted}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 300,
  },
  illustrationBg: {
    width: 200,
    height: 200,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  illustrationCard: {
    width: '45%',
    height: '30%',
    borderRadius: 8,
    marginBottom: 8,
  },
  textContent: {
    marginVertical: 40,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportingText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
