import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="transactions"
        options={{
          title: 'Transactions',
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          title: 'Stats',
        }}
      />
      <Stack.Screen
        name="accounts"
        options={{
          title: 'Accounts',
        }}
      />
      <Stack.Screen
        name="explore"
        options={{
          title: 'Settings',
        }}
      />
    </Stack>
  );
}
