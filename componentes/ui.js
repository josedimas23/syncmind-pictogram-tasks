// Small shared UI kit: screen layout, buttons, cards and headings.
import React from 'react';
import {
  ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { colors, font, radius, shadow, spacing } from '../utils/theme';
import { ms } from '../utils/responsive';

// Scrollable page with consistent padding. `footer` stays pinned at the bottom.
export function Screen({ children, footer, scroll = true, center = false, contentStyle }) {
  const content = [styles.content, center && styles.contentCenter, contentStyle];
  return (
    <View style={styles.screen}>
      {scroll ? (
        <ScrollView contentContainerStyle={content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[content, { flex: 1 }]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

export function Title({ children, align = 'center', style }) {
  return <Text style={[styles.title, { textAlign: align }, style]}>{children}</Text>;
}

export function Subtitle({ children, align = 'center', style }) {
  return <Text style={[styles.subtitle, { textAlign: align }, style]}>{children}</Text>;
}

const buttonVariants = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  accent: { bg: colors.accent, fg: colors.text, border: colors.accent },
  success: { bg: colors.success, fg: colors.white, border: colors.success },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
  secondary: { bg: colors.surface, fg: colors.primary, border: colors.primary },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
};

export function AppButton({
  label, onPress, variant = 'primary', icon, image, size = 'md', disabled, loading, style, textStyle,
}) {
  const v = buttonVariants[variant];
  const large = size === 'lg';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        large && styles.buttonLarge,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : null}
      {!loading && image ? <Image source={image} style={large ? styles.buttonImageLarge : styles.buttonImage} resizeMode="contain" /> : null}
      {!loading && icon ? <Icon name={icon} size={large ? ms(30) : ms(22)} color={v.fg} /> : null}
      {label ? (
        <Text style={[styles.buttonText, large && styles.buttonTextLarge, { color: v.fg }, textStyle]}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

// White rounded container. Pass onPress to make the whole card tappable.
export function Card({ children, onPress, style, selected, accessibilityLabel }) {
  const cardStyle = [styles.card, selected && styles.cardSelected, style];
  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

export function EmptyState({ image, title, message }) {
  return (
    <View style={styles.empty}>
      {image ? <Image source={image} style={styles.emptyImage} resizeMode="contain" /> : null}
      {title ? <Title>{title}</Title> : null}
      {message ? <Subtitle>{message}</Subtitle> : null}
    </View>
  );
}

export function Loading({ label = 'Cargando…' }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

// Labelled text input for teacher forms.
export function Field({ label, hint, style, ...inputProps }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, inputProps.multiline && styles.inputMultiline, style]}
        {...inputProps}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

// Label above any custom control (pickers, selectors…).
export function FieldLabel({ children }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

// Row of selectable chips (single or multiple choice).
export function ChipGroup({ options, value, onChange, multiple = false }) {
  const selected = multiple ? value || [] : [value];
  const toggle = (id) => {
    if (!multiple) return onChange(id);
    return onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);
  };
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = selected.includes(id);
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => toggle(id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            {active ? <Icon name="checkmark" size={ms(16)} color={colors.white} /> : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Tappable list row used in management screens (title, subtitle, actions).
export function ListItem({ title, subtitle, image, onPress, actions }) {
  return (
    <Card onPress={onPress} style={styles.listItem} accessibilityLabel={title}>
      {image ? <Image source={image} style={styles.listImage} resizeMode="cover" /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.listTitle} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.listSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={styles.listActions}>{actions}</View> : null}
    </Card>
  );
}

export function IconButton({ icon, label, onPress, color = colors.primary, background = colors.primarySoft }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: background }, pressed && styles.pressed]}
    >
      <Icon name={icon} size={ms(22)} color={color} />
    </Pressable>
  );
}

// Compact pill for header actions (e.g. "Salir").
export function HeaderButton({ label, icon, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      {icon ? <Icon name={icon} size={ms(20)} color={colors.white} /> : null}
      {label ? <Text style={styles.headerButtonText}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  contentCenter: { justifyContent: 'center' },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  title: { fontSize: font.title, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: font.body, color: colors.textMuted },
  button: {
    minHeight: ms(52),
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonLarge: { minHeight: ms(76), paddingHorizontal: spacing.xxl, borderRadius: radius.lg },
  buttonText: { fontSize: font.body, fontWeight: '700' },
  buttonTextLarge: { fontSize: font.title },
  buttonImage: { width: ms(28), height: ms(28) },
  buttonImageLarge: { width: ms(56), height: ms(56) },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow,
  },
  cardSelected: { borderColor: colors.success, backgroundColor: colors.successSoft },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  emptyImage: { width: ms(180), height: ms(180) },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxl },
  loadingText: { fontSize: font.body, color: colors.textMuted },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerButtonText: { color: colors.white, fontWeight: '700', fontSize: font.small },
  field: { gap: spacing.xs, width: '100%' },
  fieldLabel: { fontSize: font.small, fontWeight: '700', color: colors.text },
  fieldHint: { fontSize: font.small, color: colors.textMuted },
  input: {
    minHeight: ms(50),
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: font.body,
    color: colors.text,
  },
  inputMultiline: { minHeight: ms(96), paddingTop: spacing.md, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.body, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.white },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  listImage: { width: ms(56), height: ms(56), borderRadius: radius.md, backgroundColor: colors.primarySoft },
  listTitle: { fontSize: font.body, fontWeight: '700', color: colors.text },
  listSubtitle: { fontSize: font.small, color: colors.textMuted },
  listActions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: { width: ms(44), height: ms(44), borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});

// Footer actions for task-creation forms.
export function CreateButtons({ onCreate, loading }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' }}>
      <AppButton label="Solo crear" variant="secondary" onPress={() => onCreate(false)} disabled={loading} />
      <AppButton label="Crear y asignar" icon="calendar" onPress={() => onCreate(true)} loading={loading} />
    </View>
  );
}
