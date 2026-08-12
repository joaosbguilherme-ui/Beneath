console.log("%cBeneath - Phase 03 - Loading...", "color: #c8a96e; font-size: 14px; font-weight: bold;");

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
