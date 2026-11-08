import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { ms } from '../../../utils/responsive';
import { colors, font, radius, spacing } from '../../../utils/theme';
import { notify } from '../../../utils/notify';
import { AppButton, Card, Loading, Screen, Subtitle, Title } from '../../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <View style={styles.barRow}>
      <View style={styles.barLabels}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{Number.isInteger(value) ? value : value.toFixed(1)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function GraphicUser({ route, navigation }) {
  const { userId } = route.params;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Progreso' });
  }, [navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        const [userDoc, all] = await Promise.all([
          getDoc(doc(db, 'Estudiantes', userId)),
          getDocs(collection(db, 'Estudiantes')),
        ]);
        if (!userDoc.exists()) {
          setStats({ missing: true });
          return;
        }
        const user = userDoc.data();
        const totals = all.docs.map((d) => Number(d.data().tareasCompletadas) || 0);
        const agenda = user.agendaTareas || [];
        setStats({
          nombre: user.nombre,
          completadas: Number(user.tareasCompletadas) || 0,
          media: totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0,
          pendientes: agenda.filter((t) => t.fechaCompletada === undefined).length,
        });
      } catch (error) {
        console.error('Error al cargar los datos del usuario: ', error);
        setStats({ missing: true });
      }
    };
    load();
  }, [userId]);

  const reset = async () => {
    try {
      await updateDoc(doc(db, 'Estudiantes', userId), { tareasCompletadas: 0 });
      setStats((s) => ({ ...s, completadas: 0 }));
    } catch (error) {
      console.error('Error al reiniciar los valores:', error);
      notify('Error', 'No se pudo reiniciar el contador.');
    }
  };

  const confirmReset = () => notify(
    'Reiniciar contador',
    `¿Poner a 0 las tareas completadas de ${stats.nombre}?`,
    [{ text: 'Cancelar', style: 'cancel' }, { text: 'Reiniciar', style: 'destructive', onPress: reset }],
  );

  if (stats === null) return <Loading />;
  if (stats.missing) return <Screen center><Title>No se encontró el alumno</Title></Screen>;

  const max = Math.max(stats.completadas, stats.media, 1);

  return (
    <Screen footer={<AppButton label="Reiniciar contador" icon="refresh" variant="secondary" onPress={confirmReset} />}>
      <Title align="left">{stats.nombre}</Title>
      <Subtitle align="left">Resumen de tareas</Subtitle>

      <View style={styles.tiles}>
        <Card style={styles.tile}>
          <Text style={styles.tileValue}>{stats.completadas}</Text>
          <Text style={styles.tileLabel}>Completadas</Text>
        </Card>
        <Card style={styles.tile}>
          <Text style={styles.tileValue}>{stats.pendientes}</Text>
          <Text style={styles.tileLabel}>Pendientes</Text>
        </Card>
      </View>

      <Card style={{ gap: spacing.lg }}>
        <Text style={styles.chartTitle}>Comparado con la media de la clase</Text>
        <Bar label={stats.nombre} value={stats.completadas} max={max} color={colors.primary} />
        <Bar label="Media de alumnos" value={stats.media} max={max} color={colors.accent} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: spacing.lg },
  tile: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  tileValue: { fontSize: ms(44), fontWeight: '900', color: colors.text },
  tileLabel: { fontSize: font.body, color: colors.textMuted, fontWeight: '600' },
  chartTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  barRow: { gap: spacing.xs },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  barValue: { fontSize: font.body, color: colors.text, fontWeight: '800' },
  barTrack: { height: ms(22), borderRadius: radius.pill, backgroundColor: colors.background, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
});
