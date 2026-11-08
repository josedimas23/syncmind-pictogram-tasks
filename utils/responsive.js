// Shared sizing helpers. The UI was designed for tablets in portrait, so on wider
// screens (desktop browsers) the layout width is capped and the app is centred
// (see App.js) instead of scaling every element up with the window.
import { Dimensions } from 'react-native';

export const MAX_LAYOUT_WIDTH = 820;

export const width = Math.min(Dimensions.get('window').width, MAX_LAYOUT_WIDTH);

// Gentle scaling for the design system: about 0.8x on phones, 1.0x at 600 px
// and about 1.2x on tablets, so text and touch targets stay comfortable.
export const ms = (size) => Math.round(size * (1 + (width / 600 - 1) * 0.5));
