import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-transaction" options={{ headerShown: false }} />
        <Stack.Screen name="premium" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/money-management" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/add-accounts" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/create-budget" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/add-recurring" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/complete" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
