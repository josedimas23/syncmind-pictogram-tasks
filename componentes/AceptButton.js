import React, { useState } from 'react';
import { getFirestore, getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../services/firebaseConfig';
import { AppButton } from './ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const okImage = require('../images/fotocopias/hecho.png');

// Fecha en formato dd/mm/yyyy hh:mm:ss
const formatFechaSimple = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// "Hecho" button: marks the task as completed for the student, shows the
// positive-reinforcement screen and then returns to the student's task list.
export default function AceptButton({ prefPictograma, navigate, idStudent, idTarea, style }) {
  const [saving, setSaving] = useState(false);

  const markTaskAsDone = async () => {
    const studentDoc = await getDoc(doc(db, 'Estudiantes', idStudent));
    if (!studentDoc.exists()) return;
    const agendaTareas = studentDoc.data().agendaTareas || [];
    const updatedAgenda = agendaTareas.map((tarea) => (
      tarea.idTarea.id === idTarea ? { ...tarea, fechaCompletada: formatFechaSimple(new Date()) } : tarea
    ));
    await updateDoc(doc(db, 'Estudiantes', idStudent), {
      agendaTareas: updatedAgenda,
      tareasCompletadas: increment(1),
    });
  };

  const handlePress = async () => {
    setSaving(true);
    try {
      await markTaskAsDone();
    } catch (error) {
      console.error('Error al marcar la tarea como hecha: ', error);
    }
    navigate.navigate('RefuerzoPositivo');
    setTimeout(() => navigate.navigate('UserScreen', { studentId: idStudent }), 2500);
  };

  return (
    <AppButton
      label="Hecho"
      variant="success"
      size="lg"
      image={prefPictograma ? okImage : undefined}
      icon={prefPictograma ? undefined : 'checkmark-circle'}
      onPress={handlePress}
      loading={saving}
      style={[{ minWidth: 260 }, style]}
    />
  );
}
