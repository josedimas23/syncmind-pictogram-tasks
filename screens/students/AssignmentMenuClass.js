import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../services/firebaseConfig';
import AceptButton from '../../componentes/AceptButton';
import { ms } from '../../utils/responsive';
import { colors, font, spacing } from '../../utils/theme';
import { getViewMode } from '../../utils/preferences';
import { Card, EmptyState, Loading, Screen, Subtitle, Title } from '../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const classLabel = (name) => name.replace(/^Clase\s*/i, 'Clase ');

export default function AssignmentMenuClass({ route, navigation }) {
  const { studentId, idTarea, preferenciaVista } = route.params || {};
  const [classes, setClasses] = useState(null);
  const [completedClasses, setCompletedClasses] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: 'Menú del comedor' });
  }, [navigation]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const taskDoc = await getDoc(doc(db, 'Tareas', idTarea));
        setClasses(taskDoc.exists() ? Object.keys(taskDoc.data().Clases || {}).sort() : []);
      } catch (error) {
        console.error('Error al obtener clases de la base de datos:', error);
        setClasses([]);
      }
    };
    if (idTarea) fetchClasses();
  }, [idTarea]);

  const handleClassSelect = (className) => {
    navigation.navigate('UserMenuTask', {
      studentId,
      idTarea,
      className,
      onComplete: (done) => setCompletedClasses((prev) => (prev.includes(done) ? prev : [...prev, done])),
    });
  };

  if (classes === null) return <Loading />;

  return (
    <Screen
      footer={(
        <AceptButton
          prefPictograma={getViewMode(preferenciaVista) !== 'texto'}
          navigate={navigation}
          idStudent={studentId}
          idTarea={idTarea}
        />
      )}
    >
      <Title>¿Qué clase vas a preguntar?</Title>
      <Subtitle>
        Pide el menú en cada clase. Cuando termines todas, pulsa «Hecho».
      </Subtitle>

      {classes.length === 0 ? <EmptyState title="No hay clases en esta tarea" /> : null}

      <View style={styles.grid}>
        {classes.map((name) => {
          const done = completedClasses.includes(name);
          return (
            <Card
              key={name}
              selected={done}
              style={styles.classCard}
              accessibilityLabel={`${classLabel(name)}${done ? ', hecha' : ''}`}
              onPress={() => handleClassSelect(name)}
            >
              <Icon
                name={done ? 'checkmark-circle' : 'people'}
                size={ms(44)}
                color={done ? colors.success : colors.primary}
              />
              <Text style={styles.classText}>{classLabel(name)}</Text>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.lg },
  classCard: { width: ms(200), alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  classText: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
});
