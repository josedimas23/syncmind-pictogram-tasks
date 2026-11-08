import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { ms } from '../../../utils/responsive';
import { colors, font, radius, spacing } from '../../../utils/theme';
import { Card, Screen, Subtitle, Title } from '../../../componentes/ui';

const types = [
  { route: 'StepsTask', title: 'Tarea por pasos', text: 'Una actividad dividida en pasos con imagen y explicación', image: require('../../../images/pasosLogo.png') },
  { route: 'MaterialTaskTeacher', title: 'Recoger material', text: 'Lista de material escolar que el alumno debe traer', image: require('../../../images/tijeras.png') },
  { route: 'TaskFotocopias', title: 'Fotocopias', text: 'Fotocopiar o plastificar, en color o blanco y negro', image: require('../../../images/fotocopias/fotocopia.png') },
  { route: 'TaskMenu', title: 'Menú del comedor', text: 'Preguntar en cada clase cuántos menús de cada tipo quieren', image: require('../../../images/menú.png') },
];

export default function AddTask({ navigation }) {
  useEffect(() => {
    navigation.setOptions({ title: 'Nueva tarea' });
  }, [navigation]);

  return (
    <Screen>
      <Title align="left">¿Qué tipo de tarea?</Title>
      <Subtitle align="left">Elige una plantilla para empezar</Subtitle>
      {types.map((t) => (
        <Card key={t.route} onPress={() => navigation.navigate(t.route)} style={styles.row} accessibilityLabel={t.title}>
          <View style={styles.imageBox}>
            <Image source={t.image} style={styles.image} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.text}>{t.text}</Text>
          </View>
          <Icon name="chevron-forward" size={ms(26)} color={colors.textMuted} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  imageBox: {
    width: ms(64),
    height: ms(64),
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '80%', height: '80%' },
  title: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  text: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
});
