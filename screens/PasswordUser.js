import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getApp } from 'firebase/app';
import { ms } from '../utils/responsive';
import { colors, font, radius, shadow, spacing } from '../utils/theme';
import { Screen, Subtitle, Title } from '../componentes/ui';

const fruitImages = {
  Uvas: require('../images/uva.png'),
  Pina: require('../images/pina.png'),
  Sandia: require('../images/sandia.png'),
  Fresa: require('../images/fresa.png'),
  Limon: require('../images/limon.png'),
  Manzana: require('../images/manzana.png'),
  Pimiento: require('../images/pimiento.png'),
  Naranja: require('../images/naranja.png'),
  Aguacate: require('../images/aguacate.png'),
};

// Opciones de frutas con sus IDs (el ID es lo que se guarda como contraseña)
const fruitOptions = [
  { id: '0', name: 'Uvas' },
  { id: '1', name: 'Pina' },
  { id: '2', name: 'Sandia' },
  { id: '3', name: 'Fresa' },
  { id: '4', name: 'Limon' },
  { id: '5', name: 'Manzana' },
  { id: '6', name: 'Pimiento' },
  { id: '7', name: 'Naranja' },
  { id: '8', name: 'Aguacate' },
];

export default function PasswordUser() {
  const navigation = useNavigation();
  const route = useRoute();
  const { studentId } = route.params;

  const [selectedFruits, setSelectedFruits] = useState([]);
  const [password, setPassword] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [status, setStatus] = useState(null); // null | 'ok' | 'error'

  useEffect(() => {
    navigation.setOptions({ title: 'Tu contraseña' });
    const fetchPassword = async () => {
      try {
        const studentDoc = await getDoc(doc(getFirestore(getApp()), 'Estudiantes', studentId));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          setPassword(data.contrasenaVisual || []);
          setStudentName(data.nombre || '');
        }
      } catch (error) {
        console.error('Error obteniendo la contraseña visual:', error);
      }
    };
    fetchPassword();
  }, [navigation, studentId]);

  const handleFruitSelection = (fruitId) => {
    if (selectedFruits.length >= 2 || status === 'ok') return;
    const newSelection = [...selectedFruits, fruitId];
    setSelectedFruits(newSelection);
    setStatus(null);

    if (newSelection.length === 2) {
      // Compara respetando el orden
      if (newSelection[0] === password[0] && newSelection[1] === password[1]) {
        setStatus('ok');
        setTimeout(() => {
          setSelectedFruits([]);
          setStatus(null);
          navigation.navigate('UserScreen', { studentId });
        }, 600);
      } else {
        setStatus('error');
        setTimeout(() => setSelectedFruits([]), 900);
      }
    }
  };

  return (
    <Screen>
      <Title>{studentName ? `Hola, ${studentName}` : 'Hola'}</Title>
      <Subtitle>Toca tus dos frutas en orden</Subtitle>

      <View style={styles.slots} accessibilityLabel={`${selectedFruits.length} de 2 frutas elegidas`}>
        {[0, 1].map((i) => {
          const fruit = fruitOptions.find((f) => f.id === selectedFruits[i]);
          return (
            <View key={i} style={[styles.slot, status === 'error' && styles.slotError, status === 'ok' && styles.slotOk]}>
              {fruit ? <Image source={fruitImages[fruit.name]} style={styles.slotImage} resizeMode="contain" /> : (
                <Text style={styles.slotNumber}>{i + 1}</Text>
              )}
            </View>
          );
        })}
      </View>

      {status === 'error' ? (
        <View style={[styles.feedback, styles.feedbackError]}>
          <Icon name="close-circle" size={ms(26)} color={colors.danger} />
          <Text style={[styles.feedbackText, { color: colors.danger }]}>No es correcta. ¡Prueba otra vez!</Text>
        </View>
      ) : null}
      {status === 'ok' ? (
        <View style={[styles.feedback, styles.feedbackOk]}>
          <Icon name="checkmark-circle" size={ms(26)} color={colors.success} />
          <Text style={[styles.feedbackText, { color: colors.success }]}>¡Muy bien!</Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        {fruitOptions.map((fruit) => (
          <Pressable
            key={fruit.id}
            accessibilityRole="button"
            accessibilityLabel={fruit.name}
            onPress={() => handleFruitSelection(fruit.id)}
            style={({ pressed }) => [
              styles.fruit,
              selectedFruits.includes(fruit.id) && styles.fruitSelected,
              pressed && styles.pressed,
            ]}
          >
            <Image source={fruitImages[fruit.name]} style={styles.fruitImage} resizeMode="contain" />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  slots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  slot: {
    width: ms(84),
    height: ms(84),
    borderRadius: radius.md,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotError: { borderColor: colors.danger, borderStyle: 'solid', backgroundColor: colors.dangerSoft },
  slotOk: { borderColor: colors.success, borderStyle: 'solid', backgroundColor: colors.successSoft },
  slotImage: { width: '75%', height: '75%' },
  slotNumber: { fontSize: font.title, fontWeight: '800', color: colors.border },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  feedbackError: { backgroundColor: colors.dangerSoft },
  feedbackOk: { backgroundColor: colors.successSoft },
  feedbackText: { fontSize: font.subtitle, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: ms(560),
    alignSelf: 'center',
  },
  fruit: {
    width: '30%',
    aspectRatio: 1.15,
    backgroundColor: '#FFE9D6',
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  fruitSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  fruitImage: { width: '65%', height: '75%' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
