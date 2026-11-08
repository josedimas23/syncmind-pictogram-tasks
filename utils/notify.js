// Alert.alert does nothing in react-native-web, so on the web fall back to the
// browser's own dialogs. Same signature as Alert.alert for the common cases.
import { Alert, Platform } from 'react-native';

export function notify(title, message, buttons) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const actions = buttons || [];
  const confirm = actions.find((b) => b.style !== 'cancel' && b.onPress);
  const cancel = actions.find((b) => b.style === 'cancel');
  if (confirm && cancel) {
    // eslint-disable-next-line no-alert
    if (window.confirm(text)) confirm.onPress();
    else if (cancel.onPress) cancel.onPress();
    return;
  }
  // eslint-disable-next-line no-alert
  window.alert(text);
  if (confirm) confirm.onPress();
}
