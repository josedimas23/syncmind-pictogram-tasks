import React, { useEffect, useState, useCallback } from 'react';
import { getFirestore, doc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useFocusEffect } from '@react-navigation/native';
import { firebaseConfig } from '../../../services/firebaseConfig';
import { colors } from '../../../utils/theme';
import { notify } from '../../../utils/notify';
import {
  AppButton, EmptyState, IconButton, ListItem, Loading, Screen,
} from '../../../componentes/ui';

const avatarIcon = require('../../../images/avatar_1.png');

// Inicializa Firebase
initializeApp(firebaseConfig);

export default function UsersManagement({ navigation }) {
  const [usuarios, setUsuarios] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Alumnos' });
  }, [navigation]);

  const getUsuarios = async () => {
    try {
      const snapshot = await getDocs(collection(getFirestore(), 'Estudiantes'));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
      setUsuarios(list);
    } catch (error) {
      console.error('Error al obtener los usuarios: ', error);
      setUsuarios([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUsuarios();
    }, [])
  );

  const deleteUser = async (user) => {
    try {
      await deleteDoc(doc(getFirestore(), 'Estudiantes', user.id));
      setUsuarios((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error('Error al eliminar el alumno: ', error);
      notify('Error', 'No se pudo eliminar el alumno');
    }
  };

  const confirmDelete = (user) => notify(
    'Eliminar alumno',
    `¿Seguro que quieres eliminar a ${user.nombre}? No se puede deshacer.`,
    [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteUser(user) }],
  );

  if (usuarios === null) return <Loading />;

  return (
    <Screen
      footer={<AppButton label="Añadir alumno" icon="person-add" onPress={() => navigation.navigate('AddUser')} />}
    >
      {usuarios.length === 0 ? <EmptyState title="Aún no hay alumnos" message="Añade el primero con el botón de abajo." /> : null}
      {usuarios.map((item) => {
        const avatar = item.fotoAvatar ? { uri: item.fotoAvatar.uri || item.fotoAvatar } : avatarIcon;
        return (
          <ListItem
            key={item.id}
            title={item.nombre}
            subtitle={[item.edad ? `${item.edad} años` : null, item.preferenciasVista].filter(Boolean).join(' · ')}
            image={avatar}
            onPress={() => navigation.navigate('EditUser', { userId: item.id })}
            actions={(
              <>
                <IconButton icon="stats-chart" label={`Progreso de ${item.nombre}`} onPress={() => navigation.navigate('GraphicUser', { userId: item.id })} />
                <IconButton icon="create-outline" label={`Editar a ${item.nombre}`} onPress={() => navigation.navigate('EditUser', { userId: item.id })} />
                <IconButton icon="trash-outline" label={`Eliminar a ${item.nombre}`} color={colors.danger} background={colors.dangerSoft} onPress={() => confirmDelete(item)} />
              </>
            )}
          />
        );
      })}
    </Screen>
  );
}
