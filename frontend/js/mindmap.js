// Demo data
const mindMapData = {
    title: "Photosynthesis",
    explanation: "The overarching biological process by which green plants and certain other organisms transform light energy into chemical energy",
    children: [
        {
            title: "Light Reactions",
            explanation: "The first stage of photosynthesis. It requires sunlight and water to produce oxygen, ATP, and NADPH.",
            children: [
                {
                    title: "ATP",
                    explanation: "Adenosine triphosphate (ATP) is the primary energy-carrying molecule produced during the light-dependent reactions."
                },
                {
                    title: "NADPH",
                    explanation: "An electron carrier that holds high-energy electrons, which will be used in the Calvin Cycle to help build sugars."
                }
            ]
        },
        {
            title: "Calvin cycle",
            explanation: "The light-independent reactions that take place in the stroma. It uses ATP and NADPH to convert CO₂ into glucose.",
            children: [
                {
                    title: "CO₂",
                    explanation: "Carbon dioxide gas from the atmosphere is 'fixed' and used as the carbon source to build glucose molecules."
                },
                {
                    title: "Glucose",
                    explanation: "A simple sugar (C₆H₁₂O₆) that stores chemical energy and serves as an important energy source in living organisms."
                }
            ]
        }
    ]
};

// Function to update the sidebar explanation
function updateExplanation(title, explanation) {
    const titleEl = document.getElementById("explanation-title");
    const descEl = document.getElementById("explanation-disc");

    if (titleEl && descEl) {
        titleEl.textContent = title;
        descEl.textContent = explanation || 'No explanation provided for this concept.';
    }
}

// Function to build the tree DOM
function createNodeElement(nodeData) {
    const li = document.createElement('li');

    const nodeDiv = document.createElement('div');
    nodeDiv.className = "mindmap-node";
    nodeDiv.textContent = nodeData.title;

    nodeDiv.addEventListener('click', (e) => {
        e.stopPropagation();

        document.querySelectorAll('.mindmap-node').forEach(el => el.classList.remove('selected'));
        nodeDiv.classList.add('selected');

        updateExplanation(nodeData.title, nodeData.explanation);

        const childUl = li.querySelector('ul');
        if (childUl) {
            nodeDiv.classList.toggle('collapsed')
            childUl.classList.toggle('hidden')
        }
    });

    li.appendChild(nodeDiv);

    // Build child nodes if available
    if (nodeData.children && nodeData.children.length > 0) {
        const ul = document.createElement('ul');

        nodeData.children.forEach(childData => {
            const childLi = createNodeElement(childData);
            ul.appendChild(childLi);
        });

        li.appendChild(ul);
    }

    return li;
}

// Render the mindmap once the page loads
function initMindMap() {
    const treeContainer = document.getElementById('mindmap-tree');

    if (!treeContainer || typeof mindMapData === 'undefined') {
        return;
    }

    treeContainer.innerHTML = '';
    const rootUl = document.createElement('ul');
    const rootLi = createNodeElement(mindMapData);

    rootUl.appendChild(rootLi);
    treeContainer.appendChild(rootUl);

    updateExplanation(
        mindMapData.title,
        mindMapData.explanation
    );

}

document.addEventListener('DOMContentLoaded', () => {
    initMindMap();
});