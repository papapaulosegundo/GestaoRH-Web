export const GENERO_OPTIONS = [
  { value: 'masculino',  label: 'Masculino' },
  { value: 'feminino',   label: 'Feminino' },
  { value: 'sem_genero', label: 'Prefiro não informar' },
]

export const TURNO_OPTIONS = [
  { value: 'matutino',   label: '🌅 Matutino' },
  { value: 'vespertino', label: '☀️ Vespertino' },
  { value: 'noturno',    label: '🌙 Noturno' },
]

// ── Labels de exibição (para tabelas, badges, etc.) ──────────

export const TURNO_LABEL = {
  matutino:   'Matutino',
  vespertino: 'Vespertino',
  noturno:    'Noturno',
}

export const GENERO_LABEL = {
  masculino:  'Masculino',
  feminino:   'Feminino',
  sem_genero: 'Não informado',
}

// ── Classes CSS de badge por turno ───────────────────────────

export const TURNO_BADGE = {
  matutino:   'badge-info',
  vespertino: 'badge-warn',
  noturno:    'badge-rh',
}

// ── Estilos padrão do react-select (design system) ───────────

export const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--gray-200)',
    borderWidth: '1.5px',
    borderRadius: '8px',
    padding: '2px 4px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    '&:hover': { borderColor: 'var(--primary)' },
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--primary-bg)' : '#fff',
    color: state.isSelected ? '#fff' : 'var(--gray-800)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
  }),
}

// ── Helper: converte lista de setores para options do react-select ──

export function setoresToOptions(setores) {
  return setores.map(s => ({ value: s.id, label: s.nome }))
}
