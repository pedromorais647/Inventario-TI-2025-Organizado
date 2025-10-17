import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ⚡ Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAX2IR9GqzQA4kpw1oofR8j0pmEtqvv76E",
  authDomain: "inventario-ti-ef613.firebaseapp.com",
  projectId: "inventario-ti-ef613",
  storageBucket: "inventario-ti-ef613.appspot.com",
  messagingSenderId: "615081561359",
  appId: "1:615081561359:web:75cf090cee3f0c7baec27a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const itensCollection = collection(db, "estoque");
const tabela = document.getElementById("tabela");

// 🔄 Carregar tabela
async function carregarTabela() {
  tabela.innerHTML = "";
  const querySnapshot = await getDocs(itensCollection);
  let id = 1;
  querySnapshot.forEach((docSnap) => {
    const item = docSnap.data();
    let ultima = "—";
    if (item.ultimaAtualizacao) {
      const data = new Date(item.ultimaAtualizacao.seconds * 1000);
      const dataFormatada = data.toLocaleDateString("pt-BR");
      const tipo = item.tipoAtualizacao ? ` (${item.tipoAtualizacao})` : "";
      ultima = `${dataFormatada}${tipo}`;
    }

    tabela.innerHTML += `
      <tr>
        <td>${id++}</td>
        <td>${item.nome}</td>
        <td>${item.descricao}</td>
        <td>${item.quantidade}</td>
        <td>${ultima}</td>
        <td>
          <button class="btn-entrada" onclick="entrada('${docSnap.id}', ${item.quantidade})">Entrada</button>
          <button class="btn-saida" onclick="saida('${docSnap.id}', ${item.quantidade})">Saída</button>
          <button class="btn-edit" onclick="editar('${docSnap.id}', '${item.nome}', '${item.descricao}', ${item.quantidade})">Editar</button>
          <button class="btn-del" onclick="excluir('${docSnap.id}')">Excluir</button>
        </td>
      </tr>
    `;
  });
}

// ➕ Adicionar item
window.adicionarItem = async function() {
  const nome = document.getElementById("nome").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const quantidade = parseInt(document.getElementById("quantidade").value) || 0;

  if (!nome) return alert("Digite o nome do item!");

  await addDoc(itensCollection, { 
    nome, 
    descricao, 
    quantidade, 
    ultimaAtualizacao: serverTimestamp(),
    tipoAtualizacao: "Criação"
  });

  document.getElementById("nome").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("quantidade").value = "";
  carregarTabela();
};

// 📦 Entrada
window.entrada = async function(id, atual) {
  const qtd = parseInt(prompt("Quantidade de entrada:"));
  if (qtd > 0) {
    const ref = doc(db, "estoque", id);
    await updateDoc(ref, { 
      quantidade: atual + qtd,
      ultimaAtualizacao: serverTimestamp(),
      tipoAtualizacao: "Entrada"
    });
    carregarTabela();
  }
};

// 📤 Saída
window.saida = async function(id, atual) {
  const qtd = parseInt(prompt("Quantidade de saída:"));
  if (qtd > 0 && atual >= qtd) {
    const ref = doc(db, "estoque", id);
    await updateDoc(ref, { 
      quantidade: atual - qtd,
      ultimaAtualizacao: serverTimestamp(),
      tipoAtualizacao: "Saída"
    });
    carregarTabela();
  } else {
    alert("Quantidade inválida!");
  }
};

// ✏️ Editar item
window.editar = async function(id, nomeAtual, descAtual, qtdAtual) {
  const novoNome = prompt("Novo nome do item:", nomeAtual);
  const novaDescricao = prompt("Nova descrição:", descAtual);
  const novaQuantidade = parseInt(prompt("Nova quantidade:", qtdAtual));

  if (!novoNome || isNaN(novaQuantidade)) return alert("Valores inválidos!");

  const ref = doc(db, "estoque", id);
  await updateDoc(ref, {
    nome: novoNome.trim(),
    descricao: novaDescricao.trim(),
    quantidade: novaQuantidade,
    ultimaAtualizacao: serverTimestamp(),
    tipoAtualizacao: "Edição"
  });
  carregarTabela();
};

// ❌ Excluir
window.excluir = async function(id) {
  if (confirm("Tem certeza que deseja excluir este item?")) {
    await deleteDoc(doc(db, "estoque", id));
    carregarTabela();
  }
};

// Inicializar tabela
carregarTabela();
