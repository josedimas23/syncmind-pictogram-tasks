import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { colors, font, spacing } from '../../../utils/theme';
import { notify } from '../../../utils/notify';
import { Card, ChipGroup, CreateButtons, Field, Screen, Title } from '../../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

export default function TaskFotocopias({ navigation }) {
  const [tipo, setTipo] = useState('Fotocopia');
  const [color, setColor] = useState('Blanco y negro');
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Tarea de fotocopias' });
  }, [navigation]);

  const saveTaskInDB = async () => {
    const cantidad = parseInt(quantity, 10);
    if (!cantidad || cantidad < 1) {
      notify('Faltan datos', 'Indica cuántas copias hacen falta.');
      return null;
    }
    setSaving(true);
    try {
      return await addDoc(collection(db, 'Tareas'), {
        cantidad,
        tipo,
        tipoColor: color,
        tipoTarea: 'Fotocopias',
        titulo: 'Fotocopias/Plastificado',
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

  return (
    <Screen footer={<CreateButtons onCreate={create} loading={saving} />}>
      <Title align="left">Fotocopias o plastificado</Title>
      <Card style={styles.section}>
        <Text style={styles.label}>¿Qué hay que hacer?</Text>
        <ChipGroup options={['Fotocopia', 'Plastificado']} value={tipo} onChange={setTipo} />
      </Card>
      <Card style={styles.section}>
        <Field
          label="¿Cuántas?"
          value={quantity}
          onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="Número de copias"
        />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.label}>Color</Text>
        <ChipGroup options={['Blanco y negro', 'Color']} value={color} onChange={setColor} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  label: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
});
