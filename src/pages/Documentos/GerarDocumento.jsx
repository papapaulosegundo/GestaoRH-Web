import { Component }  from 'react'
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap'
import Select          from 'react-select'
import { toast }       from 'react-toastify'
import { withRouter }  from '../../common/withRouter'
import { PageHeader, LoadingSpinner, FormField } from '../../common/_components'
import { selectStyles, setoresToOptions } from '../../common/utils'
import { BiArrowBack, BiFileBlank, BiSend } from 'react-icons/bi'
import api from '../../services/api'

class GerarDocumento extends Component {
  state = {
    // Selects
    modeloSel:     null,
    funcionarioSel: null,
    setorSel:      null,
    // Dados carregados
    modelos:       [],
    funcionarios:  [],
    setores:       [],
    // Variáveis manuais do modelo selecionado
    variaveisManuals: [],  // [{ token, label, valor }]
    // Modo
    modo:          'individual', // 'individual' | 'lote'
    // Controle
    loading:       false,
    loadingInicial: true,
    resultado:     null,  // resposta após geração
  }

  componentDidMount() {
    // Carrega modelos publicados, funcionários e setores em paralelo
    Promise.all([
      api.get('/modelo'),
      api.get('/funcionario'),
      api.get('/setor'),
    ])
      .then(([resM, resF, resS]) => {
        const modelosPublicados = resM.data.filter(m => m.status === 'publicado')
        this.setState({
          modelos:      modelosPublicados.map(m => ({
            value: m.id,
            label: m.nome,
            tipoUso: m.tipoUso,
          })),
          funcionarios: resF.data.map(f => ({
            value: f.id,
            label: `${f.nome} — ${f.nomeSetor ?? 'Sem setor'}`,
            nome:  f.nome,
          })),
          setores: setoresToOptions(resS.data),
        })
      })
      .catch(() => toast.error('Erro ao carregar dados.'))
      .finally(() => this.setState({ loadingInicial: false }))
  }

  // Quando seleciona o modelo, carrega as variáveis manuais dele
  handleModeloChange = (opcao) => {
    this.setState({ modeloSel: opcao, variaveisManuals: [], resultado: null })
    if (!opcao) return

    api.get(`/modelo/${opcao.value}`)
      .then(res => {
        // Extrai variáveis de origem "manual"
        const vars = (res.data.variaveis ?? [])
          .filter(v => v.origem === 'manual' || v.permitirManual)
          .map(v => ({ token: v.token, label: v.token.replace(/[{}]/g, ''), valor: '' }))
        this.setState({ variaveisManuals: vars })
      })
      .catch(() => {})
  }

  handleVariavelChange = (idx, valor) => {
    const lista = [...this.state.variaveisManuals]
    lista[idx] = { ...lista[idx], valor }
    this.setState({ variaveisManuals: lista })
  }

  // POST /api/documento/gerar
  handleGerar = (e) => {
    e.preventDefault()
    const { modeloSel, funcionarioSel, setorSel, modo, variaveisManuals } = this.state

    if (!modeloSel) return toast.error('Selecione um modelo.')
    if (modo === 'individual' && !funcionarioSel) return toast.error('Selecione um funcionário.')
    if (modo === 'lote' && !setorSel) return toast.error('Selecione um setor.')

    const payload = {
      modeloId:       modeloSel.value,
      funcionarioId:  modo === 'individual' ? funcionarioSel.value : 0,
      setorId:        modo === 'lote'       ? setorSel.value       : null,
      variaveisManuals: variaveisManuals
        .filter(v => v.valor.trim())
        .map(v => ({ token: v.token, valor: v.valor })),
    }

    this.setState({ loading: true, resultado: null })

    api.post('/documento/gerar', payload)
      .then(res => {
        toast.success(modo === 'lote'
          ? `${res.data.total} documento(s) gerado(s) com sucesso!`
          : 'Documento gerado! Aguardando assinaturas.')
        this.setState({ resultado: res.data, loading: false })
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'Erro ao gerar documento.')
        this.setState({ loading: false })
      })
  }

  render() {
    const {
      modeloSel, funcionarioSel, setorSel, modo,
      modelos, funcionarios, setores,
      variaveisManuals, loading, loadingInicial, resultado,
    } = this.state

    if (loadingInicial) return <LoadingSpinner />

    // Detecta tipo de uso do modelo selecionado
    const tipoUso = modeloSel?.tipoUso ?? 'ambos'

    return (
      <div>
        <PageHeader
          title="Gerar Documento"
          sub="Crie um novo documento a partir de um modelo publicado."
          action={
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.props.router.navigate('/documentos')}>
              <BiArrowBack className="me-1" /> Voltar
            </Button>
          }
        />

        {/* Resultado após geração */}
        {resultado && (
          <Alert variant="success" className="mb-4 d-flex align-items-center gap-3">
            <BiFileBlank size={28} />
            <div>
              {resultado.loteId ? (
                <>
                  <strong>{resultado.total} documento(s) gerado(s) em lote!</strong>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Lote #{resultado.loteId} — cada funcionário do setor recebeu um documento individual.
                    <Button variant="link" size="sm" className="ps-2 pe-0"
                      onClick={() => this.props.router.navigate('/documentos')}>
                      Ver documentos →
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <strong>Documento gerado com sucesso!</strong>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Agora aguarda as assinaturas configuradas no modelo.
                    <Button variant="link" size="sm" className="ps-2 pe-0"
                      onClick={() => this.props.router.navigate(`/documentos/${resultado.id}`)}>
                      Ver documento →
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Alert>
        )}

        <Form onSubmit={this.handleGerar}>
          <Card className="card-rh mb-4">
            <Card.Body className="card-rh-body">
              <Row className="g-4">
                {/* Modelo */}
                <Col md={12}>
                  <FormField label="Modelo *"
                    hint="Somente modelos publicados estão disponíveis.">
                    <Select
                      options={modelos}
                      value={modeloSel}
                      onChange={this.handleModeloChange}
                      placeholder="Selecione um modelo publicado..."
                      styles={selectStyles}
                      noOptionsMessage={() => 'Nenhum modelo publicado encontrado'}
                      isClearable
                    />
                  </FormField>
                </Col>

                {/* Modo (individual / lote) — só aparece se o modelo permite ambos */}
                {modeloSel && (tipoUso === 'ambos') && (
                  <Col md={12}>
                    <FormField label="Modo de geração">
                      <div className="d-flex gap-3">
                        <Form.Check type="radio" id="modo-individual" label="Individual (1 funcionário)"
                          checked={modo === 'individual'}
                          onChange={() => this.setState({ modo: 'individual', setorSel: null })} />
                        <Form.Check type="radio" id="modo-lote" label="Lote (setor inteiro)"
                          checked={modo === 'lote'}
                          onChange={() => this.setState({ modo: 'lote', funcionarioSel: null })} />
                      </div>
                    </FormField>
                  </Col>
                )}

                {/* Funcionário (individual) */}
                {modeloSel && (tipoUso === 'individual' || (tipoUso === 'ambos' && modo === 'individual')) && (
                  <Col md={8}>
                    <FormField label="Funcionário *">
                      <Select
                        options={funcionarios}
                        value={funcionarioSel}
                        onChange={v => this.setState({ funcionarioSel: v })}
                        placeholder="Buscar funcionário..."
                        styles={selectStyles}
                        noOptionsMessage={() => 'Nenhum funcionário encontrado'}
                        isClearable
                      />
                    </FormField>
                  </Col>
                )}

                {/* Setor (lote) */}
                {modeloSel && (tipoUso === 'lote' || (tipoUso === 'ambos' && modo === 'lote')) && (
                  <Col md={8}>
                    <FormField label="Setor *"
                      hint="Será gerado 1 documento para cada funcionário ativo do setor.">
                      <Select
                        options={setores}
                        value={setorSel}
                        onChange={v => this.setState({ setorSel: v })}
                        placeholder="Selecione um setor..."
                        styles={selectStyles}
                        isClearable
                      />
                    </FormField>
                  </Col>
                )}

                {/* Variáveis manuais */}
                {variaveisManuals.length > 0 && (
                  <Col md={12}>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 16 }}>
                        Variáveis manuais — preencha antes de gerar
                      </div>
                      <Row className="g-3">
                        {variaveisManuals.map((v, idx) => (
                          <Col md={4} key={v.token}>
                            <Form.Label className="form-label-rh">{v.label}</Form.Label>
                            <Form.Control className="form-control-rh"
                              placeholder={v.token}
                              value={v.valor}
                              onChange={e => this.handleVariavelChange(idx, e.target.value)} />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex gap-3 justify-content-end">
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.props.router.navigate('/documentos')}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary-rh" disabled={loading || !modeloSel}>
              {loading
                ? <><Spinner size="sm" className="me-2" />Gerando...</>
                : <><BiSend className="me-1" />Gerar documento</>
              }
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}

export default withRouter(GerarDocumento)
