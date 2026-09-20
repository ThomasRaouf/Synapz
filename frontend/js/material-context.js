const CURRENT_MATERIAL_KEY = "synapz_current_material";

function setCurrentMaterial(id) {
    if (id) {
        sessionStorage.setItem(CURRENT_MATERIAL_KEY, id);
    } else {
        clearCurrentMaterial();
    }
}

function getCurrentMaterial() {
    const id = sessionStorage.getItem(CURRENT_MATERIAL_KEY);
    if (!id) return null;


    if (typeof getMaterials === 'function') {
        const materials = getMaterials();
        return materials.find(m => m.id.toString() === id.toString()) || null;
    }
    return null;
}

function clearCurrentMaterial() {
    sessionStorage.removeItem(CURRENT_MATERIAL_KEY);
}

function updateMaterialContextDisplays() {
    const material = getCurrentMaterial();
    const flashcardsContext = document.getElementById("flashcards-material-context");
    const quizSelectionContext = document.getElementById("quiz-material-context");
    const activeQuizContext = document.getElementById("active-quiz-material-context");
    const mindmapContext = document.getElementById("mindmap-material-context");

    if (material) {
        if (flashcardsContext) {
            flashcardsContext.innerHTML = `<strong>Studying: ${material.title}</strong><br><span style="font-size: 12px;">Demo flashcards are shown for now.</span>`;
            flashcardsContext.style.display = "block";
        }
        if (quizSelectionContext) {
            quizSelectionContext.innerHTML = `<strong>Studying: ${material.title}</strong><br><span style="font-size: 12px;">Practice with the current demo quiz.</span>`;
            quizSelectionContext.style.display = "block";
        }
        if (activeQuizContext) {
            activeQuizContext.innerHTML = `<strong>Studying: ${material.title}</strong>`;
            activeQuizContext.style.display = "block";
        }
        if (mindmapContext) {
            mindmapContext.innerHTML = `<strong>Studying: ${material.title}</strong><br><span style="font-size: 12px;">Demo mind map is shown for now.</span>`;
            mindmapContext.style.display = "block";
        }
    } else {
        if (flashcardsContext) flashcardsContext.style.display = "none";
        if (quizSelectionContext) quizSelectionContext.style.display = "none";
        if (activeQuizContext) activeQuizContext.style.display = "none";
        if (mindmapContext) mindmapContext.style.display = "none";
    }
}