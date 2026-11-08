import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { addDays, format, isValid, parse } from 'date-fns';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { colors, font, spacing } from '../../../utils/theme';
import { notify } from '../../../utils/notify';
import { taskLabel } from '../../../utils/taskLabel';
import {
  AppButton, Card, ChipGroup, Field, FieldLabel, Loading, Screen,
} from '../../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

const quickDates = [
  { id: '0', label: 'Hoy', days: 0 },
  { id: '1', label: 'Mañana', days: 1 },
  { id: '3', label: 'En 3 días', days: 3 },
  { id: '7', label: 'En una semana', days: 7 },
];

export default function TaskAssignment({ navigation, route }) {
  const { taskId } = route.params || {};
  const [tasks, setTasks] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(taskId || '');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dateText, setDateText] = useState(format(addDays(new Date(), 3), 'dd/MM/yyyy'));
  const [searchTask, setSearchTask] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Asignar tarea' });
  }, [navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        const [taskSnap, studentSnap] = await Promise.all([
          getDocs(collection(db, 'Tareas')),
          getDocs(collection(db, 'Estudiantes')),
        ]);
        setTasks(taskSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStudents(studentSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre))));
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setTasks([]);
      }
    };
    load();
  }, []);

  const parsedDate = parse(dateText, 'dd/MM/yyyy', new Date());
  const dateOk = isValid(parsedDate) && dateText.length === 10;

  const assignTask = async () => {
    if (!selectedTask || selectedStudents.length === 0 || !dateOk) {
      notify('Faltan datos', 'Elige una tarea, al menos un alumno y una fecha válida (DD/MM/AAAA).');
      return;
    }
    setSaving(true);
    try {
      const taskRef = doc(db, 'Tareas', selectedTask);
      await Promise.all(selectedStudents.map((studentId) => {
        const student = students.find((s) => s.id === studentId);
        return updateDoc(doc(db, 'Estudiantes', studentId), {
          agendaTareas: [
            ...(student.agendaTareas || []),
            { idTarea: taskRef, fechaInicio: new Date(), fechaLimite: parsedDate },
          ],
        });
      }));
      notify('Tarea asignada', `Asignada a ${selectedStudents.length} alumno(s).`);
      navigation.navigate('ShowTasks');
    } catch (error) {
      console.error('Error al asignar tarea:', error);
      notify('Error', 'No se pudo asignar la tarea.');
    }
    setSaving(false);
  };

  if (tasks === null) return <Loading />;

  const visibleTasks = tasks.filter((t) => taskLabel(t).toLowerCase().includes(searchTask.toLowerCase()));

  return (
    <Screen
      footer={<AppButton label="Asignar" icon="checkmark" onPress={assignTask} loading={saving} style={{ minWidth: 240 }} />}
    >
      <Card style={styles.section}>
        <Text style={styles.step}>1 · Tarea</Text>
        <Field placeholder="Buscar tarea…" value={searchTask} onChangeText={setSearchTask} />
        <ChipGroup
          options={visibleTasks.map((t) => ({ id: t.id, label: taskLabel(t) }))}
          value={selectedTask}
          onChange={setSelectedTask}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.step}>2 · Alumnos</Text>
        <ChipGroup
          multiple
          options={students.map((s) => ({ id: s.id, label: s.nombre }))}
          value={selectedStudents}
          onChange={setSelectedStudents}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.step}>3 · Fecha límite</Text>
        <ChipGroup
          options={quickDates.map((q) => ({ id: q.id, label: q.label }))}
          value={quickDates.find((q) => format(addDays(new Date(), q.days), 'dd/MM/yyyy') === dateText)?.id}
          onChange={(id) => setDateText(format(addDays(new Date(), Number(id)), 'dd/MM/yyyy'))}
        />
        <FieldLabel>O escríbela</FieldLabel>
        <Field
          placeholder="DD/MM/AAAA"
          value={dateText}
          onChangeText={setDateText}
          hint={dateOk ? undefined : 'Formato: DD/MM/AAAA'}
          style={!dateOk ? { borderColor: colors.danger } : undefined}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  step: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
});
