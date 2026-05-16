export const getSelectStyles = (isDark: boolean) => ({
  control: (base: object) => ({
    ...base,
    backgroundColor: isDark ? '#27272a' : '#fafafa',
    borderColor: isDark ? '#52525b' : '#d4d4d8',
    minHeight: '2.25rem',
    fontSize: '0.875rem',
    boxShadow: 'none',
  }),
  menu: (base: object) => ({
    ...base,
    backgroundColor: isDark ? '#27272a' : '#fafafa',
    zIndex: 100,
  }),
  option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
        ? isDark ? '#3f3f46' : '#e4e4e7'
        : isDark ? '#27272a' : '#fafafa',
    color: isDark ? '#fff' : '#18181b',
    fontSize: '0.875rem',
  }),
  singleValue: (base: object) => ({ ...base, color: isDark ? '#e4e4e7' : '#18181b' }),
  placeholder: (base: object) => ({ ...base, color: isDark ? '#71717a' : '#a1a1aa' }),
  input: (base: object) => ({ ...base, color: isDark ? '#e4e4e7' : '#18181b' }),
});
