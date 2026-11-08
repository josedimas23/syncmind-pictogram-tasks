import React, { useEffect, useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { notify } from '../../../utils/notify';
import { Card, CreateButtons, Field, Screen, Title } from '../../../componentes/ui';
import StepsEditor, { emptyStep, stepsToFirestore, validateSteps } from '../../../componentes/StepsEditor';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

export default function StepsTask({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [steps, setSteps] = useState([emptyStep()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Tarea por pasos' });
  }, [navigation]);

  const saveTaskInDB = async () => {
    const error = validateSteps(steps);
    if (error) {
      notify('Faltan datos', error);
      return null;
    }
    setSaving(true);
    try {
      return await addDoc(collection(db, 'Tareas'), {
        pasos: await stepsToFirestore(steps),
        tipoTarea: 'Tarea por pasos',
        titulo: titulo.trim() || 'Tarea por pasos',
      });
    } catch (e) {
      console.error('Error al guardar la tarea:', e);
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
      <Title align="left">Nueva tarea por pasos</Title>
      <Card>
        <Field label="Nombre de la tarea" placeholder="p. ej. Preparar la mochila" value={titulo} onChangeText={setTitulo} />
      </Card>
      <StepsEditor steps={steps} onChange={setSteps} />
    </Screen>
  );
}
