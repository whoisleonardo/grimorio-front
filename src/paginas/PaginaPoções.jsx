import { useState, useEffect } from "react";
import {
  buscarPoções,
  criarPoção,
  atualizarPoção,
  deletarPoção,
  buscarIngredientes,
  atualizarIngrediente,
} from "../servicos/api";

const FORM_VAZIO = {
  nome: "",
  efeito: "",
  duracaoMinutos: "",
  ingredientes: [],
};

export default function PaginaPoções({ aoSair, aoVoltar, irParaUsuarios }) {
  const [poções, setPoções] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [formulario, setFormulario] = useState(FORM_VAZIO);
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [ingredienteAtual, setIngredienteAtual] = useState({
    ingredienteId: "",
    quantidadeNecessaria: "",
    nomeIngrediente: "",
    raridade: "",
    descricao: "",
  });
  const nomeUsuario = localStorage.getItem("nomeUsuario");

  useEffect(() => {
    carregarPoções();
    carregarIngredientes();
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(() => setMensagem(""), 4000);
    return () => clearTimeout(t);
  }, [mensagem]);

  async function carregarIngredientes() {
    try {
      const lista = await buscarIngredientes();
      setIngredientes(lista);
    } catch (erro) {
      console.error("Erro ao carregar ingredientes:", erro.message);
    }
  }

  async function carregarPoções() {
    try {
      const lista = await buscarPoções();
      setPoções(lista);
    } catch (erro) {
      setErro("Erro ao carregar poções: " + erro.message);
    }
  }

  function validarFormulario() {
    if (!formulario.nome || formulario.nome.length < 2)
      return "Nome deve ter no mínimo 2 caracteres";
    if (!formulario.efeito || formulario.efeito.length < 5)
      return "Efeito deve ter no mínimo 5 caracteres";
    if (!formulario.duracaoMinutos || formulario.duracaoMinutos < 1)
      return "Duração deve ser maior que 0 minutos";
    if (formulario.ingredientes.length === 0)
      return "Adicione pelo menos um ingrediente";
    return null;
  }

  function adicionarIngrediente() {
    if (!ingredienteAtual.ingredienteId || !ingredienteAtual.quantidadeNecessaria) {
      setErro("Preencha Ingrediente e Quantidade");
      return;
    }

    const novoIngrediente = {
      ingredienteId: parseInt(ingredienteAtual.ingredienteId),
      quantidadeNecessaria: parseInt(ingredienteAtual.quantidadeNecessaria),
      nomeIngrediente: ingredienteAtual.nomeIngrediente,
      raridade: ingredienteAtual.raridade,
      descricao: ingredienteAtual.descricao,
    };

    setFormulario({
      ...formulario,
      ingredientes: [...formulario.ingredientes, novoIngrediente],
    });

    setIngredienteAtual({
      ingredienteId: "",
      quantidadeNecessaria: "",
      nomeIngrediente: "",
      raridade: "",
      descricao: "",
    });
    setErro("");
  }

  function removerIngrediente(index) {
    setFormulario({
      ...formulario,
      ingredientes: formulario.ingredientes.filter(
        (_, i) => i !== index
      ),
    });
  }

  function handleSelectIngrediente(ingredienteId) {
    const ingredienteSelecionado = ingredientes.find(
      (ing) => ing.id === parseInt(ingredienteId)
    );
    
    if (ingredienteSelecionado) {
      setIngredienteAtual({
        ingredienteId: ingredienteId,
        quantidadeNecessaria: ingredienteAtual.quantidadeNecessaria,
        nomeIngrediente: ingredienteSelecionado.nome,
        raridade: ingredienteSelecionado.raridade,
        descricao: ingredienteSelecionado.descricao,
      });
    }
  }

  async function handleSalvar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    const erroValidacao = validarFormulario();
    if (erroValidacao) return setErro(erroValidacao);

    if (!idEditando) {
      for (const item of formulario.ingredientes) {
        const ing = ingredientes.find(i => i.id === item.ingredienteId);
        if (ing && ing.quantidade < item.quantidadeNecessaria) {
          return setErro(`Estoque insuficiente de "${ing.nome}": disponível ${ing.quantidade}, necessário ${item.quantidadeNecessaria}`);
        }
      }
    }

    setCarregando(true);
    try {
      const dados = {
        nome: formulario.nome,
        efeito: formulario.efeito,
        duracaoMinutos: parseInt(formulario.duracaoMinutos),
        ingredientes: formulario.ingredientes,
      };

      if (idEditando) {
        await atualizarPoção(idEditando, dados);
        setMensagem("Poção atualizada com sucesso!");
      } else {
        await criarPoção(dados);

        const consumidosTotalmente = [];
        const falhasAtualizacao = [];

        await Promise.allSettled(
          formulario.ingredientes.map(async item => {
            const ing = ingredientes.find(i => i.id === item.ingredienteId);
            if (!ing) return;
            const novaQtd = ing.quantidade - item.quantidadeNecessaria;
            if (novaQtd <= 0) {
              consumidosTotalmente.push(ing.nome);
              return;
            }
            try {
              await atualizarIngrediente(item.ingredienteId, {
                nome: ing.nome,
                descricao: ing.descricao,
                raridade: ing.raridade,
                quantidade: novaQtd,
              });
            } catch {
              falhasAtualizacao.push(ing.nome);
            }
          })
        );

        await carregarIngredientes();

        if (falhasAtualizacao.length > 0) {
          setMensagem(`Poção criada! Mas não foi possível atualizar o estoque de: ${falhasAtualizacao.join(", ")}.`);
        } else if (consumidosTotalmente.length > 0) {
          setMensagem(`Poção criada! Atenção: "${consumidosTotalmente.join(", ")}" foi totalmente consumido.`);
        } else {
          setMensagem("Poção criada com sucesso!");
        }
      }

      setFormulario(FORM_VAZIO);
      setIdEditando(null);
      await carregarPoções();
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      setErro(erro.response?.data?.mensagem || erro.message || "Erro na operação");
    } finally {
      setCarregando(false);
    }
  }

  function handleEditar(poção) {
    setIdEditando(poção.id);
    setFormulario({
      nome: poção.nome,
      efeito: poção.efeito,
      duracaoMinutos: poção.duracaoMinutos,
      ingredientes: (poção.ingredientes || []).map(ing => ({
        ingredienteId: ing.ingrediente?.id,
        quantidadeNecessaria: ing.quantidadeNecessaria,
        nomeIngrediente: ing.ingrediente?.nome,
        raridade: ing.ingrediente?.raridade,
        descricao: ing.ingrediente?.descricao,
      })),
    });
    setErro("");
    setMensagem("");
  }

  async function handleDeletar(id) {
    if (!confirm("Tem certeza que deseja excluir esta poção?")) return;
    setErro("");
    try {
      await deletarPoção(id);
      setMensagem("Poção excluída com sucesso!");
      await carregarPoções();
    } catch (erro) {
      console.error("Erro ao deletar:", erro);
      setErro(erro.response?.data?.mensagem || erro.message || "Erro na operação");
    }
  }

  function handleCancelar() {
    setFormulario(FORM_VAZIO);
    setIdEditando(null);
    setIngredienteAtual({ ingredienteId: "", quantidadeNecessaria: "" });
    setErro("");
    setMensagem("");
  }

  function handleSair() {
    localStorage.removeItem("token");
    localStorage.removeItem("nomeUsuario");
    localStorage.removeItem("roleUsuario");
    aoSair();
  }

  return (
    <div style={estilos.pagina}>
      {/* Cabeçalho */}
      <div style={estilos.cabecalho}>
        <div style={estilos.cabecalhoEsquerda}>
          {aoVoltar && (
            <button onClick={aoVoltar} style={estilos.botaoVoltar}>← Voltar</button>
          )}
          <h1 style={estilos.titulo}>🧪 Grimório Digital</h1>
        </div>
        <div style={estilos.cabecalhoDireita}>
          <span style={estilos.nomeUsuario}>Olá, {nomeUsuario}</span>
          {irParaUsuarios && (
            <button onClick={irParaUsuarios} style={estilos.botaoNavegar}>
              👥 Usuários
            </button>
          )}
          <button onClick={handleSair} style={estilos.botaoSair}>Sair</button>
        </div>
      </div>

      <div style={estilos.conteudo}>
        {/* Formulário */}
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>
            {idEditando ? "Editar Poção" : "Nova Poção"}
          </h2>

          <form onSubmit={handleSalvar} style={estilos.formulario}>
            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Nome *</label>
                <input
                  style={estilos.input}
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Ex: Poção de Invisibilidade"
                />
              </div>
              <div style={estilos.campo}>
                <label style={estilos.label}>Efeito *</label>
                <input
                  style={estilos.input}
                  value={formulario.efeito}
                  onChange={(e) => setFormulario({ ...formulario, efeito: e.target.value })}
                  placeholder="Ex: Torna o usuário invisível"
                />
              </div>
            </div>

            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Duração (minutos) *</label>
                <input
                  type="number"
                  style={estilos.input}
                  value={formulario.duracaoMinutos}
                  onChange={(e) =>
                    setFormulario({ ...formulario, duracaoMinutos: e.target.value })
                  }
                  placeholder="Ex: 60"
                />
              </div>
            </div>

            <div style={estilos.secaoIngredientes}>
              <h3 style={estilos.tituloSecao}>Ingredientes *</h3>
              
              <div style={estilos.linhaFormulario}>
                <div style={estilos.campo}>
                  <label style={estilos.label}>Selecionar Ingrediente</label>
                  <select
                    value={ingredienteAtual.ingredienteId}
                    onChange={(e) => handleSelectIngrediente(e.target.value)}
                    style={estilos.input}
                  >
                    <option value="">-- Escolha um ingrediente --</option>
                    {ingredientes.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.nome} ({ing.raridade})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={estilos.campo}>
                  <label style={estilos.label}>Quantidade</label>
                  <input
                    type="number"
                    style={estilos.input}
                    value={ingredienteAtual.quantidadeNecessaria}
                    onChange={(e) =>
                      setIngredienteAtual({
                        ...ingredienteAtual,
                        quantidadeNecessaria: e.target.value,
                      })
                    }
                    placeholder="Ex: 5"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={adicionarIngrediente}
                style={estilos.botaoAdicionar}
              >
                + Adicionar Ingrediente
              </button>

              {formulario.ingredientes.length > 0 && (
                <div style={estilos.listaIngredientes}>
                  <h4 style={estilos.tituloLista}>Ingredientes Adicionados:</h4>
                  <table style={estilos.tabelaIngredientes}>
                    <thead>
                      <tr>
                        <th style={estilos.thIngrediente}>Ingrediente</th>
                        <th style={estilos.thIngrediente}>Quantidade</th>
                        <th style={estilos.thIngrediente}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formulario.ingredientes.map((ing, idx) => {
                        const ingredienteSelecionado = ingredientes.find(
                          (i) => i.id === ing.ingredienteId
                        );
                        return (
                          <tr key={idx} style={estilos.trIngrediente}>
                            <td style={estilos.tdIngrediente}>
                              {ingredienteSelecionado?.nome || "Desconhecido"}
                            </td>
                            <td style={estilos.tdIngrediente}>
                              {ing.quantidadeNecessaria}
                            </td>
                            <td style={estilos.tdIngrediente}>
                              <button
                                type="button"
                                onClick={() => removerIngrediente(idx)}
                                style={estilos.botaoRemover}
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {erro && <p style={estilos.erro}>{erro}</p>}
            {mensagem && <p style={estilos.sucesso}>{mensagem}</p>}

            <div style={estilos.botoesFormulario}>
              <button type="submit" style={estilos.botaoSalvar} disabled={carregando}>
                {carregando ? "Salvando..." : idEditando ? "Atualizar" : "Criar"}
              </button>
              {idEditando && (
                <button type="button" onClick={handleCancelar} style={estilos.botaoCancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela */}
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>Poções Cadastradas ({poções.length})</h2>

          {poções.length === 0 ? (
            <p style={estilos.vazio}>Nenhuma poção cadastrada ainda.</p>
          ) : (
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Nome</th>
                  <th style={estilos.th}>Efeito</th>
                  <th style={estilos.th}>Duração (min)</th>
                  <th style={estilos.th}>Ingredientes</th>
                  <th style={estilos.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {poções.map((poção) => (
                  <tr key={poção.id} style={estilos.tr}>
                    <td style={estilos.td}>{poção.id}</td>
                    <td style={estilos.td}>{poção.nome}</td>
                    <td style={estilos.td}>{poção.efeito}</td>
                    <td style={estilos.td}>{poção.duracaoMinutos}</td>
                    <td style={estilos.td}>
                      <div style={estilos.ingredientesCell}>
                        {poção.ingredientes && poção.ingredientes.length > 0
                          ? poção.ingredientes
                              .map((ing) => `${ing.ingrediente?.nome} (${ing.quantidadeNecessaria})`)
                              .join(", ")
                          : "Nenhum"}
                      </div>
                    </td>
                    <td style={estilos.td}>
                      <button
                        onClick={() => handleEditar(poção)}
                        style={estilos.botaoEditar}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(poção.id)}
                        style={estilos.botaoDeletar}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: "#0f0e17",
    color: "#fff",
  },
  cabecalho: {
    backgroundColor: "#1a1a2e",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #2e2e4e",
  },
  cabecalhoEsquerda: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  botaoVoltar: {
    padding: "6px 16px",
    backgroundColor: "transparent",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "14px",
  },
  titulo: {
    color: "#a78bfa",
    fontSize: "22px",
    margin: 0,
  },
  cabecalhoDireita: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  nomeUsuario: {
    color: "#ccc",
    fontSize: "14px",
  },
  botaoSair: {
    padding: "6px 16px",
    backgroundColor: "transparent",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "14px",
  },
  botaoNavegar: {
    padding: "6px 16px",
    backgroundColor: "#7c3aed",
    border: "1px solid #7c3aed",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  conteudo: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2e2e4e",
  },
  tituloCard: {
    color: "#a78bfa",
    marginBottom: "20px",
    fontSize: "18px",
  },
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  linhaFormulario: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: "200px",
  },
  label: {
    color: "#ccc",
    fontSize: "13px",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #2e2e4e",
    backgroundColor: "#0f0e17",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  secaoIngredientes: {
    backgroundColor: "#0f0e17",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #2e2e4e",
    marginTop: "12px",
  },
  tituloSecao: {
    color: "#a78bfa",
    fontSize: "14px",
    marginTop: 0,
    marginBottom: "12px",
  },
  botaoAdicionar: {
    padding: "10px 16px",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "12px",
  },
  listaIngredientes: {
    marginTop: "16px",
    backgroundColor: "#0f0e17",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #2e2e4e",
  },
  tituloLista: {
    color: "#ccc",
    fontSize: "13px",
    margin: "0 0 12px 0",
  },
  tabelaIngredientes: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  thIngrediente: {
    textAlign: "left",
    padding: "8px 12px",
    color: "#888",
    borderBottom: "1px solid #2e2e4e",
    fontWeight: "500",
  },
  trIngrediente: {
    borderBottom: "1px solid #1e1e3e",
  },
  tdIngrediente: {
    padding: "8px 12px",
    color: "#ddd",
  },
  botaoRemover: {
    padding: "4px 12px",
    backgroundColor: "transparent",
    border: "1px solid #dc2626",
    color: "#f87171",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  erro: {
    color: "#f87171",
    fontSize: "13px",
  },
  sucesso: {
    color: "#4ade80",
    fontSize: "13px",
  },
  botoesFormulario: {
    display: "flex",
    gap: "12px",
    marginTop: "4px",
  },
  botaoSalvar: {
    padding: "10px 24px",
    backgroundColor: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  botaoCancelar: {
    padding: "10px 24px",
    backgroundColor: "transparent",
    color: "#ccc",
    border: "1px solid #444",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  vazio: {
    color: "#666",
    textAlign: "center",
    padding: "24px",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#888",
    borderBottom: "1px solid #2e2e4e",
    fontWeight: "500",
  },
  tr: {
    borderBottom: "1px solid #1e1e3e",
  },
  td: {
    padding: "12px",
    color: "#ddd",
  },
  ingredientesCell: {
    fontSize: "13px",
    color: "#aaa",
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  botaoEditar: {
    padding: "4px 12px",
    backgroundColor: "transparent",
    border: "1px solid #7c3aed",
    color: "#a78bfa",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginRight: "8px",
  },
  botaoDeletar: {
    padding: "4px 12px",
    backgroundColor: "transparent",
    border: "1px solid #dc2626",
    color: "#f87171",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
};
