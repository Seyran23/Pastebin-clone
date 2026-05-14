export const customSelectStyles = {
  control: (base: object) => ({
    ...base,
    backgroundColor: '#27272a',
    borderColor: '#52525b',
    minHeight: '2.25rem',
    fontSize: '0.875rem',
    boxShadow: 'none',
  }),
  menu: (base: object) => ({ ...base, backgroundColor: '#27272a', zIndex: 100 }),
  option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#3f3f46' : '#27272a',
    color: '#fff',
    fontSize: '0.875rem',
  }),
  singleValue: (base: object) => ({ ...base, color: '#e4e4e7' }),
  placeholder: (base: object) => ({ ...base, color: '#71717a' }),
  input: (base: object) => ({ ...base, color: '#e4e4e7' }),
};
