import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { getViewMode } from '../../../utils/preferences';
import { notify } from '../../../utils/notify';
import { AppButton, EmptyState, Loading, Screen } from '../../../componentes/ui';
import StudentForm, { resolveAvatar, validateStudent } from '../../../componentes/StudentForm';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const modeToPreference = { texto: 'Texto', real: 'Imagenes reales', pictograma: 'Pictograma' };

export default function EditUser({ navigation, route }) {
  const { userId } = route.params;
  const [student, setStudent] = useState(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Editar alumno' });
  }, [navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'Estudiantes', userId));
        if (!userDoc.exists()) {
          setStudent(null);
          return;
        }
        const d = userDoc.data();
        setStudent({
          nombre: d.nombre || '',
          edad: d.edad || '',
          preferenciasVista: modeToPreference[getViewMode(d.preferenciasVista)],
          fotoAvatar: typeof d.fotoAvatar === 'string' ? d.fotoAvatar : d.fotoAvatar?.uri || null,
          contrasenaVisual: Array.isArray(d.contrasenaVisual) ? d.contrasenaVisual : ['0', '5'],
        });
      } catch (error) {
        console.error('Error al cargar el alumno:', error);
        setStudent(null);
      }
    };
    load();
  }, [userId]);

  const save = async () => {
    const error = validateStudent(student);
    if (error) {
      notify('Faltan datos', error);
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'Estudiantes', userId), {
        nombre: student.nombre.trim(),
        edad: String(student.edad),
        preferenciasVista: student.preferenciasVista,
        fotoAvatar: await resolveAvatar(student.fotoAvatar),
        contrasenaVisual: student.contrasenaVisual,
      });
      navigation.navigate('UsersManagement');
    } catch (e) {
      console.error('Error al actualizar el alumno:', e);
      notify('Error', 'No se pudieron guardar los cambios.');
    }
    setSaving(false);
  };

  if (student === undefined) return <Loading />;
  if (student === null) return <Screen center><EmptyState title="No se encontró el alumno" /></Screen>;

  return (
    <Screen footer={<AppButton label="Guardar cambios" icon="save-outline" onPress={save} loading={saving} style={{ minWidth: 240 }} />}>
      <StudentForm value={student} onChange={setStudent} />
    </Screen>
  );
}
