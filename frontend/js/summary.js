document.addEventListener("DOMContentLoaded", () => {

    const summaryModal = document.getElementById("summary-modal");
    const closeSummaryBtn = document.getElementById("close-summary-btn");
    const closeSummaryAction = document.getElementById("close-summary-action");
    const summaryModalBody = document.getElementById("summary-modal-body");
    const viewSummaryBtn = document.getElementByIdf("workspace-view-summary");
    // we use a sample text here for development purposes, once the document processor is ready, we'll exctract it from the actual stuff.
    const SAMPLE_TEXT = `
    Cellular respiration is a set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products. The reactions involved in respiration are catabolic reactions, which break large molecules into smaller ones, releasing energy. Respiration is one of the key ways a cell releases chemical energy to fuel cellular activity. The overall reaction occurs in a series of biochemical steps, some of which are redox reactions. Although cellular respiration is technically a combustion reaction, it clearly does not resemble one when it occurs in a living cell because of the slow, controlled release of energy from the series of reactions.
The main stages are Glycolysis, the Krebs cycle, and the Electron Transport Chain. Glycolysis occurs in the cytoplasm and does not require oxygen. The Krebs cycle and Electron Transport Chain occur in the mitochondria and require oxygen.
    `;

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
        const {title, overview, key_concepts, important_points, definitions, quick_review} = SummaryData;
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

    const fetchSummary = async (text) => {
        try {
            const response = await fetch("http://localhost:8000/api/summaries", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({text})
            });

            if (!response.ok) {
                let errorMsg = "Failed to generate summary.";
                try {
                    const errData = await response.json();
                    if (errData.detail) errorMsg = errData.detail;
                } 
                catch (e) {
                    // ignore
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            renderSummary(data);
        }
        catch (error) {
            renderErrorState(error.message || "An unexpected error occured.");
        }
    };

    const openSummaryModal = () => {
        summaryModal.classList.remove("hidden");
        // in a real flow we'd check if we alr have summary cached for this material, we'll generate on the fly for now.
        renderLoadingState();
        setTimeout(() => {
            fetchSummary(SAMPLE_TEXT);
        }, 100);
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