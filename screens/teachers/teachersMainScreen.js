import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { ms } from '../../utils/responsive';
import { colors, font, radius, spacing } from '../../utils/theme';
import { Card, HeaderButton, Screen, Subtitle, Title } from '../../componentes/ui';

const sections = [
  { route: 'UsersManagement', icon: 'people', title: 'Alumnos', text: 'Altas, fotos, preferencias y progreso' },
  { route: 'ShowTasks', icon: 'list', title: 'Tareas', text: 'Crea y edita tareas de cada tipo' },
  { route: 'TaskAssignment', icon: 'calendar', title: 'Asignar tareas', text: 'Asigna una tarea a un alumno con fecha límite' },
];

export default function TeachersMainScreen({ navigation }) {
  useEffect(() => {
    navigation.setOptions({
      title: 'Panel del profesorado',
      headerRight: () => (
        <HeaderButton label="Cerrar sesión" icon="log-out-outline" onPress={() => navigation.navigate('Home')} />
      ),
    });
  }, [navigation]);

  return (
    <Screen>
      <Title align="left">Hola 👋</Title>
      <Subtitle align="left">¿Qué quieres hacer hoy?</Subtitle>
      {sections.map((s) => (
        <Card key={s.route} onPress={() => navigation.navigate(s.route)} style={styles.row} accessibilityLabel={s.title}>
          <View style={styles.iconBox}>
            <Icon name={s.icon} size={ms(30)} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.text}>{s.text}</Text>
          </View>
          <Icon name="chevron-forward" size={ms(26)} color={colors.textMuted} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  iconBox: {
    width: ms(60),
    height: ms(60),
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  text: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
});
