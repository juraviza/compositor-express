import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar letras...', onSubmit }: Props) {
  return (
    <View style={styles.wrap}>
      <MaterialIcons name="search" size={20} color={colors.textSecondary} />
      <TextInput
        value={value ?? ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, height: 48 },
  input: { flex: 1, color: colors.textPrimary, marginLeft: spacing.sm, fontSize: 15, height: '100%' },
});
