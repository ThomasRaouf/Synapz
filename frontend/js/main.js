// main.js

// Demo Data for Recent Materials
const recentMaterials = [
  {
    subject: "Anatomy",
    title: "Upper Limb Anatomy Notes & Diagrams",
    type: "PDF",
    status: "Completed",
    date: "Added 2 days ago"
  },
  {
    subject: "Physics",
    title: "Electromagnetism Formulas & Concepts",
    type: "Word Doc",
    status: "In Progress",
    date: "Added 3 days ago"
  },
  {
    subject: "Biochemistry",
    title: "Metabolic Pathways & Citric Acid Cycle",
    type: "Image",
    status: "Ready",
    date: "Added 1 week ago"
  },
  {
    subject: "Calculus",
    title: "Derivatives Practice Problems",
    type: "Text",
    status: "New",
    date: "Added just now"
  }
];

// Helper to determine status class for styling
function getStatusClass(status) {
  switch(status.toLowerCase()) {
    case 'completed': return 'status-completed';
    case 'in progress': return 'status-inprogress';
    case 'ready': return 'status-ready';
    case 'new': return 'status-new';
    default: return 'status-new';
  }
}

// Render Material Cards into the Grid
function renderMaterials() {
  const grids = document.querySelectorAll(".materials-grid");
  if (grids.length === 0) return;

  grids.forEach(grid => {
    grid.innerHTML = ""; // Clear any existing content
    
    recentMaterials.forEach(material => {
      const card = document.createElement("div");
      card.className = "material-card";
      
      card.innerHTML = `
        <div class="card-header">
          <span class="card-type">${material.type}</span>
          <span class="card-status ${getStatusClass(material.status)}">${material.status}</span>
        </div>
        <div class="card-content">
          <h4>${material.subject}</h4>
          <p>${material.title}</p>
        </div>
        <div class="card-footer">
          <span>${material.date}</span>
        </div>
      `;
      
      grid.appendChild(card);
    });
  });
}

// Handle Client-Side Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view-section");
  const pageTitle = document.querySelector(".page-title");
  const sidebar = document.getElementById("sidebar");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Update URL without jumping
      history.pushState(null, '', item.getAttribute("href"));

      // Get target view
      const targetViewName = item.getAttribute("data-view");
      const targetViewId = "view-" + targetViewName;

      // Update active nav state
      navItems.forEach(nav => {
        nav.classList.remove("active");
        nav.removeAttribute("aria-current");
      });
      item.classList.add("active");
      item.setAttribute("aria-current", "page");

      // Update page title
      if (pageTitle) {
        pageTitle.textContent = item.textContent;
      }

      // Show target view, hide others
      views.forEach(view => {
        if (view.id === targetViewId) {
          view.style.display = "block";
        } else {
          view.style.display = "none";
        }
      });

      // close mobile sidebar
      if (sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    });
  });

  // Handle initial load based on hash
  const initialHash = window.location.hash;
  if (initialHash) {
    const targetLink = document.querySelector(`.nav-item[href="${initialHash}"]`);
    if (targetLink) {
      targetLink.click();
    }
  }
}

// Setup simple UI Interactions (Mock upload, mobile sidebar)
function setupInteractions() {
  // Mobile Sidebar Toggle
  const sidebar = document.getElementById("sidebar");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileCloseBtn = document.getElementById("mobile-close");
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  }
  
  if (mobileCloseBtn && sidebar) {
    mobileCloseBtn.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }
  
  // Upload btn is now handled by setupUploadModal
}

// Preserve existing backend call pattern for future reference
// The backend runs on a different port than the frontend during local
// development, so we call it directly using its full address.

const BACKEND_URL = "http://127.0.0.1:8000";

async function callBackend(path) {
  const response = await fetch(BACKEND_URL + path);

  if (!response.ok) {
    throw new Error("Backend request failed with status " + response.status);
  }

  return response.json();
}

function setupUploadModal() {
  const uploadBtn = document.getElementById("upload-material-btn");
  const modal = document.getElementById("upload-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const dropZoneContent = document.getElementById("drop-zone-content");
  const fileDisplay = document.getElementById("file-display");
  const fileNameDisplay = document.getElementById("selected-file-name");
  const removeFileBtn = document.getElementById("remove-file-btn");
  const notesInput = document.getElementById("notes-input");
  const submitBtn = document.getElementById("submit-material-btn");
  const validationMessage = document.getElementById("validation-message");

  let selectedFile = null;

  if (uploadBtn && modal) {
    uploadBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
    });
  }
  
  const closeModal = () => {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    resetForm();
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal;
      }
    });
  }

  if (!dropZone) return;

  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add("dragover");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove("dragover");
    }, false);
  });

  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }, false);

  dropZone.addEventListener("click", (e) => {
    if (e.target !== removeFileBtn && !removeFileBtn.contains(e.target)) {
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", function() {
    handleFiles(this.files);
  });

  function handleFiles(files) {
    if (files.length > 0) {
      selectedFile = files[0];
      showFileDisplay(selectedFile.name);
      hideValidation();
    }
  }

  function showFileDisplay(name) {
    fileNameDisplay.textContent = name;
    dropZoneContent.classList.add("hidden");
    dropZoneContent.style.display = "none";
    fileDisplay.classList.remove("hidden");

  }

  function resetFile() {
    selectedFile = null;
    fileInput.value = "";
    fileDisplay.classList.add("hidden");
    dropZoneContent.classList.remove("hidden");
    dropZoneContent.style.display = "flex";

  }

  removeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetFile();
  });

  notesInput.addEventListener("input", hideValidation);

  function hideValidation() {
    validationMessage.classList.add("hidden");
  }

  function resetForm() {
    resetFile();
    notesInput.value = "";
    hideValidation();
    submitBtn.disabled = false;
    submitBtn.querySelector(".btn-text").textContent = "Process Material";
    submitBtn.querySelector(".btn-loader").classList.add("hidden");
  }

  submitBtn.addEventListener("click", () => {
    const hasFile = selectedFile !== null;
    const hasNotes = notesInput.value.trim().length > 0;

    if (!hasFile && !hasNotes) {
      validationMessage.classList.remove("hidden");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-text").textContent = "Processing...";
    submitBtn.querySelector(".btn-loader").classList.remove("hidden");

    setTimeout (() => {
      closeModal();
      const uploadMessage = document.getElementById("upload-message");
      if (uploadMessage) {
        uploadMessage.innerHTML = "<p><strong>Success!</strong> Material uploaded successfully.</p>";
        uploadMessage.classList.remove("hidden");
        setTimeout (() => {
          uploadMessage.classList.add("hidden");
          setTimeout(() => {
            uploadMessage.innerHTML = "<p><strong>Demo Mode:</strong> Actual file uploading will be implemented in the future.</p>";
          }, 300);
        }, 4000);
      }
      
    }, 1500);

  });


}

// Initialize Dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderMaterials();
  setupInteractions();
  setupUploadModal();
});
