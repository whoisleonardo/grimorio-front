import { useState, useEffect } from "react";
import {
  buscarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
} from "../servicos/api";

const FORM_VAZIO = { nome: "", email: "", senha: "", role: "Membro" };

export default function PaginaUsuarios({ aoSair, aoVoltar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(FORM_VAZIO);
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const nomeUsuario = localStorage.getItem("nomeUsuario");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(() => setMensagem(""), 4000);
    return () => clearTimeout(t);
  }, [mensagem]);

  async function carregarUsuarios() {
    try {
      const lista = await buscarUsuarios();
      setUsuarios(lista);
    } catch (erro) {
      setErro("Erro ao carregar usuários: " + erro.message);
    }
  }

  function validarFormulario() {
    if (!formulario.nome || formulario.nome.length < 2)
      return "Nome deve ter no mínimo 2 caracteres";
    if (!formulario.email || !/\S+@\S+\.\S+/.test(formulario.email))
      return "Email inválido";
    if (!idEditando && (!formulario.senha || formulario.senha.length < 6))
      return "Senha deve ter no mínimo 6 caracteres";
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
      if (idEditando) {
        await atualizarUsuario(idEditando, {
          nome: formulario.nome,
          email: formulario.email,
          role: formulario.role,
        });
        setMensagem("Usuário atualizado com sucesso!");
      } else {
        await criarUsuario(formulario);
        setMensagem("Usuário cadastrado com sucesso!");
      }
      setFormulario(FORM_VAZIO);
      setIdEditando(null);
      await carregarUsuarios();
    } catch (erro) {
      setErro(erro.response?.data?.mensagem || 'Erro na operação');
    } finally {
      setCarregando(false);
    }
  }

  function handleEditar(usuario) {
    setIdEditando(usuario.id);
    setFormulario({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      role: usuario.role,
    });
    setErro("");
    setMensagem("");
  }

  async function handleDeletar(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    setErro("");
    try {
      await deletarUsuario(id);
      setMensagem("Usuário excluído com sucesso!");
      await carregarUsuarios();
    } catch (erro) {
      if (erro.response?.status === 403) {
        setErro('Apenas administradores podem excluir usuários.');
      } else {
        setErro(erro.response?.data?.mensagem || 'Erro ao excluir usuário.');
      }
    }
  }

  function handleCancelar() {
    setFormulario(FORM_VAZIO);
    setIdEditando(null);
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
          <h1 style={estilos.titulo}>🔮 Grimório Digital</h1>
        </div>
        <div style={estilos.cabecalhoDireita}>
          <span style={estilos.nomeUsuario}>Olá, {nomeUsuario}</span>
          <button onClick={handleSair} style={estilos.botaoSair}>Sair</button>
        </div>
      </div>

      <div style={estilos.conteudo}>
        {/* Formulário */}
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>
            {idEditando ? "Editar Usuário" : "Novo Usuário"}
          </h2>

          <form onSubmit={handleSalvar} style={estilos.formulario}>
            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Nome *</label>
                <input
                  style={estilos.input}
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div style={estilos.campo}>
                <label style={estilos.label}>Email *</label>
                <input
                  type="email"
                  style={estilos.input}
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div style={estilos.linhaFormulario}>
              {!idEditando && (
                <div style={estilos.campo}>
                  <label style={estilos.label}>Senha *</label>
                  <input
                    type="password"
                    style={estilos.input}
                    value={formulario.senha}
                    onChange={(e) => setFormulario({ ...formulario, senha: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}
              <div style={estilos.campo}>
                <label style={estilos.label}>Role</label>
                <select
                  style={estilos.input}
                  value={formulario.role}
                  onChange={(e) => setFormulario({ ...formulario, role: e.target.value })}
                >
                  <option value="Membro">Membro</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

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

        {/* Tabela */}
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>Usuários Cadastrados ({usuarios.length})</h2>

          {usuarios.length === 0 ? (
            <p style={estilos.vazio}>Nenhum usuário cadastrado ainda.</p>
          ) : (
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Nome</th>
                  <th style={estilos.th}>Email</th>
                  <th style={estilos.th}>Role</th>
                  <th style={estilos.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} style={estilos.tr}>
                    <td style={estilos.td}>{usuario.id}</td>
                    <td style={estilos.td}>{usuario.nome}</td>
                    <td style={estilos.td}>{usuario.email}</td>
                    <td style={estilos.td}>
                      <span style={usuario.role === "Admin" ? estilos.tagAdmin : estilos.tagMembro}>
                        {usuario.role}
                      </span>
                    </td>
                    <td style={estilos.td}>
                      <button
                        onClick={() => handleEditar(usuario)}
                        style={estilos.botaoEditar}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(usuario.id)}
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
  conteudo: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1000px",
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
  tagAdmin: {
    backgroundColor: "#7c3aed22",
    color: "#a78bfa",
    padding: "2px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    border: "1px solid #7c3aed44",
  },
  tagMembro: {
    backgroundColor: "#0e7490220",
    color: "#67e8f9",
    padding: "2px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    border: "1px solid #0e749044",
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
