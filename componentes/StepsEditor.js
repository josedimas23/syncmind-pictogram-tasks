// Editor shared by "create" and "edit" step-by-step tasks.
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadStepImageToCloudinary } from '../services/cloudinary';
import { ms } from '../utils/responsive';
import { colors, font, radius, spacing } from '../utils/theme';
import { notify } from '../utils/notify';
import { AppButton, Card, Field, IconButton } from './ui';

export const emptyStep = () => ({ title: '', description: '', image: '', pictogram: '' });

// Firestore stores steps as { 1: {Titulo, Instrucciones, Imagen, Pictograma}, 2: … }
export const stepsFromFirestore = (pasos = {}) => Object.keys(pasos)
  .sort((a, b) => Number(a) - Number(b))
  .map((k) => ({
    title: pasos[k].Titulo || '',
    description: pasos[k].Instrucciones || '',
    image: pasos[k].Imagen || '',
    pictogram: pasos[k].Pictograma || '',
  }));

const uploadIfLocal = async (uri) => {
  if (!uri || uri.startsWith('http')) return uri || '';
  try {
    const result = await uploadStepImageToCloudinary(uri);
    return result.secure_url;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    notify('Imagen no subida', 'No se pudo subir una imagen; el paso se guardará sin ella.');
    return '';
  }
};

export const stepsToFirestore = async (steps) => {
  const pasos = {};
  for (let i = 0; i < steps.length; i += 1) {
    const s = steps[i];
    pasos[i + 1] = {
      Titulo: s.title.trim(),
      Instrucciones: s.description.trim(),
      Imagen: await uploadIfLocal(s.image),
      Pictograma: await uploadIfLocal(s.pictogram),
    };
  }
  return pasos;
};

export const validateSteps = (steps) => {
  const filled = steps.filter((s) => s.title.trim());
  if (filled.length === 0) return 'Añade al menos un paso con título.';
  if (filled.length !== steps.length) return 'Todos los pasos necesitan un título.';
  return null;
};

async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    notify('Permiso necesario', 'Hace falta permiso para acceder a la galería.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}

function ImageSlot({ label, uri, onChange }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={uri ? `Cambiar ${label}` : `Añadir ${label}`}
      onPress={async () => {
        const picked = await pickImage();
        if (picked) onChange(picked);
      }}
      style={styles.slot}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.slotImage} resizeMode="cover" />
      ) : (
        <Icon name="image-outline" size={ms(32)} color={colors.textMuted} />
      )}
      <Text style={styles.slotLabel}>{uri ? `Cambiar ${label}` : `+ ${label}`}</Text>
    </Pressable>
  );
}

export default function StepsEditor({ steps, onChange }) {
  const update = (index, patch) => onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const remove = (index) => onChange(steps.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <View style={{ gap: spacing.lg }}>
      {steps.map((step, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Card key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.badge}><Text style={styles.badgeText}>{index + 1}</Text></View>
            <Text style={styles.cardTitle}>Paso {index + 1}</Text>
            <IconButton icon="arrow-up" label="Subir paso" onPress={() => move(index, -1)} />
            <IconButton icon="arrow-down" label="Bajar paso" onPress={() => move(index, 1)} />
            {steps.length > 1 ? (
              <IconButton icon="trash-outline" label="Eliminar paso" color={colors.danger} background={colors.dangerSoft} onPress={() => remove(index)} />
            ) : null}
          </View>
          <Field label="Título" placeholder="p. ej. Lavarse las manos" value={step.title} onChangeText={(t) => update(index, { title: t })} />
          <Field
            label="Instrucciones"
            placeholder="Explica el paso con frases cortas"
            value={step.description}
            onChangeText={(t) => update(index, { description: t })}
            multiline
          />
          <View style={styles.slots}>
            <ImageSlot label="pictograma" uri={step.pictogram} onChange={(uri) => update(index, { pictogram: uri })} />
            <ImageSlot label="foto real" uri={step.image} onChange={(uri) => update(index, { image: uri })} />
          </View>
        </Card>
      ))}
      <AppButton label="Añadir paso" icon="add" variant="accent" onPress={() => onChange([...steps, emptyStep()])} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    width: ms(32),
    height: ms(32),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontWeight: '800', fontSize: font.small },
  cardTitle: { flex: 1, fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  slots: { flexDirection: 'row', gap: spacing.md },
  slot: {
    flex: 1,
    aspectRatio: 1.3,
    maxWidth: ms(200),
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    overflow: 'hidden',
  },
  slotImage: { ...StyleSheet.absoluteFillObject },
  slotLabel: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});
