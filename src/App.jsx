import { useState } from "react";
import PaginaLogin from "./paginas/PaginaLogin";
import PaginaRegistro from "./paginas/PaginaRegistro";
import PaginaUsuarios from "./paginas/PaginaUsuarios";

export default function App() {
  const [tela, setTela] = useState(
    localStorage.getItem("token") ? "usuarios" : "login"
  );

  function handleLogar() {
    setTela("usuarios");
  }

  function handleRegistrar() {
    setTela("login");
  }

  function handleSair() {
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

  return <PaginaUsuarios aoSair={handleSair} />;
}
