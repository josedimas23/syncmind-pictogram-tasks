import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../services/firebaseConfig';
import AceptButton from '../../componentes/AceptButton';
import { ms } from '../../utils/responsive';
import { colors, font, radius, spacing } from '../../utils/theme';
import { getViewMode } from '../../utils/preferences';
import { Card, Loading, Screen, Title } from '../../componentes/ui';

// Pictogramas de ARASAAC (fotocopia, plastificar, color, blanco y negro)
const fotocopiaImage = require('../../images/fotocopias/fotocopia.png');
const plastificarImage = require('../../images/fotocopias/plastificar.png');
const colorImage = require('../../images/fotocopias/color.png');
const blancoNegroImage = require('../../images/fotocopias/blancoNegro.png');

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

export default function ShowFotocopia({ navigation, route }) {
  const { idTarea, studentId } = route.params;
  const [task, setTask] = useState(null);
  const [mode, setMode] = useState('pictograma');

  useEffect(() => {
    navigation.setOptions({ title: 'Fotocopias' });
    const load = async () => {
      try {
        const [taskDoc, studentDoc] = await Promise.all([
          getDoc(doc(db, 'Tareas', idTarea)),
          getDoc(doc(db, 'Estudiantes', studentId)),
        ]);
        if (studentDoc.exists()) setMode(getViewMode(studentDoc.data().preferenciasVista));
        setTask(taskDoc.exists() ? taskDoc.data() : {});
      } catch (error) {
        console.error('Error al obtener los datos de la tarea:', error);
        setTask({});
      }
    };
    load();
  }, [navigation, idTarea, studentId]);

  if (task === null) return <Loading />;

  const showImages = mode !== 'texto';
  const rows = [
    { label: 'Qué hacer', value: task.tipo, image: task.tipo === 'Fotocopia' ? fotocopiaImage : plastificarImage },
    { label: 'Cuántas', value: task.cantidad, big: true },
    { label: 'Color', value: task.tipoColor, image: task.tipoColor === 'Color' ? colorImage : blancoNegroImage },
  ];

  return (
    <Screen
      footer={(
        <AceptButton prefPictograma={showImages} navigate={navigation} idStudent={studentId} idTarea={idTarea} />
      )}
    >
      <Title>Lleva esto a la fotocopiadora</Title>
      {rows.map((row) => (
        <Card key={row.label} style={styles.row}>
          {showImages && row.image ? (
            <View style={styles.imageBox}>
              <Image source={row.image} style={styles.image} resizeMode="contain" />
            </View>
          ) : null}
          {row.big ? (
            <View style={styles.numberBox}><Text style={styles.number}>{row.value ?? '—'}</Text></View>
          ) : null}
          <View style={styles.text}>
            <Text style={styles.label}>{row.label}</Text>
            {!row.big ? <Text style={styles.value}>{row.value || '—'}</Text> : <Text style={styles.value}>copias</Text>}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  imageBox: {
    width: ms(110),
    height: ms(110),
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '85%', height: '85%' },
  numberBox: {
    width: ms(110),
    height: ms(110),
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontSize: ms(52), fontWeight: '900', color: colors.text },
  text: { flex: 1, gap: spacing.xs },
  label: { fontSize: font.small, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  value: { fontSize: font.title, fontWeight: '800', color: colors.text },
});
