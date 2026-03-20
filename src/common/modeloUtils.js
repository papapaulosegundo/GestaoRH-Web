// ── Categorias de modelo ──────────────────────────────────────
export const CATEGORIA_OPTIONS = [
  { value: 'admissao',            label: 'Admissão' },
  { value: 'desligamento',        label: 'Desligamento' },
  { value: 'beneficios',          label: 'Benefícios' },
  { value: 'medicina',            label: 'Medicina do Trabalho' },
  { value: 'compliance',          label: 'Compliance / Jurídico' },
  { value: 'atualizacao',         label: 'Atualização Cadastral' },
  { value: 'geral',               label: 'Geral' },
]

export const CATEGORIA_LABEL = {
  admissao:    'Admissão',
  desligamento:'Desligamento',
  beneficios:  'Benefícios',
  medicina:    'Medicina do Trabalho',
  compliance:  'Compliance / Jurídico',
  atualizacao: 'Atualização Cadastral',
  geral:       'Geral',
}

// ── Tipos de uso ─────────────────────────────────────────────
export const TIPO_USO_OPTIONS = [
  { value: 'individual', label: 'Individual (por funcionário)' },
  { value: 'lote',       label: 'Lote (por setor)' },
  { value: 'ambos',      label: 'Ambos' },
]

// ── Status do modelo ─────────────────────────────────────────
export const STATUS_BADGE = {
  rascunho:  'badge-warn',
  publicado: 'badge-active',
  arquivado: 'badge-inactive',
}

export const STATUS_LABEL = {
  rascunho:  'Rascunho',
  publicado: 'Publicado',
  arquivado: 'Arquivado',
}

// ── Tipos de seção ────────────────────────────────────────────
export const SECAO_TIPOS = [
  { value: 'texto',       label: 'Texto livre' },
  { value: 'campos',      label: 'Campos de formulário' },
  { value: 'assinaturas', label: 'Assinaturas' },
  { value: 'anexos',      label: 'Anexos' },
]

// ── Tipos de campo ────────────────────────────────────────────
export const CAMPO_TIPOS = [
  { value: 'texto_curto', label: 'Texto curto' },
  { value: 'texto_longo', label: 'Texto longo (área)' },
  { value: 'numero',      label: 'Número' },
  { value: 'data',        label: 'Data' },
  { value: 'email',       label: 'E-mail' },
  { value: 'telefone',    label: 'Telefone' },
  { value: 'cpf',         label: 'CPF' },
  { value: 'selecao',     label: 'Seleção única' },
  { value: 'multipla',    label: 'Múltipla escolha' },
  { value: 'checkbox',    label: 'Checkbox' },
  { value: 'upload',      label: 'Upload de arquivo' },
]

// ── Papéis de assinatura ──────────────────────────────────────
export const PAPEL_OPTIONS = [
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'rh',          label: 'RH / Responsável' },
  { value: 'chefe',       label: 'Chefe de Setor' },
]

export const PAPEL_LABEL = {
  funcionario: 'Funcionário',
  rh:          'RH / Responsável',
  chefe:       'Chefe de Setor',
}

// ── Biblioteca de variáveis (placeholders) ────────────────────
export const VARIAVEIS = [
  {
    grupo: 'Funcionário',
    itens: [
      { token: '{funcionario_nome}',       label: 'Nome completo',      origem: 'automatico', exemplo: 'João da Silva' },
      { token: '{funcionario_cpf}',        label: 'CPF',                origem: 'automatico', exemplo: '123.456.789-00' },
      { token: '{funcionario_email}',      label: 'E-mail',             origem: 'automatico', exemplo: 'joao@empresa.com' },
      { token: '{funcionario_telefone}',   label: 'Telefone',           origem: 'automatico', exemplo: '(47) 99999-0000' },
      { token: '{funcionario_turno}',      label: 'Turno',              origem: 'automatico', exemplo: 'Matutino' },
      { token: '{funcionario_genero}',     label: 'Gênero',             origem: 'automatico', exemplo: 'Masculino' },
      { token: '{funcionario_admissao}',   label: 'Data de admissão',   origem: 'automatico', exemplo: '01/03/2025' },
    ],
  },
  {
    grupo: 'Setor',
    itens: [
      { token: '{setor_nome}',             label: 'Nome do setor',      origem: 'automatico', exemplo: 'Financeiro' },
    ],
  },
  {
    grupo: 'Empresa',
    itens: [
      { token: '{empresa_razao_social}',   label: 'Razão Social',       origem: 'automatico', exemplo: 'Empresa Ltda.' },
      { token: '{empresa_cnpj}',           label: 'CNPJ',               origem: 'automatico', exemplo: '00.000.000/0001-00' },
      { token: '{empresa_endereco}',       label: 'Endereço',           origem: 'automatico', exemplo: 'Rua Exemplo, 123' },
      { token: '{empresa_telefone}',       label: 'Telefone',           origem: 'automatico', exemplo: '(47) 3333-0000' },
    ],
  },
  {
    grupo: 'Sistema',
    itens: [
      { token: '{data_atual}',             label: 'Data atual',         origem: 'automatico', exemplo: '19/03/2026' },
      { token: '{hora_atual}',             label: 'Hora atual',         origem: 'automatico', exemplo: '14:30' },
    ],
  },
  {
    grupo: 'Manual (RH preenche na geração)',
    itens: [
      { token: '{data_inicio_contrato}',   label: 'Data início contrato', origem: 'manual', exemplo: '01/04/2026' },
      { token: '{local_assinatura}',       label: 'Local de assinatura',  origem: 'manual', exemplo: 'Blumenau, SC' },
      { token: '{observacao}',             label: 'Observação',           origem: 'manual', exemplo: '' },
      { token: '{valor_salario}',          label: 'Salário',              origem: 'manual', exemplo: 'R$ 3.000,00' },
      { token: '{cargo_funcionario}',      label: 'Cargo',                origem: 'manual', exemplo: 'Analista' },
    ],
  },
]

// Todos os tokens numa lista plana (para busca rápida)
export const TODOS_TOKENS = VARIAVEIS.flatMap(g => g.itens)

// Substitui tokens de exemplo num texto para o preview
export function resolverPreview(texto) {
  if (!texto) return ''
  let resultado = texto
  TODOS_TOKENS.forEach(v => {
    resultado = resultado.replaceAll(v.token, `<strong>${v.exemplo || v.label}</strong>`)
  })
  return resultado
}

// ── Estilos padrão do react-select (igual ao utils.js) ───────
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