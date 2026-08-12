console.log("%cBeneath - Loading...", "color: #c8a96e; font-size: 14px; font-weight: bold;");

// Carrega configuração local de fases
let phasesConfig = {};

(async () => {
  try {
    const response = await fetch('phases-config.json');
    if (!response.ok) throw new Error('Failed to load phases config');
    phasesConfig = await response.json();
    console.log("✓ Fases carregadas do arquivo local");
  } catch (error) {
    console.error("✗ Erro ao carregar phases-config.json:", error);
  }
})();

// Função para obter config de fase (sem CORS!)
function getPhaseConfigLocal(phaseId) {
  const phase = phasesConfig[phaseId];
  if (!phase) return null;
  
  return {
    phaseId,
    needUser: phase.needUser || false,
    next: phase.next || "",
    hints: phase.hints || []
  };
}

// Função para validar resposta
function validateAnswerLocal(phaseId, username = "", password = "") {
  // Aqui você define as respostas corretas
  const ANSWERS = {
    fase01: { password: "undertherug" },
    fase02: { username: "architect", password: "1984" }
  };

  const expected = ANSWERS[phaseId] || {};
  const phase = phasesConfig[phaseId];
  
  if (!phase) {
    return { ok: false, error: "Phase not found" };
  }

  const validUsername = phase.needUser ? username === expected.username : true;
  const validPassword = password === expected.password;

  if (validUsername && validPassword) {
    return {
      ok: true,
      ...getPhaseConfigLocal(phaseId)
    };
  }

  return {
    ok: false,
    ...getPhaseConfigLocal(phaseId)
  };
}

const phase = {
  phaseId: "fase01",
  needUser: false,
  next: "",
  hints: []
};

let errors = 0;

console.clear();
console.log("%cWelcome.", "color:white;font-size:22px;");
console.log("%cNot everything is visible.", "color:gray;");

/* ── Referências DOM ───────────────────────────────────────────── */
const stage      = document.getElementById("stage");
const login      = document.getElementById("login");
const message    = document.getElementById("message");
const img        = document.getElementById("image");
const behindText = document.getElementById("behind-text");
const userInput  = document.getElementById("user");

async function loadPhaseConfig() {
  try {
    const result = getPhaseConfigLocal(phase.phaseId);
    if (result) {
      Object.assign(phase, result);
    }

    if (userInput) {
      userInput.classList.toggle("hidden", !phase.needUser);
    }
  } catch (error) {
    console.error(error);
  }
}

loadPhaseConfig();

/* ── Arrastar imagem ───────────────────────────────────────────── */
let isDragging       = false;
let wasDragged       = false;           // distingue clique de arrasto
let startClientX     = 0;
let startClientY     = 0;
let startImageLeft   = 0;
let startImageTop    = 0;
let currentLeft      = 0;
let currentTop       = 0;
const DRAG_THRESHOLD = 5;               // px mínimos para considerar arrasto

img.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;           // só botão esquerdo
  isDragging    = true;
  wasDragged    = false;
  startClientX  = e.clientX;
  startClientY  = e.clientY;
  startImageLeft = currentLeft;
  startImageTop  = currentTop;
  img.classList.add("grabbing");
  e.preventDefault();                   // impede seleção de texto acidental
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startClientX;
  const dy = e.clientY - startClientY;

  // Marca como arrasto real somente após o threshold
  if (!wasDragged) {
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      wasDragged = true;
    }
  }

  currentLeft = startImageLeft + dx;
  currentTop  = startImageTop + dy;
  img.style.left = currentLeft + "px";
  img.style.top  = currentTop  + "px";
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  img.classList.remove("grabbing");
});

// Cancela arrasto se o cursor sair da janela
document.addEventListener("mouseleave", () => {
  if (isDragging) {
    isDragging = false;
    img.classList.remove("grabbing");
  }
});

/* ── Duplo clique: tornar imagem transparente / opaca ─────────── */
// O texto já é visível por baixo — basta controlar a opacidade da imagem.
let revealed = false;

img.addEventListener("dblclick", () => {
  // Ignora se o segundo clique fez parte de um arrasto real
  if (wasDragged) return;

  revealed = !revealed;
  img.style.opacity       = revealed ? "0" : "1";
  img.style.pointerEvents = revealed ? "none" : "auto";
});

/* ── Autenticação ─────────────────────────────────────────────── */
document.getElementById("access").addEventListener("click", () => {
  stage.classList.add("hidden");
  login.classList.remove("hidden");
});

document.getElementById("enter").addEventListener("click", async () => {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("password").value.trim();

  try {
    const result = validateAnswerLocal(phase.phaseId, u, p);

    if (result.ok) {
      window.location.href = result.next || phase.next;
      return;
    }

    Object.assign(phase, result);
    const hints = phase.hints || [];
    message.textContent = hints[Math.min(errors, hints.length - 1)] || "";
  } catch (error) {
    console.error(error);
  }

  errors++;
});
