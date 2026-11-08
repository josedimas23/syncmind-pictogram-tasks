import React from 'react';
import { StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import logo from '../images/Logo-sinFondo.png';
import { ms } from '../utils/responsive';
import { colors, spacing } from '../utils/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={logo} resizeMode="contain" accessibilityLabel="SyncMind" />
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  logo: { width: ms(260), height: ms(260) },
});
