// materials.js

// Demo Data for Recent Materials (with timestamps)
const materialsData = [
    {
        id: 1,
        subject: "Anatomy",
        title: "Upper Limb Anatomy Notes & Diagrams",
        type: "PDF",
        status: "Completed",
        date: "Added 2 days ago",
        addedAt: new Date(Date.now() - 2 * 86400000).getTime()
    },
    {
        id: 2,
        subject: "Physics",
        title: "Electromagnetism Formulas & Concepts",
        type: "Word Doc",
        status: "In Progress",
        date: "Added 3 days ago",
        addedAt: new Date(Date.now() - 3 * 86400000).getTime()
    },
    {
        id: 3,
        subject: "Biochemistry",
        title: "Metabolic Pathways & Citric Acid Cycle",
        type: "Image",
        status: "Ready",
        date: "Added 1 week ago",
        addedAt: new Date(Date.now() - 7 * 86400000).getTime()
    },
    {
        id: 4,
        subject: "Calculus",
        title: "Derivatives Practice Problems",
        type: "Text",
        status: "New",
        date: "Added just now",
        addedAt: Date.now()
    }
];

let filteredMaterials = [...materialsData];

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