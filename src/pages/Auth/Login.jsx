import { Component, createRef }                      from 'react'
import { Row, Col, Button, Form, Spinner }           from 'react-bootstrap'
import { toast }                                     from 'react-toastify'
import { withRouter }                                from '../../common/withRouter'
import { withAuth }                                  from '../../contexts/AuthContext'
import { maskCnpj, maskPhone }                       from '../../common/masks'
import { InputWithIcon, FormField, LogoUpload }      from '../../common/_components'
import { BiBuilding, BiLock }                        from 'react-icons/bi'
import api                                           from '../../services/api'

class AuthPage extends Component {
  constructor(props) {
    super(props)
    this.fileRef = createRef()
    this.state = {
      tab:            'login',
      showPwd:        false,
      loading:        false,
      logoPreview:    null,
      logoBase64:     null,
      loginCnpj:      '',
      loginSenha:     '',
      cadCnpj:        '',
      cadRazaoSocial: '',
      cadEndereco:    '',
      cadTelefone:    '',
      cadNome:        '',
      cadSobrenome:   '',
      cadSenha:       '',
    }
  }

  handleChange = (e) => { this.setState({ [e.target.name]: e.target.value }) }

  handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => this.setState({ logoPreview: ev.target.result, logoBase64: ev.target.result })
    reader.readAsDataURL(file)
  }

  enviaLogin = (e) => {
    e.preventDefault()
    const { loginCnpj, loginSenha } = this.state
    if (!loginCnpj || !loginSenha) return toast.error('Preencha CNPJ e senha.')
    this.setState({ loading: true })
    api.post('/empresa/login', { cnpj: loginCnpj, senha: loginSenha })
      .then(res => {
        this.props.auth.login(res.data.empresa, res.data.jwt)
        toast.success('Bem-vindo de volta! 👋')
        this.props.router.navigate('/dashboard')
      })
      .catch(err => toast.error(err.response?.data ?? 'CNPJ ou senha inválidos.'))
      .finally(() => this.setState({ loading: false }))
  }

  enviaCadastro = (e) => {
    e.preventDefault()
    const { cadCnpj, cadRazaoSocial, cadNome, cadSobrenome, cadSenha, cadEndereco, cadTelefone, logoBase64 } = this.state
    if (!cadCnpj || !cadRazaoSocial || !cadNome || !cadSobrenome || !cadSenha)
      return toast.error('Preencha todos os campos obrigatórios.')
    if (cadSenha.length < 6) return toast.error('Senha deve ter mínimo 6 caracteres.')

    this.setState({ loading: true })
    api.post('/empresa/cadastrar', {
      cnpj: cadCnpj, razaoSocial: cadRazaoSocial,
      endereco: cadEndereco, telefone: cadTelefone,
      logoBase64, responsavelNome: cadNome,
      responsavelSobrenome: cadSobrenome, senha: cadSenha,
    })
      .then(() => {
        toast.success('Empresa cadastrada! Faça o login para continuar.')
        this.setState({ tab: 'login', loginCnpj: cadCnpj })
      })
      .catch(err => toast.error(err.response?.data ?? 'Erro ao cadastrar empresa.'))
      .finally(() => this.setState({ loading: false }))
  }

  renderLogin() {
    const { showPwd, loading, loginCnpj, loginSenha } = this.state
    return (
      <Form onSubmit={this.enviaLogin}>
        <FormField label="CNPJ" className="form-group-rh">
          <InputWithIcon icon={BiBuilding}>
            <Form.Control className="form-control-rh" placeholder="00.000.000/0000-00"
              name="loginCnpj" value={loginCnpj}
              onChange={e => this.setState({ loginCnpj: maskCnpj(e.target.value) })} />
          </InputWithIcon>
        </FormField>

        <FormField label="Senha" className="form-group-rh">
          <InputWithIcon icon={BiLock} showToggle showPwd={showPwd}
            onToggle={() => this.setState(s => ({ showPwd: !s.showPwd }))}>
            <Form.Control type={showPwd ? 'text' : 'password'} className="form-control-rh"
              placeholder="Sua senha" name="loginSenha" value={loginSenha}
              onChange={this.handleChange} />
          </InputWithIcon>
        </FormField>

        <Button type="submit" className="btn-primary-rh w-100 justify-content-center mt-2" disabled={loading}>
          {loading ? <><Spinner size="sm" className="me-2" />Entrando...</> : 'Entrar'}
        </Button>
      </Form>
    )
  }

  renderCadastro() {
    const { showPwd, loading, logoPreview,
            cadCnpj, cadRazaoSocial, cadEndereco, cadTelefone,
            cadNome, cadSobrenome, cadSenha } = this.state
    return (
      <Form onSubmit={this.enviaCadastro}>
        <LogoUpload fileRef={this.fileRef} preview={logoPreview} onChange={this.handleLogo} />

        <Row className="g-3 mb-3">
          <Col xs={12}>
            <Form.Label className="form-label-rh">CNPJ *</Form.Label>
            <InputWithIcon icon={BiBuilding}>
              <Form.Control className="form-control-rh" placeholder="00.000.000/0000-00"
                name="cadCnpj" value={cadCnpj}
                onChange={e => this.setState({ cadCnpj: maskCnpj(e.target.value) })} />
            </InputWithIcon>
          </Col>
          <Col xs={12}>
            <Form.Label className="form-label-rh">Razão Social *</Form.Label>
            <Form.Control className="form-control-rh" placeholder="Nome legal da empresa"
              name="cadRazaoSocial" value={cadRazaoSocial} onChange={this.handleChange} />
          </Col>
          <Col md={8}>
            <Form.Label className="form-label-rh">Endereço</Form.Label>
            <Form.Control className="form-control-rh" placeholder="Rua, número, cidade"
              name="cadEndereco" value={cadEndereco} onChange={this.handleChange} />
          </Col>
          <Col md={4}>
            <Form.Label className="form-label-rh">Telefone</Form.Label>
            <Form.Control className="form-control-rh" placeholder="(00) 00000-0000"
              name="cadTelefone" value={cadTelefone}
              onChange={e => this.setState({ cadTelefone: maskPhone(e.target.value) })} />
          </Col>
        </Row>

        <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0 16px', paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Responsável de RH
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="form-label-rh">Nome *</Form.Label>
              <Form.Control className="form-control-rh" placeholder="Primeiro nome"
                name="cadNome" value={cadNome} onChange={this.handleChange} />
            </Col>
            <Col md={6}>
              <Form.Label className="form-label-rh">Sobrenome *</Form.Label>
              <Form.Control className="form-control-rh" placeholder="Sobrenome"
                name="cadSobrenome" value={cadSobrenome} onChange={this.handleChange} />
            </Col>
          </Row>
        </div>

        <FormField label="Senha de acesso *" className="form-group-rh">
          <InputWithIcon icon={BiLock} showToggle showPwd={showPwd}
            onToggle={() => this.setState(s => ({ showPwd: !s.showPwd }))}>
            <Form.Control type={showPwd ? 'text' : 'password'} className="form-control-rh"
              placeholder="Mínimo 6 caracteres" name="cadSenha" value={cadSenha}
              onChange={this.handleChange} />
          </InputWithIcon>
        </FormField>

        <Button type="submit" className="btn-primary-rh w-100 justify-content-center mt-2" disabled={loading}>
          {loading ? <><Spinner size="sm" className="me-2" />Cadastrando...</> : 'Criar conta'}
        </Button>
      </Form>
    )
  }

  render() {
    const { tab } = this.state
    return (
      <div className="auth-wrapper">
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
            {['Assinatura eletrônica de documentos', 'Controle de atestados e comprovantes',
              'Notificações automáticas para colaboradores', 'Auditoria completa com logs'].map(f => (
              <div className="auth-feature" key={f}><span className="dot" />{f}</div>
            ))}
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-box">
            <h1>{tab === 'login' ? 'Entrar na plataforma' : 'Cadastrar empresa'}</h1>
            <p className="auth-sub">
              {tab === 'login' ? 'Acesse com o CNPJ e senha da sua empresa.' : 'Crie a conta da sua empresa gratuitamente.'}
            </p>
            <div className="auth-tabs">
              <button className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                onClick={() => this.setState({ tab: 'login' })}>Entrar</button>
              <button className={`auth-tab${tab === 'cadastro' ? ' active' : ''}`}
                onClick={() => this.setState({ tab: 'cadastro' })}>Criar conta</button>
            </div>
            {tab === 'login' ? this.renderLogin() : this.renderCadastro()}
          </div>
        </div>
      </div>
    )
  }
}

export default withAuth(withRouter(AuthPage))
