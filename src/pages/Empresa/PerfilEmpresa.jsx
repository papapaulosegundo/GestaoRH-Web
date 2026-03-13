import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { empresaService } from '../../services/services'

function maskPhone(v) {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export default function PerfilEmpresa() {
  const { empresa, updateEmpresa } = useAuth()
  const [editing, setEditing]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [logoPreview, setLogoPreview] = useState(empresa?.logoBase64 ?? null)
  const [logoBase64, setLogoBase64]   = useState(empresa?.logoBase64 ?? null)
  const fileRef = useRef()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      razaoSocial:          empresa?.razaoSocial          ?? '',
      endereco:             empresa?.endereco             ?? '',
      telefone:             empresa?.telefone             ?? '',
      responsavelNome:      empresa?.responsavelNome      ?? '',
      responsavelSobrenome: empresa?.responsavelSobrenome ?? '',
    }
  })

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result)
      setLogoBase64(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await empresaService.atualizar(empresa.id, {
        razaoSocial:          data.razaoSocial,
        endereco:             data.endereco,
        telefone:             data.telefone,
        logoBase64:           logoBase64,
        responsavelNome:      data.responsavelNome,
        responsavelSobrenome: data.responsavelSobrenome,
      })
      updateEmpresa(res.data)
      toast.success('Perfil atualizado com sucesso!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data ?? 'Erro ao atualizar perfil.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setLogoPreview(empresa?.logoBase64 ?? null)
    setLogoBase64(empresa?.logoBase64 ?? null)
    setEditing(false)
  }

  const iniciais = empresa
    ? `${empresa.responsavelNome?.[0] ?? ''}${empresa.responsavelSobrenome?.[0] ?? ''}`.toUpperCase()
    : 'RH'

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Perfil da Empresa</h1>
          <p>Informações e configurações da sua organização.</p>
        </div>
        {!editing && (
          <button className="btn-primary-rh" onClick={() => setEditing(true)}>
            <i className="bi bi-pencil" /> Editar perfil
          </button>
        )}
      </div>

      <div className="row g-4">
        {/* Card principal */}
        <div className="col-lg-4">
          <div className="card-rh">
            <div className="card-rh-body" style={{ textAlign: 'center' }}>
              {/* Avatar / Logo */}
              <div
                style={{
                  width: 96, height: 96,
                  borderRadius: '50%',
                  background: logoPreview ? 'transparent' : 'var(--primary)',
                  margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, fontWeight: 800, color: '#fff',
                  fontFamily: 'var(--font-display)',
                  overflow: 'hidden',
                  border: '3px solid var(--border)',
                  position: 'relative',
                  cursor: editing ? 'pointer' : 'default'
                }}
                onClick={() => editing && fileRef.current.click()}
              >
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : iniciais}
                {editing && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    <i className="bi bi-camera" style={{ color: '#fff', fontSize: 20 }} />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />

              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>
                {empresa?.razaoSocial}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                CNPJ: <strong>{empresa?.cnpj}</strong>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
                  Responsável de RH
                </div>
                <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                  {empresa?.responsavelNome} {empresa?.responsavelSobrenome}
                </div>
              </div>

              {editing && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--primary)' }}>
                  Clique na imagem para trocar o logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulário / Detalhes */}
        <div className="col-lg-8">
          <div className="card-rh">
            <div className="card-rh-header">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                {editing ? 'Editar informações' : 'Informações da empresa'}
              </div>
            </div>
            <div className="card-rh-body">
              {editing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label-rh">Razão Social *</label>
                      <input
                        className={`form-control-rh${errors.razaoSocial ? ' is-invalid' : ''}`}
                        {...register('razaoSocial', { required: 'Razão social é obrigatória' })}
                      />
                      {errors.razaoSocial && <span className="form-error">{errors.razaoSocial.message}</span>}
                    </div>

                    <div className="col-md-8">
                      <label className="form-label-rh">Endereço</label>
                      <input
                        className="form-control-rh"
                        placeholder="Rua, número, cidade"
                        {...register('endereco')}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label-rh">Telefone</label>
                      <input
                        className="form-control-rh"
                        placeholder="(00) 00000-0000"
                        {...register('telefone')}
                        onChange={e => setValue('telefone', maskPhone(e.target.value))}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label-rh">Nome do responsável *</label>
                      <input
                        className={`form-control-rh${errors.responsavelNome ? ' is-invalid' : ''}`}
                        {...register('responsavelNome', { required: 'Nome é obrigatório' })}
                      />
                      {errors.responsavelNome && <span className="form-error">{errors.responsavelNome.message}</span>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label-rh">Sobrenome do responsável *</label>
                      <input
                        className={`form-control-rh${errors.responsavelSobrenome ? ' is-invalid' : ''}`}
                        {...register('responsavelSobrenome', { required: 'Sobrenome é obrigatório' })}
                      />
                      {errors.responsavelSobrenome && <span className="form-error">{errors.responsavelSobrenome.message}</span>}
                    </div>
                  </div>

                  <div className="d-flex gap-3 justify-content-end mt-4">
                    <button type="button" className="btn-ghost-rh" onClick={handleCancel}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary-rh" disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Salvando...</>
                        : <><i className="bi bi-check-lg" /> Salvar alterações</>
                      }
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {[
                    { icon: 'bi-building',    label: 'Razão Social',    value: empresa?.razaoSocial },
                    { icon: 'bi-upc',         label: 'CNPJ',            value: empresa?.cnpj },
                    { icon: 'bi-geo-alt',     label: 'Endereço',        value: empresa?.endereco || '—' },
                    { icon: 'bi-telephone',   label: 'Telefone',        value: empresa?.telefone || '—' },
                    { icon: 'bi-person',      label: 'Responsável',     value: `${empresa?.responsavelNome ?? ''} ${empresa?.responsavelSobrenome ?? ''}`.trim() },
                    { icon: 'bi-calendar3',   label: 'Cadastrado em',   value: empresa?.criadoEm ? new Date(empresa.criadoEm).toLocaleDateString('pt-BR') : '—' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 36, height: 36, background: 'var(--primary-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`bi ${item.icon}`} style={{ color: 'var(--primary)', fontSize: 15 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                        <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500, marginTop: 2 }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
