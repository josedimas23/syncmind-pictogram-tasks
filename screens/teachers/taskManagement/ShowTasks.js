import React, { useEffect, useState, useCallback } from 'react';
import { getFirestore, doc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useFocusEffect } from '@react-navigation/native';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { colors } from '../../../utils/theme';
import { notify } from '../../../utils/notify';
import { taskDetail } from '../../../utils/taskLabel';
import {
  AppButton, EmptyState, IconButton, ListItem, Loading, Screen,
} from '../../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);

const taskIcons = {
  'Tarea por pasos': require('../../../images/pasosLogo.png'),
  'Recogida de material': require('../../../images/tijeras.png'),
  Fotocopias: require('../../../images/fotocopias/fotocopia.png'),
  'Tarea Menu': require('../../../images/menú.png'),
};

export default function ShowTasks({ navigation }) {
  const [tareas, setTareas] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Tareas' });
  }, [navigation]);

  const getTareas = async () => {
    try {
      const snapshot = await getDocs(collection(getFirestore(), 'Tareas'));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.tipoTarea).localeCompare(String(b.tipoTarea)));
      setTareas(list);
    } catch (error) {
      console.error('Error al obtener las tareas: ', error);
      setTareas([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getTareas();
    }, [])
  );

  const deleteTask = async (task) => {
    try {
      await deleteDoc(doc(getFirestore(), 'Tareas', task.id));
      setTareas((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error('Error al eliminar la tarea: ', error);
      notify('Error', 'No se pudo eliminar la tarea');
    }
  };

  const confirmDelete = (task) => notify(
    'Eliminar tarea',
    `¿Seguro que quieres eliminar «${task.titulo}»? No se puede deshacer.`,
    [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteTask(task) }],
  );

  if (tareas === null) return <Loading />;

  return (
    <Screen
      footer={<AppButton label="Nueva tarea" icon="add-circle" onPress={() => navigation.navigate('AddTask')} />}
    >
      {tareas.length === 0 ? <EmptyState title="Aún no hay tareas" message="Crea la primera con el botón de abajo." /> : null}
      {tareas.map((item) => {
        const editable = item.tipoTarea === 'Tarea por pasos';
        return (
          <ListItem
            key={item.id}
            title={item.titulo}
            subtitle={taskDetail(item)}
            image={taskIcons[item.tipoTarea]}
            onPress={editable ? () => navigation.navigate('EditTask', { taskId: item.id }) : undefined}
            actions={(
              <>
                <IconButton icon="calendar-outline" label={`Asignar ${item.titulo}`} onPress={() => navigation.navigate('TaskAssignment', { taskId: item.id })} />
                {editable ? (
                  <IconButton icon="create-outline" label={`Editar ${item.titulo}`} onPress={() => navigation.navigate('EditTask', { taskId: item.id })} />
                ) : null}
                <IconButton icon="trash-outline" label={`Eliminar ${item.titulo}`} color={colors.danger} background={colors.dangerSoft} onPress={() => confirmDelete(item)} />
              </>
            )}
          />
        );
      })}
    </Screen>
  );
}
