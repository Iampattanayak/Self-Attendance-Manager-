import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from './contexts/DataContext';
import { useTheme } from './contexts/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { settings, loading } = useData();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading) {
      if (settings?.isOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [loading, settings]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
