import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { ms } from '../../../utils/responsive';
import { colors, font, radius, spacing } from '../../../utils/theme';
import { notify } from '../../../utils/notify';
import {
  AppButton, Card, CreateButtons, Field, IconButton, ListItem, Screen, Title,
} from '../../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const MATERIALS = {
  Lapices: { label: 'Lápices', image: require('../../../images/lápiz.png') },
  Pinceles: { label: 'Pinceles', image: require('../../../images/pincel.png') },
  Gomas: { label: 'Gomas', image: require('../../../images/goma.png') },
  Celo: { label: 'Celo', image: require('../../../images/celo.png') },
  Témpera: { label: 'Témpera', image: require('../../../images/tempera.png') },
  Pegamento: { label: 'Pegamento', image: require('../../../images/pegamento.png') },
  Tijeras: { label: 'Tijeras', image: require('../../../images/tijeras.png') },
  Plastilina: { label: 'Plastilina', image: require('../../../images/plastilina.png') },
  Cartulina: { label: 'Cartulina', image: require('../../../images/cartulina.png') },
  Anillas: { label: 'Anillas', image: require('../../../images/anillas.png') },
};

export default function MaterialTaskTeacher({ navigation }) {
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [descripcion, setDescripcion] = useState('');
  const [materials, setMaterials] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Tarea de material' });
  }, [navigation]);

  const addMaterial = () => {
    const cantidad = parseInt(quantity, 10);
    if (!selectedMaterial || !cantidad) {
      notify('Faltan datos', 'Elige un material y una cantidad.');
      return;
    }
    setMaterials((prev) => ({ ...prev, [selectedMaterial]: { quantity: cantidad, descripcion } }));
    setSelectedMaterial('');
    setQuantity('1');
    setDescripcion('');
  };

  const removeMaterial = (key) => setMaterials((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  const saveTaskInDB = async () => {
    const keys = Object.keys(materials);
    if (keys.length === 0) {
      notify('Lista vacía', 'Añade al menos un material.');
      return null;
    }
    const materiales = {};
    keys.forEach((k) => {
      materiales[k] = { Cantidad: materials[k].quantity, Descripcion: materials[k].descripcion };
    });
    setSaving(true);
    try {
      return await addDoc(collection(db, 'Tareas'), {
        materiales,
        tipoTarea: 'Recogida de material',
        titulo: 'Recogida de material',
      });
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      notify('Error', 'No se pudo guardar la tarea.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const create = async (assign) => {
    const ref = await saveTaskInDB();
    if (!ref) return;
    if (assign) navigation.navigate('TaskAssignment', { taskId: ref.id });
    else navigation.navigate('ShowTasks');
  };

  const added = Object.keys(materials);

  return (
    <Screen footer={<CreateButtons onCreate={create} loading={saving} />}>
      <Title align="left">Recoger material</Title>

      <Card style={styles.section}>
        <Text style={styles.label}>1 · Elige el material</Text>
        <View style={styles.grid}>
          {Object.entries(MATERIALS).map(([key, m]) => {
            const active = selectedMaterial === key;
            const already = added.includes(key);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={m.label}
                onPress={() => setSelectedMaterial(key)}
                style={[styles.tile, active && styles.tileActive, already && !active && styles.tileAdded]}
              >
                <Image source={m.image} style={styles.tileImage} resizeMode="contain" />
                <Text style={styles.tileText}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.row}>
          <View style={{ width: ms(120) }}>
            <Field
              label="Cantidad"
              value={quantity}
              onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Detalle (opcional)" placeholder="p. ej. de punta redonda" value={descripcion} onChangeText={setDescripcion} />
          </View>
        </View>
        <AppButton label="Añadir a la lista" icon="add" variant="accent" onPress={addMaterial} />
      </Card>

      <Text style={styles.label}>2 · Lista ({added.length})</Text>
      {added.length === 0 ? <Text style={styles.muted}>Todavía no has añadido material.</Text> : null}
      {added.map((key) => (
        <ListItem
          key={key}
          image={MATERIALS[key]?.image}
          title={`${materials[key].quantity} × ${MATERIALS[key]?.label || key}`}
          subtitle={materials[key].descripcion}
          actions={<IconButton icon="close" label={`Quitar ${key}`} color={colors.danger} background={colors.dangerSoft} onPress={() => removeMaterial(key)} />}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  label: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  muted: { fontSize: font.body, color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: ms(100),
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tileAdded: { borderColor: colors.success },
  tileImage: { width: ms(56), height: ms(56) },
  tileText: { fontSize: font.small, fontWeight: '600', color: colors.text },
});
