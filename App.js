import React, { useEffect, useState } from 'react';
import { LogBox, Platform, StyleSheet, View } from 'react-native';
import AppNavigator from './navigator/AppNavigator';
import { MAX_LAYOUT_WIDTH } from './utils/responsive';

// Ignora todos los warnings
LogBox.ignoreAllLogs();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retraso para cargar la aplicación
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Pantalla de bienvenida breve
      setIsLoading(false); // Cambia el estado de carga
    };

    loadData();
  }, []);

  const app = <AppNavigator isLoading={isLoading} />;

  // The UI targets tablets: on a desktop browser show it as a centred tablet-width column.
  if (Platform.OS !== 'web') return app;
  return (
    <View style={styles.webBackground}>
      <View style={styles.webFrame}>{app}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackground: { flex: 1, alignItems: 'center', backgroundColor: '#DCE6F2' },
  webFrame: { flex: 1, width: '100%', maxWidth: MAX_LAYOUT_WIDTH, backgroundColor: '#ffffff', overflow: 'hidden', boxShadow: '0 0 24px rgba(16, 42, 84, 0.12)' },
});
