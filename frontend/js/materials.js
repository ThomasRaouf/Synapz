// materials.js

let materialsData = [];
let filteredMaterials = [];

function loadMaterialsFromStore() {
    materialsData = getMaterials();
    filteredMaterials = [...materialsData];
}


function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'in progress': return 'status-inprogress';
        case 'ready': return 'status-ready';
        case 'new': return 'status-new';
        default: return 'status-new';
    }
}

// Generate HTML for a single card
function createCardHTML(material) {
  return `
    <div class="card-header">
      <span class="card-type">${material.type}</span>
      <span class="card-status ${getStatusClass(material.status)}">${material.status}</span>
    </div>
    <div class="card-content">
      <h4>${material.subject}</h4>
      <p>${material.title}</p>
    </div>
    <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
      <span>${material.date}</span>
      <button class="btn-open-material btn-primary" style="padding: 6px 12px; font-size: 13px;" data-id="${material.id}">Open</button>
    </div>
  `;
}

// Render cards into a specific container
function renderCardsToGrid(gridElement, materialsArray) {
    if (!gridElement) return;
    gridElement.innerHTML = "";

    materialsArray.forEach(material => {
        const card = document.createElement("div");
        card.className = "material-card";
        card.innerHTML = createCardHTML(material);
        gridElement.appendChild(card);
    });

    // Attach event listeners to the new "Open" buttons
    const openButtons = gridElement.querySelectorAll(".btn-open-material");
    openButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute("data-id"));
            openMaterialDetail(id);
        });
    });
}

// Render dashboard materials
function renderDashboardMaterials() {
    const dashboardGrid = document.querySelector("#view-dashboard .materials-grid");
    if (dashboardGrid) {
        // Sort by newest for dashboard
        const recent = [...materialsData].sort((a, b) => b.addedAt - a.addedAt);
        renderCardsToGrid(dashboardGrid, recent);
    }
}

// Main filter logic
function filterMaterials() {
    const searchInput = document.getElementById("material-search").value.toLowerCase();
    const typeFilter = document.getElementById("material-type-filter").value;
    const statusFilter = document.getElementById("material-status-filter").value;
    const sortSelect = document.getElementById("material-sort").value;

    filteredMaterials = materialsData.filter(material => {
        // Search match
        const searchMatch = material.subject.toLowerCase().includes(searchInput) || 
                        material.title.toLowerCase().includes(searchInput) ||
                        material.type.toLowerCase().includes(searchInput);

        // Type match
        const typeMatch = typeFilter === "All" || material.type === typeFilter;

        //Status match
        const statusMatch = statusFilter === "All" || material.status === statusFilter;

        return searchMatch && typeMatch && statusMatch;
    });

    // Sort
    filteredMaterials.sort((a, b) => {
        if (sortSelect === "newest") {
            return b.addedAt - a.addedAt;
        } else if (sortSelect === "oldest") {
            return a.addedAt - b.addedAt;
        } else if (sortSelect === "az") {
            return a.title.localeCompare(b.title);
        } else if (sortSelect === "za") {
            return b.title.localeCompare(a.title);
        }
        return 0;
    });

    updateLibraryView();
}

function updateLibraryView() {
    const grid = document.getElementById("library-materials-grid");
    const emptyState = document.getElementById("material-empty-state");

    if (!grid || !emptyState) return;

    if (filteredMaterials.length === 0) {
        grid.style.display = "none";
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        grid.style.display = "grid"; // from css
        renderCardsToGrid(grid, filteredMaterials);
    }
}

function clearFilters() {
    document.getElementById("material-search").value = "";
    document.getElementById("material-type-filter").value = "All";
    document.getElementById("material-status-filter").value = "All";
    document.getElementById("material-sort").value = "newest";
    filterMaterials();
}

// Modal handling
function openMaterialDetail(id) {
    const material = materialsData.find(m => m.id === id);
    if (!material) return;

    const modal = document.getElementById("material-detail-modal");
    document.getElementById("material-detail-title").textContent = material.title;
    document.getElementById("material-detail-subject").textContent = material.subject;
    document.getElementById("material-detail-type").textContent = material.type;
    document.getElementById("material-detail-status").textContent = material.status;
    document.getElementById("material-detail-date").textContent = material.date;
    
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
}

function closeMaterialDetail() {
    const modal = document.getElementById("material-detail-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    }
}

//Refresh materials after upload
function refreshMaterials() {
    loadMaterialsFromStore();
    renderDashboardMaterials();
    filterMaterials(); //re-apply existing filters
}

// Initialize Materials features
function initMaterials() {
    loadMaterialsFromStore();
    // Render initial items
    renderDashboardMaterials();
    filterMaterials(); //library grid

    // Attach event listeners
    const searchInput = document.getElementById("material-search");
    const typeFilter = document.getElementById("material-type-filter");
    const statusFilter = document.getElementById("material-status-filter");
    const sortSelect = document.getElementById("material-sort");
    const clearBtn = document.getElementById("clear-filters-btn");
    const emptyClearBtn = document.getElementById("empty-clear-btn");

    if (searchInput) searchInput.addEventListener("input", filterMaterials);
    if (typeFilter) typeFilter.addEventListener("change", filterMaterials);
    if (statusFilter) statusFilter.addEventListener("change", filterMaterials);
    if (sortSelect) sortSelect.addEventListener("change", filterMaterials);
    if (clearBtn) clearBtn.addEventListener("click", clearFilters);
    if (emptyClearBtn) emptyClearBtn.addEventListener("click", clearFilters);

    // Modal close buttons
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
}