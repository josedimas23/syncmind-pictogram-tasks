import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../services/firebaseConfig';
import logo from '../../images/Logo2-SinFondo.png';
import { ms } from '../../utils/responsive';
import { colors, font, radius, spacing } from '../../utils/theme';
import { AppButton, Card, Field, Screen, Subtitle, Title } from '../../componentes/ui';

// Inicializa Firebase
initializeApp(firebaseConfig);

export default function LoginPage({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nombre || !contrasena) {
      setError('Escribe tu usuario y tu contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Busca el profesor en la colección "Profesores"
      const q = query(
        collection(getFirestore(), 'Profesores'),
        where('nombre', '==', nombre),
        where('contraseña', '==', contrasena)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setContrasena('');
        navigation.navigate('TeachersMainScreen');
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (e) {
      console.error('Error al iniciar sesión:', e.message);
      setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  return (
    <Screen center>
      <Image style={styles.logo} source={logo} resizeMode="contain" accessibilityLabel="SyncMind" />
      <Card style={styles.card}>
        <Title>Acceso profesorado</Title>
        <Subtitle>Gestiona alumnos y tareas</Subtitle>
        <Field
          label="Usuario"
          placeholder="Tu usuario"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="none"
          autoComplete="username"
        />
        <Field
          label="Contraseña"
          placeholder="Tu contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
          autoComplete="current-password"
          onSubmitEditing={handleLogin}
        />
        {error ? (
          <View style={styles.error}>
            <Icon name="alert-circle" size={ms(20)} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <AppButton label="Entrar" icon="log-in-outline" onPress={handleLogin} loading={loading} />
        <AppButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { width: ms(240), height: ms(64), alignSelf: 'center' },
  card: { gap: spacing.lg, padding: spacing.xl, width: '100%', maxWidth: 480, alignSelf: 'center' },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: font.small, fontWeight: '600', color: colors.danger },
});
