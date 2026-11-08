import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../services/firebaseConfig';
import AceptButton from '../../componentes/AceptButton';
import { ms } from '../../utils/responsive';
import { colors, font, radius, spacing } from '../../utils/theme';
import { getViewMode } from '../../utils/preferences';
import { AppButton, Card, EmptyState, Loading, Screen } from '../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

export default function UserStepsTask({ navigation, route }) {
  const { studentId, idTarea, preferenciaVista } = route.params;
  const [taskData, setTaskData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const mode = getViewMode(preferenciaVista);

  useEffect(() => {
    navigation.setOptions({ title: 'Tarea por pasos' });
    const load = async () => {
      try {
        const taskDoc = await getDoc(doc(db, 'Tareas', idTarea));
        setTaskData(taskDoc.exists() ? taskDoc.data() : null);
      } catch (error) {
        console.error('Error al obtener los datos de la tarea:', error);
      }
      setLoaded(true);
    };
    load();
  }, [navigation, idTarea]);

  if (!loaded) return <Loading />;
  if (!taskData || !taskData.pasos) {
    return <Screen center><EmptyState title="Esta tarea no tiene pasos" /></Screen>;
  }

  const total = Object.keys(taskData.pasos).length;
  const step = taskData.pasos[currentStep] || {};
  const isLast = currentStep === total;
  const imageUrl = mode === 'real' ? step.Imagen : step.Pictograma;

  return (
    <Screen
      footer={(
        <View style={styles.nav}>
          <AppButton
            label="Atrás"
            icon="arrow-back"
            variant="secondary"
            size="lg"
            disabled={currentStep === 1}
            onPress={() => setCurrentStep((s) => Math.max(1, s - 1))}
          />
          {isLast ? (
            <AceptButton
              prefPictograma={mode !== 'texto'}
              navigate={navigation}
              idStudent={studentId}
              idTarea={idTarea}
              style={{ minWidth: 0 }}
            />
          ) : (
            <AppButton
              label="Siguiente"
              icon="arrow-forward"
              size="lg"
              onPress={() => setCurrentStep((s) => Math.min(total, s + 1))}
            />
          )}
        </View>
      )}
    >
      <View style={styles.progress} accessibilityLabel={`Paso ${currentStep} de ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.dot, i + 1 <= currentStep && styles.dotActive]} />
        ))}
      </View>
      <Text style={styles.stepCounter}>Paso {currentStep} de {total}</Text>

      <Card style={styles.card}>
        <Text style={styles.stepTitle}>{step.Titulo || 'Paso sin título'}</Text>
        {mode !== 'texto' ? (
          <View style={styles.imageBox}>
            <Image
              source={imageUrl ? { uri: imageUrl } : require('../../images/no-image-icon.png')}
              style={imageUrl ? styles.image : styles.placeholder}
              resizeMode="contain"
            />
          </View>
        ) : null}
        {step.Instrucciones ? <Text style={styles.description}>{step.Instrucciones}</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { flex: 1, maxWidth: ms(60), height: ms(10), borderRadius: radius.pill, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  stepCounter: { textAlign: 'center', fontSize: font.body, fontWeight: '700', color: colors.textMuted },
  card: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  stepTitle: { fontSize: font.hero, fontWeight: '800', color: colors.text, textAlign: 'center' },
  imageBox: {
    width: '100%',
    maxWidth: ms(380),
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { width: '45%', height: '45%', opacity: 0.6 },
  description: { fontSize: font.subtitle, color: colors.text, textAlign: 'center', lineHeight: font.subtitle * 1.4 },
  nav: { flexDirection: 'row', gap: spacing.lg, justifyContent: 'center', width: '100%' },
});
