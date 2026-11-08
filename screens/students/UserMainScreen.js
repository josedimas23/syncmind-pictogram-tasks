import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../services/firebaseConfig';
import { format, differenceInCalendarDays } from 'date-fns';
import { ms } from '../../utils/responsive';
import { colors, font, radius, spacing } from '../../utils/theme';
import { getViewMode } from '../../utils/preferences';
import { Card, EmptyState, HeaderButton, Loading, Screen, Title } from '../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

// Imagen de cada tipo de tarea según la preferencia de vista del alumno
const taskImages = {
  pictograma: {
    'Recogida de material': require('../../images/tijeras.png'),
    'Tarea por pasos': require('../../images/pasosLogo.png'),
    Fotocopias: require('../../images/fotocopias/fotocopia.png'),
    'Tarea Menu': require('../../images/menú.png'),
  },
  real: {
    'Recogida de material': require('../../images/materialReal.jpg'),
    'Tarea por pasos': require('../../images/pasosLogo.png'),
    Fotocopias: require('../../images/impresoraReal.jpg'),
    'Tarea Menu': require('../../images/menu_imagenes_reales/Menu.jpg'),
  },
};

const taskRoutes = {
  'Recogida de material': 'Recoger Material',
  'Tarea por pasos': 'UserStepsTask',
  Fotocopias: 'ShowFotocopia',
  'Tarea Menu': 'AssigmentMenuClass',
};

const daysLabel = (days) => {
  if (days < 0) return 'Fuera de plazo';
  if (days === 0) return 'Para hoy';
  if (days === 1) return 'Queda 1 día';
  return `Quedan ${days} días`;
};

export default function UserScreen({ navigation, route }) {
  const { studentId } = route.params;
  const [preferenciasVista, setPreferenciasVista] = useState(null);
  const [tareas, setTareas] = useState(null);
  const [studentName, setStudentName] = useState('');

  const fetchTasks = useCallback(async () => {
    const userDoc = await getDoc(doc(db, 'Estudiantes', studentId));
    if (!userDoc.exists()) {
      setTareas([]);
      return;
    }
    const userData = userDoc.data();
    setStudentName(userData.nombre);
    setPreferenciasVista(userData.preferenciasVista);

    const agenda = userData.agendaTareas || [];
    const pending = await Promise.all(Object.values(agenda).map(async (tarea) => {
      if (tarea.fechaCompletada !== undefined) return null;
      const tareaDoc = await getDoc(tarea.idTarea);
      if (!tareaDoc.exists()) return null;
      const tareaData = tareaDoc.data();
      const fechaLimite = tarea.fechaLimite.toDate();
      return {
        id: tareaDoc.id,
        titulo: tareaData.titulo,
        tipoTarea: tareaData.tipoTarea,
        fechaInicio: format(tarea.fechaInicio.toDate(), 'dd/MM/yyyy'),
        fechaLimite: format(fechaLimite, 'dd/MM/yyyy'),
        diasRestantes: differenceInCalendarDays(fechaLimite, new Date()),
      };
    }));
    setTareas(pending.filter(Boolean).sort((a, b) => a.diasRestantes - b.diasRestantes));
  }, [studentId]);

  // Recarga al volver a esta pantalla (p. ej. tras completar una tarea)
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  useEffect(() => {
    navigation.setOptions({
      title: 'Mis tareas',
      headerLeft: () => null,
      headerRight: () => <HeaderButton label="Salir" icon="home" onPress={() => navigation.navigate('Home')} />,
    });
  }, [navigation]);

  const mode = getViewMode(preferenciasVista);

  if (tareas === null) return <Loading />;

  return (
    <Screen>
      <Title>{studentName ? `Hola, ${studentName}` : 'Hola'}</Title>

      {tareas.length === 0 ? (
        <EmptyState
          image={require('../../images/sí.png')}
          title="¡Enhorabuena!"
          message="No tienes tareas pendientes."
        />
      ) : (
        tareas.map((tarea) => {
          const image = mode === 'texto' ? null : (taskImages[mode][tarea.tipoTarea] || null);
          const urgent = tarea.diasRestantes <= 0;
          return (
            <Card
              key={tarea.id}
              accessibilityLabel={`${tarea.titulo}. ${daysLabel(tarea.diasRestantes)}`}
              onPress={() => navigation.navigate(taskRoutes[tarea.tipoTarea] || 'Home', {
                studentId,
                idTarea: tarea.id,
                preferenciaVista: Array.isArray(preferenciasVista) ? preferenciasVista[0] : preferenciasVista,
              })}
              style={styles.task}
            >
              {image ? (
                <View style={styles.imageBox}>
                  <Image
                    source={image}
                    style={mode === 'real' ? styles.photo : styles.image}
                    resizeMode={mode === 'real' ? 'cover' : 'contain'}
                  />
                </View>
              ) : null}
              <View style={styles.taskText}>
                <Text style={styles.taskTitle}>{tarea.titulo}</Text>
                <View style={[styles.badge, urgent && styles.badgeUrgent]}>
                  <Icon name="time-outline" size={ms(18)} color={urgent ? colors.danger : colors.primary} />
                  <Text style={[styles.badgeText, urgent && { color: colors.danger }]}>{daysLabel(tarea.diasRestantes)}</Text>
                </View>
                {mode === 'texto' ? (
                  <Text style={styles.dates}>Del {tarea.fechaInicio} al {tarea.fechaLimite}</Text>
                ) : null}
              </View>
              <Icon name="chevron-forward" size={ms(32)} color={colors.primary} />
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  task: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  imageBox: {
    width: ms(110),
    height: ms(110),
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '90%', height: '90%' },
  photo: { width: '100%', height: '100%' },
  taskText: { flex: 1, gap: spacing.sm },
  taskTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  badgeUrgent: { backgroundColor: colors.dangerSoft },
  badgeText: { fontSize: font.small, fontWeight: '700', color: colors.primary },
  dates: { fontSize: font.small, color: colors.textMuted },
});
