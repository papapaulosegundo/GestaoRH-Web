import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { funcionarioService, setorService } from '../../services/services'

function maskCpf(v) {
  return v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function maskPhone(v) {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

const GENERO_OPTIONS = [
  { value: 'masculino',  label: 'Masculino' },
  { value: 'feminino',   label: 'Feminino' },
  { value: 'sem_genero', label: 'Prefiro não informar' },
]

const TURNO_OPTIONS = [
  { value: 'matutino',   label: '🌅 Matutino' },
  { value: 'vespertino', label: '☀️ Vespertino' },
  { value: 'noturno',    label: '🌙 Noturno' },
]

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--gray-200)',
    borderWidth: '1.5px',
    borderRadius: '8px',
    padding: '2px 4px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    '&:hover': { borderColor: 'var(--primary)' }
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--primary-bg)' : '#fff',
    color: state.isSelected ? '#fff' : 'var(--gray-800)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
  })
}

export default function FuncionarioForm() {
  const navigate       = useNavigate()
  const { id }         = useParams()
  const isEdit         = !!id

  const [setores, setSetores]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [senhaGerada, setSenhaGerada] = useState('')

  // Select state
  const [generoSel, setGeneroSel] = useState(null)
  const [turnoSel,  setTurnoSel]  = useState(null)
  const [setorSel,  setSetorSel]  = useState(null)

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm()

  // Carrega setores
  useEffect(() => {
    setorService.listar().then(res => {
      setSetores(res.data.map(s => ({ value: s.id, label: s.nome })))
    })
  }, [])

  // Se edição: carrega dados do funcionário
  useEffect(() => {
    if (!isEdit) return
    funcionarioService.obterPorId(id).then(res => {
      const f = res.data
      setValue('nome',     f.nome)
      setValue('cpf',      f.cpf)
      setValue('telefone', f.telefone)
      setValue('email',    f.email)
      setGeneroSel(GENERO_OPTIONS.find(o => o.value === f.genero) ?? null)
      setTurnoSel(TURNO_OPTIONS.find(o => o.value === f.turno) ?? null)
      const setorOpt = { value: f.setorId, label: f.nomeSetor }
      setSetorSel(setorOpt)
      setLoadingData(false)
    }).catch(() => {
      toast.error('Erro ao carregar funcionário.')
      navigate('/funcionarios')
    })
  }, [id, isEdit])

  const onSubmit = async (data) => {
    if (!generoSel) return toast.error('Selecione o gênero.')
    if (!turnoSel)  return toast.error('Selecione o turno.')
    if (!setorSel)  return toast.error('Selecione o setor.')

    setLoading(true)
    try {
      const payload = {
        nome:     data.nome,
        telefone: data.telefone,
        email:    data.email,
        genero:   generoSel.value,
        turno:    turnoSel.value,
        setorId:  setorSel.value,
      }

      if (isEdit) {
        await funcionarioService.atualizar(id, payload)
        toast.success('Funcionário atualizado com sucesso!')
        navigate('/funcionarios')
      } else {
        const res = await funcionarioService.cadastrar({ ...payload, cpf: data.cpf })
        setSenhaGerada(res.data.senhaTemporaria)
        toast.success('Funcionário cadastrado!')
        reset()
        setGeneroSel(null); setTurnoSel(null); setSetorSel(null)
      }
    } catch (err) {
      toast.error(err.response?.data ?? 'Erro ao salvar funcionário.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>{isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}</h1>
          <p>{isEdit ? 'Atualize os dados do colaborador.' : 'Preencha os dados para cadastrar um novo colaborador.'}</p>
        </div>
        <button className="btn-ghost-rh" onClick={() => navigate('/funcionarios')}>
          <i className="bi bi-arrow-left" /> Voltar
        </button>
      </div>

      {/* Card de senha gerada */}
      {senhaGerada && (
        <div className="card-rh mb-4" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="card-rh-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <i className="bi bi-key-fill" style={{ fontSize: 24, color: 'var(--success)' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>
                Funcionário cadastrado com sucesso!
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                Senha temporária gerada: {' '}
                <code style={{ background: 'var(--gray-100)', padding: '2px 10px', borderRadius: 6, fontWeight: 700, color: 'var(--primary-dark)', fontSize: 15 }}>
                  {senhaGerada}
                </code>
                {' '} — Informe ao colaborador para o primeiro acesso.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card-rh">
        <div className="card-rh-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-4">
              {/* Nome */}
              <div className="col-md-6">
                <div className="form-group-rh">
                  <label className="form-label-rh">Nome completo *</label>
                  <input
                    className={`form-control-rh${errors.nome ? ' is-invalid' : ''}`}
                    placeholder="Nome do colaborador"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                  />
                  {errors.nome && <span className="form-error">{errors.nome.message}</span>}
                </div>
              </div>

              {/* CPF */}
              <div className="col-md-6">
                <div className="form-group-rh">
                  <label className="form-label-rh">CPF *</label>
                  <input
                    className={`form-control-rh${errors.cpf ? ' is-invalid' : ''}`}
                    placeholder="000.000.000-00"
                    disabled={isEdit}
                    {...register('cpf', { required: !isEdit && 'CPF é obrigatório' })}
                    onChange={e => setValue('cpf', maskCpf(e.target.value))}
                  />
                  {isEdit && <span className="form-hint">CPF não pode ser alterado.</span>}
                  {errors.cpf && <span className="form-error">{errors.cpf.message}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <div className="form-group-rh">
                  <label className="form-label-rh">E-mail *</label>
                  <input
                    type="email"
                    className={`form-control-rh${errors.email ? ' is-invalid' : ''}`}
                    placeholder="email@empresa.com"
                    {...register('email', { required: 'E-mail é obrigatório' })}
                  />
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>
              </div>

              {/* Telefone */}
              <div className="col-md-6">
                <div className="form-group-rh">
                  <label className="form-label-rh">Telefone</label>
                  <input
                    className="form-control-rh"
                    placeholder="(00) 00000-0000"
                    {...register('telefone')}
                    onChange={e => setValue('telefone', maskPhone(e.target.value))}
                  />
                </div>
              </div>

              {/* Setor — async select */}
              <div className="col-md-4">
                <div className="form-group-rh">
                  <label className="form-label-rh">Setor *</label>
                  <Select
                    options={setores}
                    value={setorSel}
                    onChange={setSetorSel}
                    placeholder="Buscar setor..."
                    styles={selectStyles}
                    noOptionsMessage={() => 'Nenhum setor encontrado'}
                    isClearable
                  />
                </div>
              </div>

              {/* Turno */}
              <div className="col-md-4">
                <div className="form-group-rh">
                  <label className="form-label-rh">Turno *</label>
                  <Select
                    options={TURNO_OPTIONS}
                    value={turnoSel}
                    onChange={setTurnoSel}
                    placeholder="Selecione..."
                    styles={selectStyles}
                  />
                </div>
              </div>

              {/* Gênero */}
              <div className="col-md-4">
                <div className="form-group-rh">
                  <label className="form-label-rh">Gênero *</label>
                  <Select
                    options={GENERO_OPTIONS}
                    value={generoSel}
                    onChange={setGeneroSel}
                    placeholder="Selecione..."
                    styles={selectStyles}
                  />
                </div>
              </div>

              {!isEdit && (
                <div className="col-12">
                  <div style={{ background: 'var(--primary-bg)', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>
                    <i className="bi bi-info-circle me-2" />
                    A senha temporária será gerada automaticamente com os 4 primeiros dígitos do CPF + <code>senha#</code>. Ex: CPF <code>1234...</code> → senha <code>1234senha#</code>
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex gap-3 mt-4 justify-content-end">
              <button type="button" className="btn-ghost-rh" onClick={() => navigate('/funcionarios')}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary-rh" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />{isEdit ? 'Salvando...' : 'Cadastrando...'}</>
                  : <><i className={`bi bi-${isEdit ? 'check-lg' : 'plus-lg'}`} />{isEdit ? 'Salvar alterações' : 'Cadastrar funcionário'}</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
