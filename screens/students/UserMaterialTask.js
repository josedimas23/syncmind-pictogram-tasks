import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../services/firebaseConfig';
import AceptButton from '../../componentes/AceptButton';
import { ms } from '../../utils/responsive';
import { colors, font, radius, spacing } from '../../utils/theme';
import { getViewMode } from '../../utils/preferences';
import { Card, EmptyState, Loading, Screen, Subtitle, Title } from '../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const materialImages = {
  Lapices: require('../../images/lapicesReal.jpg'),
  Pinceles: require('../../images/pincelesReal.jpg'),
  Gomas: require('../../images/gomaReal.jpg'),
  Celo: require('../../images/celoReal.jpg'),
  Témpera: require('../../images/temperaReal.jpg'),
  Pegamento: require('../../images/pegamentoReal.jpg'),
  Tijeras: require('../../images/tijerasReal.jpg'),
  Plastilina: require('../../images/plastilinaReal.jpeg'),
  Cartulina: require('../../images/cartulinaReal.jpg'),
  Anillas: require('../../images/anillasReal.jpg'),
};

const materialPictograms = {
  Lapices: require('../../images/lápiz.png'),
  Pinceles: require('../../images/pincel.png'),
  Gomas: require('../../images/goma.png'),
  Celo: require('../../images/celo.png'),
  Témpera: require('../../images/tempera.png'),
  Pegamento: require('../../images/pegamento.png'),
  Tijeras: require('../../images/tijeras.png'),
  Plastilina: require('../../images/plastilina.png'),
  Cartulina: require('../../images/cartulina.png'),
  Anillas: require('../../images/anillas.png'),
};

const materialNames = { Lapices: 'Lápices' };

export default function UserMaterialTask({ navigation, route }) {
  const { studentId, idTarea } = route.params;
  const [materiales, setMateriales] = useState(null);
  const [mode, setMode] = useState('pictograma');

  useEffect(() => {
    navigation.setOptions({ title: 'Recoger material' });
  }, [navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentDoc, taskDoc] = await Promise.all([
          getDoc(doc(db, 'Estudiantes', studentId)),
          getDoc(doc(db, 'Tareas', idTarea)),
        ]);
        if (studentDoc.exists()) setMode(getViewMode(studentDoc.data().preferenciasVista));
        setMateriales(taskDoc.exists() ? taskDoc.data().materiales || {} : {});
      } catch (error) {
        console.error('Error al cargar la tarea de material:', error);
        setMateriales({});
      }
    };
    load();
  }, [studentId, idTarea]);

  const toggle = async (key) => {
    const updated = { ...materiales, [key]: { ...materiales[key], completada: !materiales[key].completada } };
    setMateriales(updated);
    try {
      await updateDoc(doc(db, 'Tareas', idTarea), { materiales: updated });
    } catch (error) {
      console.error('Error al guardar el material:', error);
    }
  };

  if (materiales === null) return <Loading />;

  const keys = Object.keys(materiales);
  const doneCount = keys.filter((k) => materiales[k].completada).length;

  return (
    <Screen
      footer={(
        <AceptButton
          prefPictograma={mode !== 'texto'}
          navigate={navigation}
          idStudent={studentId}
          idTarea={idTarea}
        />
      )}
    >
      <Title>Busca este material</Title>
      <Subtitle>Toca cada cosa cuando la tengas · {doneCount} de {keys.length}</Subtitle>

      {keys.length === 0 ? <EmptyState title="No hay material en esta tarea" /> : null}

      {keys.map((key) => {
        const item = materiales[key];
        const done = !!item.completada;
        const image = mode === 'texto' ? null : (mode === 'real' ? materialImages : materialPictograms)[key];
        return (
          <Card
            key={key}
            selected={done}
            style={styles.row}
            accessibilityLabel={`${materialNames[key] || key}, ${item.Cantidad}. ${done ? 'Conseguido' : 'Pendiente'}`}
            onPress={() => toggle(key)}
          >
            {image ? (
              <View style={styles.imageBox}>
                <Image source={image} style={styles.image} resizeMode={mode === 'real' ? 'cover' : 'contain'} />
              </View>
            ) : null}
            <View style={styles.text}>
              <Text style={[styles.name, done && styles.doneText]}>
                {item.Cantidad ? `${item.Cantidad} × ` : ''}{materialNames[key] || key}
              </Text>
              {item.Descripcion ? <Text style={[styles.description, done && styles.doneText]}>{item.Descripcion}</Text> : null}
            </View>
            <View style={[styles.check, done && styles.checkDone]}>
              {done ? <Icon name="checkmark" size={ms(34)} color={colors.white} /> : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  imageBox: {
    width: ms(96),
    height: ms(96),
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  text: { flex: 1, gap: spacing.xs },
  name: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  description: { fontSize: font.body, color: colors.textMuted },
  doneText: { textDecorationLine: 'line-through', color: colors.success },
  check: {
    width: ms(56),
    height: ms(56),
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
});
