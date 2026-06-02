import { useState } from "react";
import PaginaLogin from "./paginas/PaginaLogin";
import PaginaRegistro from "./paginas/PaginaRegistro";
import PaginaUsuarios from "./paginas/PaginaUsuarios";
import PaginaEscolasDeMagia from "./paginas/PaginaEscolasDeMagia";
import PaginaIngredientes from "./paginas/PaginaIngredientes";
import PaginaFeiticeiros from "./paginas/PaginaFeiticeiros";

export default function App() {
  const [tela, setTela] = useState(
    localStorage.getItem("token") ? "home" : "login"
  );

  function handleLogar() {
    setTela("home");
  }

  function handleRegistrar() {
    setTela("login");
  }

  function handleSair() {
    localStorage.removeItem("token");
    localStorage.removeItem("nomeUsuario");
    localStorage.removeItem("roleUsuario");
    setTela("login");
  }

  if (tela === "login") {
    return (
      <PaginaLogin
        aoLogar={handleLogar}
        irParaRegistro={() => setTela("registro")}
      />
    );
  }

  if (tela === "registro") {
    return (
      <PaginaRegistro
        aoRegistrar={handleRegistrar}
        irParaLogin={() => setTela("login")}
      />
    );
  }

  if (tela === "home") {
    return <PaginaHome aoSair={handleSair} irPara={setTela} />;
  }

  if (tela === "usuarios") {
    return <PaginaUsuarios aoSair={handleSair} />;
  }

  if (tela === "escolas") {
    return <PaginaEscolasDeMagia aoVoltar={() => setTela("home")} />;
  }

  if (tela === "ingredientes") {
    return <PaginaIngredientes aoVoltar={() => setTela("home")} />;
  }

  if (tela === "feiticeiros") {
    return <PaginaFeiticeiros aoVoltar={() => setTela("home")} />;
  }
}

function PaginaHome({ aoSair, irPara }) {
  const nomeUsuario = localStorage.getItem("nomeUsuario");
  
  return (
    <div style={estilosHome.pagina}>
      <div style={estilosHome.cabecalho}>
        <h1 style={estilosHome.titulo}>🔮 Grimório Digital</h1>
        <div style={estilosHome.cabecalhoDireita}>
          <span style={estilosHome.nomeUsuario}>Olá, {nomeUsuario}</span>
          <button onClick={aoSair} style={estilosHome.botaoSair}>Sair</button>
        </div>
      </div>

      <div style={estilosHome.conteudo}>
        <h2 style={estilosHome.subtitulo}>Escolha o que deseja gerenciar:</h2>
        
        <div style={estilosHome.grade}>
          <div style={estilosHome.card} onClick={() => irPara("usuarios")}>
            <div style={estilosHome.icone}>👥</div>
            <h3 style={estilosHome.nomeCard}>Usuários</h3>
            <p style={estilosHome.descricao}>Gerencie usuários do sistema</p>
          </div>

          <div style={estilosHome.card} onClick={() => irPara("escolas")}>
            <div style={estilosHome.icone}>📚</div>
            <h3 style={estilosHome.nomeCard}>Escolas de Magia</h3>
            <p style={estilosHome.descricao}>Cadastre e edite escolas de magia</p>
          </div>

          <div style={estilosHome.card} onClick={() => irPara("ingredientes")}>
            <div style={estilosHome.icone}>🧪</div>
            <h3 style={estilosHome.nomeCard}>Ingredientes</h3>
            <p style={estilosHome.descricao}>Gerencie ingredientes para poções</p>
          </div>

          <div style={estilosHome.card} onClick={() => irPara("feiticeiros")}>
            <div style={estilosHome.icone}>🧙</div>
            <h3 style={estilosHome.nomeCard}>Feiticeiros</h3>
            <p style={estilosHome.descricao}>Gerencie os feiticeiros do grimório</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const estilosHome = {
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
    padding: "48px 32px",
    textAlign: "center",
  },
  subtitulo: {
    color: "#a78bfa",
    fontSize: "20px",
    marginBottom: "40px",
  },
  grade: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: "12px",
    padding: "32px 24px",
    border: "1px solid #2e2e4e",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center",
  },
  icone: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  nomeCard: {
    color: "#a78bfa",
    fontSize: "18px",
    margin: "0 0 8px 0",
  },
  descricao: {
    color: "#999",
    fontSize: "14px",
    margin: 0,
  },
};
