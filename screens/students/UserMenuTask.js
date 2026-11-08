import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../services/firebaseConfig';
import { ms } from '../../utils/responsive';
import { colors, font, radius, spacing } from '../../utils/theme';
import { getViewMode } from '../../utils/preferences';
import { AppButton, Card, Loading, Screen, Subtitle, Title } from '../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const pictogramas = {
  Menu1: require('../../images/Menu.png'),
  Menu2: require('../../images/NoCarne.png'),
  Menu3: require('../../images/Triturado.png'),
  Menu4: require('../../images/FrutaTriturada.png'),
  Menu5: require('../../images/yogur_natillas.png'),
  Menu6: require('../../images/Fruta.png'),
};

const imagenesReales = {
  Menu1: require('../../images/menu_imagenes_reales/Menu.jpg'),
  Menu2: require('../../images/menu_imagenes_reales/NoCarne.jpg'),
  Menu3: require('../../images/menu_imagenes_reales/Triturado.jpg'),
  Menu4: require('../../images/menu_imagenes_reales/FrutaTriturada.jpg'),
  Menu5: require('../../images/menu_imagenes_reales/yogur_natillas.jpg'),
  Menu6: require('../../images/menu_imagenes_reales/Fruta.jpg'),
};

const dedos = {
  1: require('../../images/dedos/dedo1.png'),
  2: require('../../images/dedos/dedo2.png'),
  3: require('../../images/dedos/dedo3.png'),
  4: require('../../images/dedos/dedo4.png'),
  5: require('../../images/dedos/dedo5.png'),
  6: require('../../images/dedos/dedo6.png'),
};

const MAX_COUNT = 6;

export default function UserMenuTask({ route, navigation }) {
  const { idTarea, className, studentId, onComplete } = route.params || {};
  const [menus, setMenus] = useState(null);
  const [mode, setMode] = useState('pictograma');

  useEffect(() => {
    navigation.setOptions({ title: className ? className.replace(/^Clase\s*/i, 'Clase ') : 'Menú' });
  }, [navigation, className]);

  useEffect(() => {
    if (!idTarea || !className || !studentId) return;
    const load = async () => {
      try {
        const [studentDoc, taskDoc] = await Promise.all([
          getDoc(doc(db, 'Estudiantes', studentId)),
          getDoc(doc(db, 'Tareas', idTarea)),
        ]);
        if (studentDoc.exists()) setMode(getViewMode(studentDoc.data().preferenciasVista));
        const clases = taskDoc.exists() ? taskDoc.data().Clases || {} : {};
        setMenus(Object.entries(clases[className] || {}).sort((a, b) => a[0].localeCompare(b[0])));
      } catch (error) {
        console.error('Error al obtener datos de la clase:', error);
        setMenus([]);
      }
    };
    load();
  }, [idTarea, className, studentId]);

  const changeCount = async (menuKey, change) => {
    const updated = menus.map(([key, data]) => {
      if (key !== menuKey) return [key, data];
      const next = [...data];
      next[2] = Math.min(MAX_COUNT, Math.max(0, next[2] + change));
      return [key, next];
    });
    setMenus(updated);
    try {
      const menuData = updated.find(([key]) => key === menuKey)[1];
      await updateDoc(doc(db, 'Tareas', idTarea), { [`Clases.${className}.${menuKey}`]: menuData });
    } catch (error) {
      console.error('Error al actualizar el contador:', error);
    }
  };

  if (menus === null) return <Loading />;

  return (
    <Screen
      footer={(
        <AppButton
          label="Listo"
          icon="checkmark"
          variant="accent"
          size="lg"
          style={{ minWidth: 260 }}
          onPress={() => {
            if (onComplete) onComplete(className);
            navigation.goBack();
          }}
        />
      )}
    >
      <Title>¿Cuántos quieren cada menú?</Title>
      <Subtitle>Usa + y − para contar</Subtitle>

      {menus.map(([menuKey, menuData]) => {
        const count = menuData[2];
        const image = mode === 'texto' ? null : (mode === 'real' ? imagenesReales : pictogramas)[menuKey];
        return (
          <Card key={menuKey} style={styles.row}>
            {image ? (
              <View style={styles.imageBox}>
                <Image source={image} style={styles.image} resizeMode={mode === 'real' ? 'cover' : 'contain'} />
              </View>
            ) : null}
            <Text style={styles.label}>{menuData[1]}</Text>

            <View style={styles.counter}>
              <CounterButton icon="remove" label={`Quitar uno de ${menuData[1]}`} disabled={count <= 0} onPress={() => changeCount(menuKey, -1)} />
              <View style={styles.countBox}>
                {mode !== 'texto' && count > 0 ? (
                  <Image source={dedos[count]} style={styles.finger} resizeMode="contain" />
                ) : null}
                <Text style={styles.countText}>{count}</Text>
              </View>
              <CounterButton icon="add" label={`Añadir uno de ${menuData[1]}`} disabled={count >= MAX_COUNT} onPress={() => changeCount(menuKey, 1)} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

function CounterButton({ icon, label, onPress, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.counterButton, disabled && { opacity: 0.35 }, pressed && { transform: [{ scale: 0.95 }] }]}
    >
      <Icon name={icon} size={ms(30)} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  imageBox: {
    width: ms(84),
    height: ms(84),
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  label: { flex: 1, fontSize: font.subtitle, fontWeight: '700', color: colors.text },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  counterButton: {
    width: ms(54),
    height: ms(54),
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBox: { width: ms(70), alignItems: 'center' },
  finger: { width: ms(52), height: ms(52) },
  countText: { fontSize: font.title, fontWeight: '800', color: colors.text },
});
