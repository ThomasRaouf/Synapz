document.addEventListener("DOMContentLoaded", () => {

    const summaryModal = document.getElementById("summary-modal");
    const closeSummaryBtn = document.getElementById("close-summary-btn");
    const closeSummaryAction = document.getElementById("close-summary-action");
    const summaryModalBody = document.getElementById("summary-modal-body");
    const viewSummaryBtn = document.getElementByIdf("workspace-view-summary");
    

    const renderLoadingState = () => {
        summaryModalBody.innerHTML = `
            <div class="summary-loading">
                <div class="summary-spinner"></div>
                <div class="summary-loading-text">Analyzing your material...</div>
                <div class="summary-loading-subtext">Generating a structured study summary</div>
            </div>
        `;
    };

    const renderErrorState = (message) => {
        summaryModalBody.innerHTML = `
            <div class="summary-error">
                <h4>Error Generating Summary</h4>
                <p>${message}</p>
            </div>
        `;
    };

    const renderSummary = (SummaryData) => {
        const { title, overview, key_concepts, important_points, definitions, quick_review } = SummaryData;
        let html = `<div class="summary-container">`;
        html += `
            <div class="summary-section">
                <h4>Overview</h4>
                <p>${overview}</p>
            </div>
        `;

        if (key_concepts && key_concepts.length > 0) {
            html += `
                <div class="summary-section">
                    <h4>Key Concepts</h4>
                    <ul class="summary-list">
                        ${key_concepts.map(concept => `<li>${concept}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (important_points && important_points.length > 0) {
            html += `
                <div class="summary-section">
                    <h4>Important Points</h4>
                    <ul class="summary-list">
                        ${important_points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (definitions && definitions.length > 0) {
            html += `
                <div class="summary-section">
                    <h4>Definitions</h4>
                    <div class="summary-definitions">
                        ${definitions.map(def => `
                            <div class="definition-item">
                                <span class="definition-term">${def.term}</span>
                                <span class="definition-text">${def.definition}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

            `;
        }

        if (quick_review && quick_review.length > 0) {
            html += `
                <div class="summary-section">
                    <h4>Quick Review</h4>
                    <ul class="summary-list">
                        ${quick_review.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        html += `</div>`;
        summaryModalBody.innerHTML = html;

        const titleEl = document.getElementById("summary-modal-title");
        if (titleEl && title) {
            titleEl.textContent = title;
        }


    };

    const loadAndRenderSummary = async () => {
        if (!window.selectedMaterial) {
            renderErrorState("No material selected.");
            return;
        }

        const materialId = window.selectedMaterial.id;
        renderLoadingState();

        try {
            let envelope;
            try {
                envelope = await fetchSummary(materialId);
            }
            catch (err) {
                if (!err.message.includes("Summary not found") && !err.message.includes("Not Found")) {
                    throw errl
                }
            }

            if (!envelope || !envelope.summary) {
                envelpoe = await generateSummary(materialId);
            }
            if (envelope && envelope.success && envelope.summary) {
                renderSummary(envelope.summary);

            }
            else {
                throw new Error("Invalid summary format returned by server.");
            }
        }
        catch (error) {
            console.error("Summary error:", error);
            renderErrorState(error.message || "An unexpected error occured.");
        }


    };

    const openSummaryModal = () => {
        summaryModal.classList.remove("hidden");
        loadAndRenderSummary();
    };

    const closeSummaryModal = () => {
        summaryModal.classList.add("hidden");
        const titleEl = document.getElementById("summary-modal-title");
        if (titleEl) titleEl.textContent = "AI Summary";
    };

    if (viewSummaryBtn) {
        viewSummaryBtn.addEventListener("click", openSummaryModal);
    }

    if (closeSummaryBtn) {
        closeSummaryBtn.addEventListener("click", closeSummaryModal);

    }

    if (closeSummaryAction) {
        closeSummaryAction.addEventListener("click", closeSummaryModal);
    }

    summaryModal.addEventListener("click", (e) => {
        if (e.target === summaryModal) {
            closeSummaryModal();
        }
    });
});
