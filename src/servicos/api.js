import axios from "axios";


function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        newObj[camelKey] = toCamelCase(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export async function fazerLogin(email, senha) {
  const resposta = await api.post("/auth/login", { email, senha });
  return resposta.data;
}



export async function buscarUsuarios() {
  const resposta = await api.get("/usuarios");
  return resposta.data;
}

export async function buscarUsuarioPorId(id) {
  const resposta = await api.get(`/usuarios/${id}`);
  return resposta.data;
}

export async function criarUsuario(dados) {
  const resposta = await api.post("/usuarios", dados);
  return resposta.data;
}

export async function atualizarUsuario(id, dados) {
  const resposta = await api.put(`/usuarios/${id}`, dados);
  return resposta.data;
}

export async function deletarUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}



export async function buscarEscolasDeMagia() {
  const resposta = await api.get("/EscolasDeMagia");
  return resposta.data;
}

export async function buscarEscolaDeMagiaPorId(id) {
  const resposta = await api.get(`/EscolasDeMagia/${id}`);
  return resposta.data;
}

export async function criarEscolaDeMagia(dados) {
  const resposta = await api.post("/EscolasDeMagia", dados);
  return resposta.data;
}

export async function atualizarEscolaDeMagia(id, dados) {
  const resposta = await api.put(`/EscolasDeMagia/${id}`, dados);
  return resposta.data;
}

export async function deletarEscolaDeMagia(id) {
  await api.delete(`/EscolasDeMagia/${id}`);
}



export async function buscarIngredientes() {
  const resposta = await api.get("/ingredientes");
  return resposta.data;
}

export async function buscarIngredientePorId(id) {
  const resposta = await api.get(`/ingredientes/${id}`);
  return resposta.data;
}

export async function criarIngrediente(dados) {
  const resposta = await api.post("/ingredientes", dados);
  return resposta.data;
}

export async function atualizarIngrediente(id, dados) {
  const resposta = await api.put(`/ingredientes/${id}`, dados);
  return resposta.data;
}

export async function deletarIngrediente(id) {
  await api.delete(`/ingredientes/${id}`);
}


export async function buscarPoções() {
  const resposta = await api.get("/pocoes");
  return resposta.data;
}

export async function buscarPoçãoPorId(id) {
  const resposta = await api.get(`/pocoes/${id}`);
  return resposta.data;
}

export async function criarPoção(dados) {
  const resposta = await api.post("/pocoes", dados);
  return resposta.data;
}

export async function atualizarPoção(id, dados) {
  const resposta = await api.put(`/pocoes/${id}`, dados);
  return resposta.data;
}

export async function deletarPoção(id) {
  await api.delete(`/pocoes/${id}`);
}

// ========== FEITICEIROS ==========

export async function buscarFeiticeiros() {
  const resposta = await api.get("/feiticeiros");
  return resposta.data;
}

export async function buscarFeiticeiroPorId(id) {
  const resposta = await api.get(`/feiticeiros/${id}`);
  return resposta.data;
}

export async function criarFeiticeiro(dados) {
  const resposta = await api.post("/feiticeiros", dados);
  return resposta.data;
}

export async function atualizarFeiticeiro(id, dados) {
  const resposta = await api.put(`/feiticeiros/${id}`, dados);
  return resposta.data;
}

export async function deletarFeiticeiro(id) {
  await api.delete(`/feiticeiros/${id}`);
}
