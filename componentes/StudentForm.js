// Form shared by "add student" and "edit student".
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatarToCloudinary } from '../services/cloudinary';
import { ms } from '../utils/responsive';
import { colors, font, radius, spacing } from '../utils/theme';
import { notify } from '../utils/notify';
import { Card, ChipGroup, Field, FieldLabel } from './ui';

export const FRUITS = [
  { id: '0', name: 'Uvas', image: require('../images/uva.png') },
  { id: '1', name: 'Piña', image: require('../images/pina.png') },
  { id: '2', name: 'Sandía', image: require('../images/sandia.png') },
  { id: '3', name: 'Fresa', image: require('../images/fresa.png') },
  { id: '4', name: 'Limón', image: require('../images/limon.png') },
  { id: '5', name: 'Manzana', image: require('../images/manzana.png') },
  { id: '6', name: 'Pimiento', image: require('../images/pimiento.png') },
  { id: '7', name: 'Naranja', image: require('../images/naranja.png') },
  { id: '8', name: 'Aguacate', image: require('../images/aguacate.png') },
];

export const VIEW_OPTIONS = [
  { id: 'Pictograma', label: 'Pictogramas' },
  { id: 'Imagenes reales', label: 'Imágenes reales' },
  { id: 'Texto', label: 'Solo texto' },
];

const defaultAvatar = require('../images/avatar_1.png');

export const emptyStudent = () => ({
  nombre: '',
  edad: '',
  preferenciasVista: 'Pictograma',
  fotoAvatar: null,
  contrasenaVisual: ['0', '5'],
});

export const validateStudent = (s) => {
  if (!s.nombre.trim()) return 'Escribe el nombre del alumno.';
  if (!String(s.edad).trim() || Number.isNaN(Number(s.edad))) return 'La edad debe ser un número.';
  if (s.contrasenaVisual.length !== 2) return 'Elige las dos frutas de la contraseña.';
  return null;
};

// Uploads the avatar if it is a local file and returns the stored value.
export const resolveAvatar = async (uri) => {
  if (!uri || uri.startsWith('http')) return uri || null;
  try {
    const result = await uploadAvatarToCloudinary(uri);
    return result.secure_url;
  } catch (error) {
    console.error('Error al subir el avatar:', error);
    notify('Foto no subida', 'No se pudo subir la foto; el alumno se guardará sin ella.');
    return null;
  }
};

export default function StudentForm({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const [first, second] = value.contrasenaVisual;

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify('Permiso necesario', 'Hace falta permiso para acceder a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) set({ fotoAvatar: result.assets[0].uri });
  };

  const pickFruit = (id) => {
    const current = value.contrasenaVisual.length === 2 ? [] : value.contrasenaVisual;
    set({ contrasenaVisual: [...current, id] });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={styles.section}>
        <View style={styles.identity}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cambiar foto" onPress={pickAvatar} style={styles.avatarBox}>
            <Image source={value.fotoAvatar ? { uri: value.fotoAvatar } : defaultAvatar} style={styles.avatar} resizeMode="cover" />
            <View style={styles.avatarBadge}><Icon name="camera" size={ms(16)} color={colors.white} /></View>
          </Pressable>
          <View style={{ flex: 1, gap: spacing.md }}>
            <Field label="Nombre y apellidos" value={value.nombre} onChangeText={(t) => set({ nombre: t })} placeholder="Nombre del alumno" />
            <Field label="Edad" value={String(value.edad)} onChangeText={(t) => set({ edad: t.replace(/[^0-9]/g, '') })} keyboardType="number-pad" placeholder="Años" />
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <FieldLabel>¿Cómo ve mejor las tareas?</FieldLabel>
        <ChipGroup options={VIEW_OPTIONS} value={value.preferenciasVista} onChange={(id) => set({ preferenciasVista: id })} />
      </Card>

      <Card style={styles.section}>
        <FieldLabel>Contraseña de frutas (toca dos en orden)</FieldLabel>
        <View style={styles.passwordRow}>
          {[first, second].map((id, i) => {
            const fruit = FRUITS.find((f) => f.id === id);
            return (
              <View key={i} style={styles.passSlot}>
                {fruit ? <Image source={fruit.image} style={styles.passImage} resizeMode="contain" /> : <Text style={styles.passNumber}>{i + 1}</Text>}
              </View>
            );
          })}
        </View>
        <View style={styles.fruits}>
          {FRUITS.map((f) => (
            <Pressable key={f.id} accessibilityRole="button" accessibilityLabel={f.name} onPress={() => pickFruit(f.id)} style={styles.fruit}>
              <Image source={f.image} style={styles.fruitImage} resizeMode="contain" />
            </Pressable>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  identity: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  avatarBox: { width: ms(110), height: ms(110) },
  avatar: { width: '100%', height: '100%', borderRadius: radius.lg, backgroundColor: colors.primarySoft },
  avatarBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: ms(32),
    height: ms(32),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  passwordRow: { flexDirection: 'row', gap: spacing.md },
  passSlot: {
    width: ms(64),
    height: ms(64),
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passImage: { width: '75%', height: '75%' },
  passNumber: { fontSize: font.subtitle, fontWeight: '800', color: colors.textMuted },
  fruits: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fruit: {
    width: ms(56),
    height: ms(56),
    borderRadius: radius.md,
    backgroundColor: '#FFE9D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fruitImage: { width: '75%', height: '75%' },
});
