import { Component }                                    from 'react'
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import Select                                           from 'react-select'
import { toast }                                        from 'react-toastify'
import { withRouter }                                   from '../../common/withRouter'
import { PageHeader, LoadingSpinner, FormField }        from '../../common/_components'
import { BiArrowBack, BiCheck, BiPlus, BiKey }          from 'react-icons/bi'
import { GENERO_OPTIONS, TURNO_OPTIONS, selectStyles, setoresToOptions } from '../../common/utils'
import { maskCpf, maskPhone }                           from '../../common/masks'
import api                                              from '../../services/api'

class FuncionarioEdit extends Component {
  state = {
    nome:        '',
    cpf:         '',
    telefone:    '',
    email:       '',
    ativo:       true,
    generoSel:   null,
    turnoSel:    null,
    setorSel:    null,
    setores:     [],
    loading:     false,
    loadingData: false,
    senhaGerada: '',
  }

  get isEdit() { return !!this.props.router.params.id }
  get id()     { return this.props.router.params.id }

  componentDidMount() {
    // Carrega apenas setores ATIVOS para o select (GET /api/setor)
    api.get('/setor')
      .then(res => this.setState({ setores: setoresToOptions(res.data) }))
      .catch(() => toast.error('Erro ao carregar setores.'))

    if (this.isEdit) {
      this.setState({ loadingData: true })
      api.get(`/funcionario/${this.id}`)
        .then(res => {
          const f = res.data
          this.setState({
            nome:        f.nome,
            cpf:         f.cpf,
            telefone:    f.telefone,
            email:       f.email,
            ativo:       f.ativo,
            generoSel:   GENERO_OPTIONS.find(o => o.value === f.genero) ?? null,
            turnoSel:    TURNO_OPTIONS.find(o => o.value === f.turno)   ?? null,
            setorSel:    { value: f.setorId, label: f.nomeSetor },
            loadingData: false,
          })
        })
        .catch(() => {
          toast.error('Erro ao carregar funcionário.')
          this.props.router.navigate('/funcionarios')
        })
    }
  }

  handleChange = (e) => { this.setState({ [e.target.name]: e.target.value }) }

  enviaRegistro = (e) => {
    e.preventDefault()
    const { nome, cpf, telefone, email, ativo, generoSel, turnoSel, setorSel } = this.state

    if (!generoSel) return toast.error('Selecione o gênero.')
    if (!turnoSel)  return toast.error('Selecione o turno.')
    if (!setorSel)  return toast.error('Selecione o setor.')

    const payload = {
      nome, telefone, email,
      genero:  generoSel.value,
      turno:   turnoSel.value,
      setorId: setorSel.value,
      ativo,   // enviado apenas na edição (ignorado no cadastro pelo back)
    }

    this.setState({ loading: true })

    if (this.isEdit) {
      api.put(`/funcionario/${this.id}`, payload)
        .then(() => {
          toast.success('Funcionário atualizado com sucesso!')
          this.props.router.navigate('/funcionarios')
        })
        .catch(err => {
          toast.error(err.response?.data ?? 'Erro ao atualizar funcionário.')
          this.setState({ loading: false })
        })
    } else {
      api.post('/funcionario/cadastrar', { ...payload, cpf })
        .then(res => {
          toast.success('Funcionário cadastrado!')
          this.setState({
            senhaGerada: res.data.senhaTemporaria,
            nome: '', cpf: '', telefone: '', email: '', ativo: true,
            generoSel: null, turnoSel: null, setorSel: null,
            loading: false,
          })
        })
        .catch(err => {
          toast.error(err.response?.data ?? 'Erro ao cadastrar funcionário.')
          this.setState({ loading: false })
        })
    }
  }

  render() {
    const { nome, cpf, telefone, email, ativo, generoSel, turnoSel, setorSel,
            setores, loading, loadingData, senhaGerada } = this.state

    if (loadingData) return <LoadingSpinner />

    return (
      <div>
        <PageHeader
          title={this.isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}
          sub={this.isEdit ? 'Atualize os dados do colaborador.' : 'Preencha os dados para cadastrar um novo colaborador.'}
          action={
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.props.router.navigate('/funcionarios')}>
              <BiArrowBack className="me-1" /> Voltar
            </Button>
          }
        />

        {senhaGerada && (
          <Alert variant="success" className="mb-4 d-flex align-items-center gap-3">
            <BiKey size={24} />
            <div>
              <strong>Funcionário cadastrado com sucesso!</strong>
              <div style={{ fontSize: 13 }}>
                Senha temporária:{' '}
                <code style={{ background: 'var(--gray-100)', padding: '2px 10px', borderRadius: 6, fontWeight: 700, color: 'var(--primary-dark)', fontSize: 15 }}>
                  {senhaGerada}
                </code>
                {' '}— Informe ao colaborador para o primeiro acesso.
              </div>
            </div>
          </Alert>
        )}

        <Card className="card-rh">
          <Card.Body className="card-rh-body">
            <Form onSubmit={this.enviaRegistro}>
              <Row className="g-4">
                <Col md={6}>
                  <FormField label="Nome completo *">
                    <Form.Control className="form-control-rh" placeholder="Nome do colaborador"
                      name="nome" value={nome} onChange={this.handleChange} required />
                  </FormField>
                </Col>

                <Col md={6}>
                  <FormField label="CPF *" hint={this.isEdit ? 'CPF não pode ser alterado.' : undefined}>
                    <Form.Control className="form-control-rh" placeholder="000.000.000-00"
                      name="cpf" value={cpf} disabled={this.isEdit}
                      onChange={e => this.setState({ cpf: maskCpf(e.target.value) })}
                      required={!this.isEdit} />
                  </FormField>
                </Col>

                <Col md={6}>
                  <FormField label="E-mail *">
                    <Form.Control type="email" className="form-control-rh" placeholder="email@empresa.com"
                      name="email" value={email} onChange={this.handleChange} required />
                  </FormField>
                </Col>

                <Col md={6}>
                  <FormField label="Telefone">
                    <Form.Control className="form-control-rh" placeholder="(00) 00000-0000"
                      name="telefone" value={telefone}
                      onChange={e => this.setState({ telefone: maskPhone(e.target.value) })} />
                  </FormField>
                </Col>

                <Col md={4}>
                  <FormField label="Setor *">
                    <Select options={setores} value={setorSel}
                      onChange={v => this.setState({ setorSel: v })}
                      placeholder="Buscar setor..." styles={selectStyles}
                      noOptionsMessage={() => 'Nenhum setor encontrado'} isClearable />
                  </FormField>
                </Col>

                <Col md={4}>
                  <FormField label="Turno *">
                    <Select options={TURNO_OPTIONS} value={turnoSel}
                      onChange={v => this.setState({ turnoSel: v })}
                      placeholder="Selecione..." styles={selectStyles} />
                  </FormField>
                </Col>

                <Col md={4}>
                  <FormField label="Gênero *">
                    <Select options={GENERO_OPTIONS} value={generoSel}
                      onChange={v => this.setState({ generoSel: v })}
                      placeholder="Selecione..." styles={selectStyles} />
                  </FormField>
                </Col>

                {/* Campo status apenas na edição */}
                {this.isEdit && (
                  <Col md={4}>
                    <FormField label="Status">
                      <Form.Select className="form-control-rh" name="ativo"
                        value={ativo ? 'true' : 'false'}
                        onChange={e => this.setState({ ativo: e.target.value === 'true' })}>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </Form.Select>
                    </FormField>
                  </Col>
                )}

                {!this.isEdit && (
                  <Col xs={12}>
                    <Alert variant="info" style={{ fontSize: 13 }}>
                      <BiKey className="me-2" />
                      A senha temporária será gerada automaticamente com os 4 primeiros dígitos do CPF + <code>senha#</code>.
                      Ex: CPF <code>1234...</code> → senha <code>1234senha#</code>
                    </Alert>
                  </Col>
                )}
              </Row>

              <div className="d-flex gap-3 mt-4 justify-content-end">
                <Button variant="light" className="btn-ghost-rh"
                  onClick={() => this.props.router.navigate('/funcionarios')}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary-rh" disabled={loading}>
                  {loading
                    ? <><Spinner size="sm" className="me-2" />{this.isEdit ? 'Salvando...' : 'Cadastrando...'}</>
                    : this.isEdit
                      ? <><BiCheck className="me-1" /> Salvar alterações</>
                      : <><BiPlus className="me-1" /> Cadastrar funcionário</>
                  }
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withRouter(FuncionarioEdit)
