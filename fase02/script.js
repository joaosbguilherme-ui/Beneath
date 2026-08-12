console.log("%cBeneath - Phase 02 - Loading...", "color: #c8a96e; font-size: 14px; font-weight: bold;");

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
  phaseId: "fase02",
  needUser: true,
  next: "",
  hints: []
};

let errors = 0;

console.clear();
console.log("%cWelcome.", "color:white;font-size:22px;");
console.log("%cNot everything is visible.", "color:gray;");

const stage = document.getElementById("stage");
const login = document.getElementById("login");
const message = document.getElementById("message");
const userInput = document.getElementById("user");

function loadPhaseConfig() {
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

document.getElementById("access").addEventListener("click", () => {
  stage.classList.add("hidden");
  login.classList.remove("hidden");
});

document.getElementById("enter").addEventListener("click", () => {
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