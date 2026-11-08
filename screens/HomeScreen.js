import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../services/firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { ms } from '../utils/responsive';
import { colors, font, radius, spacing } from '../utils/theme';
import { AppButton, Card, Loading, Screen, Subtitle, Title, EmptyState } from '../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const defaultAvatar = require('../images/avatar_1.png');

export default function HomeScreen({ navigation }) {
  const [students, setStudents] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: 'SyncMind' });
  }, [navigation]);

  const fetchStudents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'Estudiantes'));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
      setStudents(list);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  return (
    <Screen
      footer={(
        <AppButton
          label="Acceso profesorado"
          icon="school-outline"
          variant="secondary"
          onPress={() => navigation.navigate('LoginPage')}
        />
      )}
    >
      <Title>¿Quién eres?</Title>
      <Subtitle>Toca tu foto para entrar</Subtitle>

      {students === null ? <Loading /> : null}
      {students && students.length === 0 ? (
        <EmptyState title="Todavía no hay alumnos" message="El profesorado puede darlos de alta desde su acceso." />
      ) : null}

      <View style={styles.grid}>
        {(students || []).map((student) => (
          <Card
            key={student.id}
            style={styles.studentCard}
            accessibilityLabel={`Entrar como ${student.nombre}`}
            onPress={() => navigation.navigate('LoginUser', { studentId: student.id })}
          >
            <Image
              source={student.fotoAvatar && typeof student.fotoAvatar === 'string' ? { uri: student.fotoAvatar } : defaultAvatar}
              style={styles.avatar}
              resizeMode="cover"
            />
            <Text style={styles.name} numberOfLines={2}>{student.nombre}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  studentCard: {
    width: ms(150),
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  avatar: {
    width: ms(110),
    height: ms(110),
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  name: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
