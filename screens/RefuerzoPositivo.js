import React from 'react';
import { StyleSheet, Image, View, Text } from 'react-native';
import { ms } from '../utils/responsive';
import { colors, radius, spacing } from '../utils/theme';

const image = require('../images/muyBien.png');

// Pantalla de refuerzo positivo que se muestra unos segundos al terminar una tarea.
export default function RefuerzoPositivo() {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.badge}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.title}>¡Muy bien!</Text>
      <Text style={styles.subtitle}>Tarea terminada</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  badge: {
    width: ms(280),
    height: ms(280),
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: colors.success,
  },
  image: { width: '75%', height: '75%' },
  title: { fontSize: ms(52), fontWeight: '900', color: colors.success },
  subtitle: { fontSize: ms(24), fontWeight: '700', color: colors.text },
});
