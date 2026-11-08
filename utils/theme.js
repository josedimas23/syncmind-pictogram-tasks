// Design tokens shared by every screen. The palette keeps the app's original
// identity (blue header, yellow and green actions) with stronger contrast and
// calmer backgrounds, which suits students who rely on pictograms.
import { Platform } from 'react-native';
import { ms } from './responsive';

export const colors = {
  primary: '#1565C0',
  primaryDark: '#0D47A1',
  primarySoft: '#E3EEFB',
  background: '#F2F6FB',
  surface: '#FFFFFF',
  border: '#D3E0F0',
  text: '#16202E',
  textMuted: '#5B6B82',
  accent: '#FFD54F',
  accentSoft: '#FFF6D6',
  success: '#2E7D32',
  successSoft: '#E6F4EA',
  danger: '#C62828',
  dangerSoft: '#FDECEC',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const font = {
  hero: ms(30),
  title: ms(24),
  subtitle: ms(19),
  body: ms(17),
  small: ms(14),
};

export const shadow = Platform.select({
  web: { boxShadow: '0 2px 10px rgba(16, 42, 84, 0.08)' },
  default: {
    shadowColor: '#102A54',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

// Header used by every stack screen (see navigator/AppNavigator.js).
export const headerOptions = {
  headerStyle: { backgroundColor: colors.primary, height: ms(64) },
  headerShadowVisible: false,
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700', fontSize: ms(20) },
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  cardStyle: { flex: 1, backgroundColor: colors.background },
};
