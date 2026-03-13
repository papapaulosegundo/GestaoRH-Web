import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { empresaService } from '../../services/services'

// Mascara CNPJ: 00.000.000/0000-00
function maskCnpj(v) {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

// Mascara telefone: (00) 00000-0000
function maskPhone(v) {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export default function AuthPage() {
  const [tab, setTab]           = useState('login')        // 'login' | 'cadastro'
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoBase64, setLogoBase64]   = useState(null)
  const fileRef = useRef()
  const navigate = useNavigate()
  const { login } = useAuth()

  /* ── Forms ── */
  const loginForm    = useForm()
  const cadastroForm = useForm()

  /* ── Login ── */
  const onLogin = async (data) => {
    setLoading(true)
    try {
      const res = await empresaService.login({ cnpj: data.cnpj, senha: data.senha })
      login(res.data.empresa, res.data.jwt)
      toast.success('Bem-vindo de volta! 👋')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data ?? 'CNPJ ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Cadastro ── */
  const onCadastro = async (data) => {
    setLoading(true)
    try {
      await empresaService.cadastrar({
        cnpj:                 data.cnpj,
        razaoSocial:          data.razaoSocial,
        endereco:             data.endereco,
        telefone:             data.telefone,
        logoBase64:           logoBase64,
        responsavelNome:      data.responsavelNome,
        responsavelSobrenome: data.responsavelSobrenome,
        senha:                data.senha,
      })
      toast.success('Empresa cadastrada! Faça o login para continuar.')
      setTab('login')
      loginForm.setValue('cnpj', data.cnpj)
    } catch (err) {
      const msg = err.response?.data ?? 'Erro ao cadastrar empresa.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ── Logo upload ── */
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

  return (
    <div className="auth-wrapper">
      {/* Visual lateral */}
      <div className="auth-visual">
        <div className="auth-visual-logo">
          <div className="mark">📋</div>
          <div className="brand">GestãoRH</div>
        </div>

        <div className="auth-headline">
          <h2>Gestão de RH simples e eficiente</h2>
          <p>Centralize documentos, assinaturas e comunicação com seus colaboradores em um só lugar.</p>
        </div>

        <div className="auth-features">
          {[
            'Assinatura eletrônica de documentos',
            'Controle de atestados e comprovantes',
            'Notificações automáticas para colaboradores',
            'Auditoria completa com logs',
          ].map(f => (
            <div className="auth-feature" key={f}>
              <span className="dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Form lado direito */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h1>{tab === 'login' ? 'Entrar na plataforma' : 'Cadastrar empresa'}</h1>
          <p className="auth-sub">
            {tab === 'login'
              ? 'Acesse com o CNPJ e senha da sua empresa.'
              : 'Crie a conta da sua empresa gratuitamente.'}
          </p>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
              Entrar
            </button>
            <button className={`auth-tab${tab === 'cadastro' ? ' active' : ''}`} onClick={() => setTab('cadastro')}>
              Criar conta
            </button>
          </div>

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <div className="form-group-rh">
                <label className="form-label-rh">CNPJ</label>
                <div className="input-icon-wrap">
                  <i className="bi bi-building" />
                  <input
                    className={`form-control-rh${loginForm.formState.errors.cnpj ? ' is-invalid' : ''}`}
                    placeholder="00.000.000/0000-00"
                    {...loginForm.register('cnpj', { required: 'CNPJ é obrigatório' })}
                    onChange={e => loginForm.setValue('cnpj', maskCnpj(e.target.value))}
                  />
                </div>
                {loginForm.formState.errors.cnpj && (
                  <span className="form-error">{loginForm.formState.errors.cnpj.message}</span>
                )}
              </div>

              <div className="form-group-rh">
                <label className="form-label-rh">Senha</label>
                <div className="input-icon-wrap">
                  <i className="bi bi-lock" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`form-control-rh${loginForm.formState.errors.senha ? ' is-invalid' : ''}`}
                    placeholder="Sua senha"
                    {...loginForm.register('senha', { required: 'Senha é obrigatória' })}
                  />
                  <button type="button" className="eye-toggle" onClick={() => setShowPwd(p => !p)}>
                    <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} />
                  </button>
                </div>
                {loginForm.formState.errors.senha && (
                  <span className="form-error">{loginForm.formState.errors.senha.message}</span>
                )}
              </div>

              <button type="submit" className="btn-primary-rh w-100 justify-content-center mt-2" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Entrando...</> : 'Entrar'}
              </button>
            </form>
          )}

          {/* ── CADASTRO ── */}
          {tab === 'cadastro' && (
            <form onSubmit={cadastroForm.handleSubmit(onCadastro)}>
              {/* Logo */}
              <div className="form-group-rh">
                <label className="form-label-rh">Logo da empresa <span style={{color:'var(--gray-400)',fontWeight:400}}>(opcional)</span></label>
                <div className="logo-upload" onClick={() => fileRef.current.click()}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} />
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" className="preview" />
                    : <>
                        <i className="bi bi-image" style={{ fontSize: 32, color: 'var(--gray-400)', display: 'block', marginBottom: 8 }} />
                        <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Clique para enviar o logo</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>PNG, JPG até 2MB</div>
                      </>
                  }
                </div>
              </div>

              {/* CNPJ + Razão Social */}
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label-rh">CNPJ *</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-building" />
                    <input
                      className={`form-control-rh${cadastroForm.formState.errors.cnpj ? ' is-invalid' : ''}`}
                      placeholder="00.000.000/0000-00"
                      {...cadastroForm.register('cnpj', { required: 'CNPJ é obrigatório' })}
                      onChange={e => cadastroForm.setValue('cnpj', maskCnpj(e.target.value))}
                    />
                  </div>
                  {cadastroForm.formState.errors.cnpj && <span className="form-error">{cadastroForm.formState.errors.cnpj.message}</span>}
                </div>

                <div className="col-12">
                  <label className="form-label-rh">Razão Social *</label>
                  <input
                    className={`form-control-rh${cadastroForm.formState.errors.razaoSocial ? ' is-invalid' : ''}`}
                    placeholder="Nome legal da empresa"
                    {...cadastroForm.register('razaoSocial', { required: 'Razão social é obrigatória' })}
                  />
                  {cadastroForm.formState.errors.razaoSocial && <span className="form-error">{cadastroForm.formState.errors.razaoSocial.message}</span>}
                </div>

                <div className="col-md-8">
                  <label className="form-label-rh">Endereço</label>
                  <input
                    className="form-control-rh"
                    placeholder="Rua, número, cidade"
                    {...cadastroForm.register('endereco')}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label-rh">Telefone</label>
                  <input
                    className="form-control-rh"
                    placeholder="(00) 00000-0000"
                    {...cadastroForm.register('telefone')}
                    onChange={e => cadastroForm.setValue('telefone', maskPhone(e.target.value))}
                  />
                </div>
              </div>

              {/* Responsável */}
              <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0 16px', paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Responsável de RH</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label-rh">Nome *</label>
                    <input
                      className={`form-control-rh${cadastroForm.formState.errors.responsavelNome ? ' is-invalid' : ''}`}
                      placeholder="Primeiro nome"
                      {...cadastroForm.register('responsavelNome', { required: 'Nome é obrigatório' })}
                    />
                    {cadastroForm.formState.errors.responsavelNome && <span className="form-error">{cadastroForm.formState.errors.responsavelNome.message}</span>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-rh">Sobrenome *</label>
                    <input
                      className={`form-control-rh${cadastroForm.formState.errors.responsavelSobrenome ? ' is-invalid' : ''}`}
                      placeholder="Sobrenome"
                      {...cadastroForm.register('responsavelSobrenome', { required: 'Sobrenome é obrigatório' })}
                    />
                    {cadastroForm.formState.errors.responsavelSobrenome && <span className="form-error">{cadastroForm.formState.errors.responsavelSobrenome.message}</span>}
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div className="form-group-rh">
                <label className="form-label-rh">Senha de acesso *</label>
                <div className="input-icon-wrap">
                  <i className="bi bi-lock" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`form-control-rh${cadastroForm.formState.errors.senha ? ' is-invalid' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    {...cadastroForm.register('senha', {
                      required: 'Senha é obrigatória',
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                    })}
                  />
                  <button type="button" className="eye-toggle" onClick={() => setShowPwd(p => !p)}>
                    <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} />
                  </button>
                </div>
                {cadastroForm.formState.errors.senha && <span className="form-error">{cadastroForm.formState.errors.senha.message}</span>}
              </div>

              <button type="submit" className="btn-primary-rh w-100 justify-content-center mt-2" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Cadastrando...</> : 'Criar conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
