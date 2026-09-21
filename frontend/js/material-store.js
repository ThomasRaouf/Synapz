const defaultMaterials = [
    {
        id: 1,
        subject: "Anatomy",
        title: "Upper Limb Anatomy Notes & Diagrams",
        type: "PDF",
        status: "Completed",
        date: "Added 2 days ago",
        addedAt: new Date(Date.now() - 2*86400000).getTime(),
        source: "demo"
    }, 
    {
        id: 2,
        subject: "Biochemistry",
        title: "Metabolic Pathways & Citric Acid Cycle",
        type: "Image",
        status: "Ready",
        date: "Added 1 week ago",
        addedAt: new Date(Date.now() - 7*86400000).getTime(),
        source: "demo"
    }, 
    {
        id: 3,
        subject: "Physics",
        title: "Electromagnetism Formulas & Concepts",
        type: "Word Doc",
        status: "In Progress",
        date: "Added 3 days ago",
        addedAt: new Date(Date.now() - 3*86400000).getTime(),
        source: "demo"
    }, 
    {
        id: 4,
        subject: "Calculus",
        title: "Derivatives Practice Problems",
        type: "Text",
        status: "New",
        date: "Added just now",
        addedAt: Date.now(),
        source: "demo"
    }
];

let inMemoryMaterials = null;
function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs/86400000);
    if (diffDays <= 0) return "Added just now";
    if (diffDays === 1) return "Added 1 day ago";
    if (diffDays < 7) return `Added ${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays/7);
    if (diffWeeks === 1) return "Added 1 week ago";
    return `Added ${diffWeeks} weeks ago`;
}

function mapApiToFrontend(apiMaterial) {
    let type = apiMaterial.type;
    if (type === "DOCX") type = "Word Doc";
    return {
        id: apiMaterial.id,
        subject: apiMaterial.subject || "General",
        title: apiMaterial.title,
        type: type,
        status: apiMaterial.status,
        date: formatRelativeDate(apiMaterial.created_at),
        addedAt: new Date(apiMaterial.created_at).getTime(),
        source: apiMaterial.source
    };

}

async function loadMaterialsFromServer() {
    const response = await fetchMAterials();
    if (response.success && response.materials.length > 0) {
        inMemoryMaterials = response.material.map(mapApiToFrontend);
    }
    else {
        inMemoryMaterials = [...defaultMaterials];
    }
}

function getMaterials() {
    if (!inMemoryMaterials) {
        return [...defaultMaterials];
    }
    return inMemoryMaterials;
}

function addMaterial(material) {
    if (!inMemoryMaterials) {
        inMemoryMaterials = [];
    }
    inMemoryMaterials.push(material);
    return inMemoryMaterials;
}
