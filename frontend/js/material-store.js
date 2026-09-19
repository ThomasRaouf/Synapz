// material-store.js

const STORAGE_KEY = "synapz_materials";

// Default demo materials
const defaultMaterials = [
    {
        id: 1,
        subject: "Anatomy",
        title: "Upper Limb Anatomy Notes & Diagrams",
        type: "PDF",
        status: "Completed",
        date: "Added 2 days ago",
        addedAt: new Date(Date.now() - 2 * 86400000).getTime(),
        source: "demo"
    },
    {
        id: 2,
        subject: "Physics",
        title: "Electromagnetism Formulas & Concepts",
        type: "Word Doc",
        status: "In Progress",
        date: "Added 3 days ago",
        addedAt: new Date(Date.now() - 3 * 86400000).getTime(),
        source: "demo"
    },
    {
        id: 3,
        subject: "Biochemistry",
        title: "Metabolic Pathways & Citric Acid Cycle",
        type: "Image",
        status: "Ready",
        date: "Added 1 week ago",
        addedAt: new Date(Date.now() - 7 * 86400000).getTime(),
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

function getMaterials() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            //put the demo materials on first visit
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMaterials));
            return [...defaultMaterials];
        }

        return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to load materials from local storage", e);
        return [...defaultMaterials]
    }
}

function saveMaterials(materials) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch (e) {
        console.error("Failed to save materials to local storage", e);
    }
}

function addMaterial(material) {
    const materials = getMaterials();
    materials.push(material);
    saveMaterials(materials);
    return materials;
}