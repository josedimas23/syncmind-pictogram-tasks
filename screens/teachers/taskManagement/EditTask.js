import React, { useEffect, useState } from 'react';
import { getFirestore, getDoc, doc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { notify } from '../../../utils/notify';
import { AppButton, Card, EmptyState, Field, Loading, Screen, Title } from '../../../componentes/ui';
import StepsEditor, { emptyStep, stepsFromFirestore, stepsToFirestore, validateSteps } from '../../../componentes/StepsEditor';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

export default function EditTask({ navigation, route }) {
  const { taskId } = route.params;
  const [titulo, setTitulo] = useState('');
  const [steps, setSteps] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Editar tarea' });
  }, [navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        const taskDoc = await getDoc(doc(db, 'Tareas', taskId));
        if (!taskDoc.exists()) {
          setSteps([]);
          return;
        }
        const data = taskDoc.data();
        setTitulo(data.titulo || '');
        const loaded = stepsFromFirestore(data.pasos);
        setSteps(loaded.length ? loaded : [emptyStep()]);
      } catch (error) {
        console.error('Error al obtener los datos de la tarea:', error);
        setSteps([]);
      }
    };
    load();
  }, [taskId]);

  const save = async () => {
    const error = validateSteps(steps);
    if (error) {
      notify('Faltan datos', error);
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'Tareas', taskId), {
        pasos: await stepsToFirestore(steps),
        tipoTarea: 'Tarea por pasos',
        titulo: titulo.trim() || 'Tarea por pasos',
      });
      navigation.navigate('ShowTasks');
    } catch (e) {
      console.error('Error al actualizar la tarea:', e);
      notify('Error', 'No se pudo guardar la tarea.');
    }
    setSaving(false);
  };

  if (steps === null) return <Loading />;
  if (steps.length === 0) return <Screen center><EmptyState title="No se encontró la tarea" /></Screen>;

  return (
    <Screen footer={<AppButton label="Guardar cambios" icon="save-outline" onPress={save} loading={saving} style={{ minWidth: 240 }} />}>
      <Title align="left">Editar tarea por pasos</Title>
      <Card>
        <Field label="Nombre de la tarea" value={titulo} onChangeText={setTitulo} />
      </Card>
      <StepsEditor steps={steps} onChange={setSteps} />
    </Screen>
  );
}
