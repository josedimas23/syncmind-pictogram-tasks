import React, { useEffect, useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { notify } from '../../../utils/notify';
import { AppButton, Screen } from '../../../componentes/ui';
import StudentForm, { emptyStudent, resolveAvatar, validateStudent } from '../../../componentes/StudentForm';

// Inicializa Firebase
initializeApp(firebaseConfig);

export default function AddUser({ navigation }) {
  const [student, setStudent] = useState(emptyStudent());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Nuevo alumno' });
  }, [navigation]);

  const save = async () => {
    const error = validateStudent(student);
    if (error) {
      notify('Faltan datos', error);
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(getFirestore(), 'Estudiantes'), {
        nombre: student.nombre.trim(),
        edad: String(student.edad),
        preferenciasVista: student.preferenciasVista,
        fotoAvatar: await resolveAvatar(student.fotoAvatar),
        tareasCompletadas: 0,
        contrasenaVisual: student.contrasenaVisual,
      });
      navigation.navigate('UsersManagement');
    } catch (e) {
      console.error('Error al agregar el alumno: ', e);
      notify('Error', 'No se pudo guardar el alumno.');
    }
    setSaving(false);
  };

  return (
    <Screen footer={<AppButton label="Guardar alumno" icon="checkmark" onPress={save} loading={saving} style={{ minWidth: 240 }} />}>
      <StudentForm value={student} onChange={setStudent} />
    </Screen>
  );
}
