// materials.js

let materialsData = [];
let filteredMaterials = [];

async function loadMaterialsFromStore() {
    await loadMaterialsFromServer();
    materialsData = getMaterials();
    filteredMaterials = [...materialsData];
}


function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'processed': return 'status-completed';
        case 'in progress':
        case 'processing': return 'status-inprogress';
        case 'ready': return 'status-ready';
        case 'new': return 'status-new';
        case 'failed': return 'status-failed';
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

async function refreshMaterials() {
    try {
        await loadMaterialsFromStore();
        renderDashboardMaterials();
        filterMaterials();
    }
    catch (e) {
        console.error("Failed to refresh materials", e);
    }
}


async function initMaterials() {

    const dashboardGrid = document.querySelector("#view-dashboard .materials-grid");
    const libraryGrid = document.getElementById("library-materials-grid");
    const emptyState = document.getElementById("material-empty-state");
    const loadingHTML = `<div class="material-card" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">Loading materials...</div>`;
    if (dashboardGrid) dashboardGrid.innerHTML = loadingHTML;
    if (libraryGrid) {
        libraryGrid.innerHTML = loadingHTML;
        libraryGrid.style.display = "grid";
        if (emptyState) emptyState.classList.add("hidden");
    }

    try {
        await loadMaterialsFromStore();
    }
    catch (e) {
        const errorHTML = `
            <div class="material-card" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                <p style ="margin-bottom: 1rem; color: #dc3545;"Failed to load materials.</p>
                <button class="btn-primary" onclick="initMaterials()">Try Again</button>
            </div>
        `;
        if (dashboardGrid) dashboardGrid.innerHTML = errorHTML;
        if (libraryGrid) {
            libraryGrid.innerHTML = errorHTML;
            libraryGrid.style.display = "grid";
        }
        return;
    }

    //render
    renderDashboardMaterials();
    filterMaterials(); //library grid

    //attach event listeners
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
}