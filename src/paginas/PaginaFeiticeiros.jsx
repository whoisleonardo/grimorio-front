import { useState, useEffect } from "react";
import { buscarEscolasDeMagia, buscarUsuarios } from "../servicos/api";

const FORM_VAZIO = {
  nome: "",
  nivelMagico: "",
  especialidade: "",
  escolaDeMagiaId: "",
  usuarioId: "",
};

const LOCAL_KEY = "grimorio_feiticeiros";

function getLocalFeiticeiros() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalFeiticeiros(lista) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(lista));
}

export default function PaginaFeiticeiros({ aoVoltar }) {
  const [feiticeiros, setFeiticeiros] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(FORM_VAZIO);
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(() => setMensagem(""), 4000);
    return () => clearTimeout(t);
  }, [mensagem]);

  async function carregarTudo() {
    try {
      const [listaEscolas, listaUsuarios] = await Promise.all([
        buscarEscolasDeMagia(),
        buscarUsuarios(),
      ]);
      setEscolas(listaEscolas);
      setUsuarios(listaUsuarios);
      setFeiticeiros(getLocalFeiticeiros());
    } catch (erro) {
      setErro("Erro ao carregar dados: " + erro.message);
    }
  }

  function carregarFeiticeiros() {
    setFeiticeiros(getLocalFeiticeiros());
  }

  function validarFormulario() {
    if (!formulario.nome || formulario.nome.length < 3)
      return "Nome deve ter no mínimo 3 caracteres";
    if (!formulario.nivelMagico || Number(formulario.nivelMagico) < 1)
      return "Nível mágico deve ser no mínimo 1";
    if (!formulario.especialidade || formulario.especialidade.length < 3)
      return "Especialidade deve ter no mínimo 3 caracteres";
    if (!formulario.escolaDeMagiaId)
      return "Selecione uma escola de magia";
    if (!idEditando && !formulario.usuarioId)
      return "Selecione um usuário";
    return null;
  }

  async function handleSalvar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    const erroValidacao = validarFormulario();
    if (erroValidacao) return setErro(erroValidacao);

    setCarregando(true);
    try {
      const lista = getLocalFeiticeiros();
      const escola = escolas.find(e => e.id === Number(formulario.escolaDeMagiaId));
      const usuario = usuarios.find(u => u.id === Number(formulario.usuarioId));

      if (idEditando) {
        const novaLista = lista.map(f =>
          f.id === idEditando
            ? {
                ...f,
                nome: formulario.nome,
                nivelMagico: Number(formulario.nivelMagico),
                especialidade: formulario.especialidade,
                escolaDeMagiaId: Number(formulario.escolaDeMagiaId),
                nomeEscola: escola?.nome || f.nomeEscola,
              }
            : f
        );
        saveLocalFeiticeiros(novaLista);
        setMensagem("Feiticeiro atualizado com sucesso!");
      } else {
        const novoId = lista.length === 0 ? 1 : Math.max(...lista.map(f => f.id)) + 1;
        const novo = {
          id: novoId,
          nome: formulario.nome,
          nivelMagico: Number(formulario.nivelMagico),
          especialidade: formulario.especialidade,
          escolaDeMagiaId: Number(formulario.escolaDeMagiaId),
          usuarioId: Number(formulario.usuarioId),
          nomeEscola: escola?.nome || "",
          nomeUsuario: usuario?.nome || "",
        };
        saveLocalFeiticeiros([...lista, novo]);
        setMensagem("Feiticeiro cadastrado com sucesso!");
      }

      setFormulario(FORM_VAZIO);
      setIdEditando(null);
      carregarFeiticeiros();
    } catch {
      setErro("Erro na operação");
    } finally {
      setCarregando(false);
    }
  }

  function handleEditar(feiticeiro) {
    setIdEditando(feiticeiro.id);
    setFormulario({
      nome: feiticeiro.nome,
      nivelMagico: String(feiticeiro.nivelMagico),
      especialidade: feiticeiro.especialidade,
      escolaDeMagiaId: String(feiticeiro.escolaDeMagiaId ?? ""),
      usuarioId: "",
    });
    setErro("");
    setMensagem("");
  }

  function handleDeletar(id) {
    if (!confirm("Tem certeza que deseja excluir este feiticeiro?")) return;
    setErro("");
    const lista = getLocalFeiticeiros();
    saveLocalFeiticeiros(lista.filter(f => f.id !== id));
    setMensagem("Feiticeiro excluído com sucesso!");
    carregarFeiticeiros();
  }

  function handleCancelar() {
    setFormulario(FORM_VAZIO);
    setIdEditando(null);
    setErro("");
    setMensagem("");
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.cabecalho}>
        <h1 style={estilos.titulo}>🧙 Feiticeiros</h1>
        <button onClick={aoVoltar} style={estilos.botaoVoltar}>← Voltar</button>
      </div>

      <div style={estilos.conteudo}>
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>
            {idEditando ? "Editar Feiticeiro" : "Novo Feiticeiro"}
          </h2>

          <form onSubmit={handleSalvar} style={estilos.formulario}>
            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Nome *</label>
                <input
                  style={estilos.input}
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Ex: Gandalf"
                />
              </div>
              <div style={estilos.campo}>
                <label style={estilos.label}>Nível Mágico *</label>
                <input
                  style={estilos.input}
                  type="number"
                  min="1"
                  value={formulario.nivelMagico}
                  onChange={(e) => setFormulario({ ...formulario, nivelMagico: e.target.value })}
                  placeholder="Ex: 10"
                />
              </div>
            </div>

            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Especialidade *</label>
                <input
                  style={estilos.input}
                  value={formulario.especialidade}
                  onChange={(e) => setFormulario({ ...formulario, especialidade: e.target.value })}
                  placeholder="Ex: Invocação, Necromancia"
                />
              </div>
              <div style={estilos.campo}>
                <label style={estilos.label}>Escola de Magia *</label>
                <select
                  style={estilos.input}
                  value={formulario.escolaDeMagiaId}
                  onChange={(e) => setFormulario({ ...formulario, escolaDeMagiaId: e.target.value })}
                >
                  <option value="">Selecione uma escola...</option>
                  {escolas.map((escola) => (
                    <option key={escola.id} value={escola.id}>
                      {escola.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!idEditando && (
              <div style={estilos.campo}>
                <label style={estilos.label}>Usuário *</label>
                <select
                  style={estilos.input}
                  value={formulario.usuarioId}
                  onChange={(e) => setFormulario({ ...formulario, usuarioId: e.target.value })}
                >
                  <option value="">Selecione um usuário...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {erro && <p style={estilos.erro}>{erro}</p>}
            {mensagem && <p style={estilos.sucesso}>{mensagem}</p>}

            <div style={estilos.botoesFormulario}>
              <button type="submit" style={estilos.botaoSalvar} disabled={carregando}>
                {carregando ? "Salvando..." : idEditando ? "Atualizar" : "Cadastrar"}
              </button>
              {idEditando && (
                <button type="button" onClick={handleCancelar} style={estilos.botaoCancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>Feiticeiros Cadastrados ({feiticeiros.length})</h2>

          {feiticeiros.length === 0 ? (
            <p style={estilos.vazio}>Nenhum feiticeiro cadastrado ainda.</p>
          ) : (
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Nome</th>
                  <th style={estilos.th}>Nível</th>
                  <th style={estilos.th}>Especialidade</th>
                  <th style={estilos.th}>Escola</th>
                  <th style={estilos.th}>Usuário</th>
                  <th style={estilos.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {feiticeiros.map((feiticeiro) => (
                  <tr key={feiticeiro.id} style={estilos.tr}>
                    <td style={estilos.td}>{feiticeiro.id}</td>
                    <td style={estilos.td}><strong>{feiticeiro.nome}</strong></td>
                    <td style={estilos.td}>
                      <span style={estilos.tagNivel}>{feiticeiro.nivelMagico}</span>
                    </td>
                    <td style={estilos.td}>{feiticeiro.especialidade}</td>
                    <td style={estilos.td}>{feiticeiro.nomeEscola}</td>
                    <td style={estilos.td}>{feiticeiro.nomeUsuario}</td>
                    <td style={estilos.td}>
                      <button onClick={() => handleEditar(feiticeiro)} style={estilos.botaoEditar}>
                        Editar
                      </button>
                      <button onClick={() => handleDeletar(feiticeiro.id)} style={estilos.botaoDeletar}>
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
  titulo: {
    color: "#a78bfa",
    fontSize: "22px",
    margin: 0,
  },
  botaoVoltar: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "#ccc",
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
    fontSize: "18px",
    marginTop: 0,
    marginBottom: "20px",
  },
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  linhaFormulario: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  input: {
    padding: "10px 12px",
    backgroundColor: "#0f0e17",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  erro: {
    backgroundColor: "#3d1f1f",
    border: "1px solid #8b4545",
    color: "#ffb3b3",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    margin: 0,
  },
  sucesso: {
    backgroundColor: "#1f3d2f",
    border: "1px solid #458b6a",
    color: "#b3ffcc",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    margin: 0,
  },
  botoesFormulario: {
    display: "flex",
    gap: "12px",
  },
  botaoSalvar: {
    padding: "10px 20px",
    backgroundColor: "#a78bfa",
    border: "none",
    borderRadius: "6px",
    color: "#000",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  botaoCancelar: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "14px",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#0f0e17",
    color: "#a78bfa",
    padding: "12px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    borderBottom: "2px solid #2e2e4e",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #2e2e4e",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#ccc",
  },
  vazio: {
    textAlign: "center",
    color: "#666",
    padding: "32px",
    fontSize: "14px",
  },
  tagNivel: {
    backgroundColor: "#1e3a5f",
    color: "#93c5fd",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  botaoEditar: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    border: "1px solid #666",
    borderRadius: "4px",
    color: "#a78bfa",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "4px",
  },
  botaoDeletar: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    border: "1px solid #8b4545",
    borderRadius: "4px",
    color: "#ffb3b3",
    cursor: "pointer",
    fontSize: "12px",
  },
};
