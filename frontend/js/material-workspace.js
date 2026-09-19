//material-workspace.js

let selectedMaterial = null;

function openMaterialDetail(id) {

    selectedMaterial = materialsData.find(m => m.id === id);
    if (!selectedMaterial) return;

    renderWorkspace();

    const modal = document.getElementById("material-detail-modal");
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
}

function closeMaterialDetail() {
    const modal = document.getElementById("material-detail-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        selectedMaterial = null;
    }
}

function renderWorkspace() {
    if (!selectedMaterial) return;


    document.getElementById("material-detail-title").textContent = selectedMaterial.title;
    document.getElementById("material-detail-subject").textContent = selectedMaterial.subject;
    document.getElementById("material-detail-type").textContent = selectedMaterial.type;
    document.getElementById("material-detail-status").textContent = selectedMaterial.status;
    document.getElementById("material-detail-date").textContent = selectedMaterial.date;
    

    //show title or state
    let originalText = selectedMaterial.title;
    if (selectedMaterial.source === "notes") {
        originalText = selectedMaterial.title + " (Source: Notes)";
    }
    document.getElementById("material-detail-original").textContent = originalText;
}

function setupMaterialWorkspace() {
    //close btn
    const modalCloseBtn = document.getElementById("close-material-detail-btn");
    const modalCloseAction = document.getElementById("close-material-detail-action");
    const modalOverlay = document.getElementById("material-detail-modal");

    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeMaterialDetail);
    if (modalCloseAction) modalCloseAction.addEventListener("click", closeMaterialDetail);
    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                closeMaterialDetail();
            }
        });
    }

    //flashcards
    const studyFlashcardsBtn = document.getElementById("workspace-study-flashcards");
    if (studyFlashcardsBtn) {
        studyFlashcardsBtn.addEventListener("click", () => {
            closeMaterialDetail();

            const flashcardsNavBtn = document.querySelector('.nav-item[data-view="flashcards"]');
            if (flashcardsNavBtn) {
                flashcardsNavBtn.click();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupMaterialWorkspace();
});