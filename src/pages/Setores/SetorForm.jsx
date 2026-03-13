import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { setorService } from '../../services/services'

export default function SetorForm() {
  const navigate       = useNavigate()
  const { id }         = useParams()
  const isEdit         = !!id

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (!isEdit) return
    setorService.obterPorId(id).then(res => {
      setValue('nome',      res.data.nome)
      setValue('descricao', res.data.descricao)
    }).catch(() => {
      toast.error('Setor não encontrado.')
      navigate('/setores')
    })
  }, [id, isEdit])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await setorService.atualizar(id, data)
        toast.success('Setor atualizado!')
      } else {
        await setorService.cadastrar(data)
        toast.success('Setor cadastrado!')
      }
      navigate('/setores')
    } catch (err) {
      toast.error(err.response?.data ?? 'Erro ao salvar setor.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>{isEdit ? 'Editar Setor' : 'Novo Setor'}</h1>
          <p>{isEdit ? 'Atualize as informações do setor.' : 'Cadastre um novo departamento na empresa.'}</p>
        </div>
        <button className="btn-ghost-rh" onClick={() => navigate('/setores')}>
          <i className="bi bi-arrow-left" /> Voltar
        </button>
      </div>

      <div className="card-rh" style={{ maxWidth: 600 }}>
        <div className="card-rh-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group-rh">
              <label className="form-label-rh">Nome do setor *</label>
              <input
                className={`form-control-rh${errors.nome ? ' is-invalid' : ''}`}
                placeholder="Ex: Recursos Humanos, Financeiro, TI..."
                {...register('nome', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
              />
              {errors.nome && <span className="form-error">{errors.nome.message}</span>}
            </div>

            <div className="form-group-rh">
              <label className="form-label-rh">Descrição <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(opcional)</span></label>
              <textarea
                className="form-control-rh"
                placeholder="Descreva as responsabilidades deste setor..."
                rows={4}
                style={{ resize: 'vertical' }}
                {...register('descricao')}
              />
              <span className="form-hint">Ajuda os colaboradores a entenderem onde pertencem.</span>
            </div>

            <div className="d-flex gap-3 justify-content-end mt-2">
              <button type="button" className="btn-ghost-rh" onClick={() => navigate('/setores')}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary-rh" disabled={isSubmitting}>
                {isSubmitting
                  ? <><span className="spinner-border spinner-border-sm me-2" />{isEdit ? 'Salvando...' : 'Cadastrando...'}</>
                  : <><i className={`bi bi-${isEdit ? 'check-lg' : 'plus-lg'}`} />{isEdit ? 'Salvar alterações' : 'Cadastrar setor'}</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
