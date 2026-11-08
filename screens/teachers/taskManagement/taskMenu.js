import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { colors, font, spacing } from '../../../utils/theme';
import { notify } from '../../../utils/notify';
import { Card, ChipGroup, CreateButtons, Screen, Subtitle, Title } from '../../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const CLASSES = ['ClaseA', 'ClaseB', 'ClaseC', 'ClaseD'];
const MENU_OPTIONS = ['Menu', 'Sin Carne', 'Triturado', 'Fruta Triturada', 'Yogur Natillas', 'Fruta'];

const emptyMenu = () => ({
  Menu1: ['../../../images/Menu.png', 'Menu', 0],
  Menu2: ['../../../images/NoCarne.png', 'Sin Carne', 0],
  Menu3: ['../../../images/Triturado.png', 'Triturado', 0],
  Menu4: ['../../../images/FrutaTriturada.png', 'Fruta Triturada', 0],
  Menu5: ['../../../images/yogur_natillas.png', 'Yogur Natillas', 0],
  Menu6: ['../../../images/Fruta.png', 'Fruta', 0],
});

export default function TaskMenu() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Tarea de menú' });
  }, [navigation]);

  const saveTaskInDB = async () => {
    if (selected.length === 0) {
      notify('Faltan datos', 'Selecciona al menos una clase.');
      return null;
    }
    const taskData = { tipoTarea: 'Tarea Menu', titulo: 'Solicitar la comanda del menú del día', Clases: {} };
    selected.forEach((name) => { taskData.Clases[name] = emptyMenu(); });
    setSaving(true);
    try {
      return await addDoc(collection(db, 'Tareas'), taskData);
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
      <Title align="left">Menú del comedor</Title>
      <Subtitle align="left">
        El alumno irá a cada clase y anotará cuántos menús de cada tipo quieren.
      </Subtitle>
      <Card style={styles.section}>
        <Text style={styles.label}>¿En qué clases preguntará?</Text>
        <ChipGroup
          multiple
          options={CLASSES.map((c) => ({ id: c, label: c.replace('Clase', 'Clase ') }))}
          value={selected}
          onChange={setSelected}
        />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.label}>Menús incluidos</Text>
        <Text style={styles.muted}>{MENU_OPTIONS.join(' · ')}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  label: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  muted: { fontSize: font.body, color: colors.textMuted },
});
