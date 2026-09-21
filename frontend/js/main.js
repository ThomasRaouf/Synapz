// main.js

// Material data and rendering have been moved to materials.js

// Handle Client-Side Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view-section");
  const pageTitle = document.querySelector(".page-title");
  const sidebar = document.getElementById("sidebar");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      const targetViewName = item.getAttribute("data-view");
      if (!targetViewName) return;

      e.preventDefault();

      history.pushState(null, '', item.getAttribute("href"));

      const targetViewId = "view-" + targetViewName;

      navItems.forEach(nav => {
        nav.classList.remove("active");
        nav.removeAttribute("aria-current");
      });
      item.classList.add("active");
      item.setAttribute("aria-current", "page");

      if (pageTitle) {
        pageTitle.textContent = item.textContent;
      }

      views.forEach(view => {
        if (view.id === targetViewId) {
          view.style.display = "block";
        } else {
          view.style.display = "none";
        }
      });

      if (targetViewName === "dashboard" || targetViewName === "materials") {
        if (typeof clearCurrentMaterial === 'function') {
          clearCurrentMaterial();
        }
      }

      if (typeof updateMaterialContextDisplays === 'function') {
        updateMaterialContextDisplays();
      }

      if (targetViewName === "mindmaps") {
        initMindMap();
      }

      if (sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    });
  });

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
        closeModal();
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

  fileInput.addEventListener("change", function () {
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

  function getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['doc', 'docx'].includes(ext)) return 'Word Doc';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
    return 'Text';
  }

  function getNotesTitle(notes) {
    const lines = notes.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines.length > 0 ? lines[0] : 'Untitled Notes';
  }

  submitBtn.addEventListener("click", async () => {
    const hasFile = selectedFile !== null;
    const hasNotes = notesInput.value.trim().length > 0;

    if (!hasFile && !hasNotes) {
      validationMessage.textContent = "Please provide some study material.";
      validationMessage.classList.remove("hidden");
      return;
    }

    if (hasFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      const supportedExts = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!supportedExts.includes(ext)) {
        validationMessage.textContent = "Unsupported file type.";
        validationMessage.classList.remove("hidden");
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-text").textContent = "Processing...";
    submitBtn.querySelector(".btn-loader").classList.remove("hidden");

    const uploadMessage = document.getElementById("upload-message");
    if (uploadMessage) {
      uploadMessage.classList.add("hidden");
    }

    const formData = new FormData();

    if (hasFile) {
      formData.append("file", selectedFile);
    } else {
      formData.append("title", getNotesTitle(notesInput.value));
      formData.append("type", "text");
      formData.append("content", notesInput.value);
    }

    try {

      const responseData = await uploadMaterialRequest(formData);
      const newMaterial = mapApiToFrontend(responseData.material);

      addMaterial(newMaterial);
      refreshMaterials();
      closeModal();

      if (uploadMessage) {
        uploadMessage.innerHTML = "<p><strong>Success!</strong> Material recieved successfully.</p>";
        uploadMessage.classList.remove("hidden");
        setTimeout(() => {
          uploadMessage.classList.add("hidden");
        }, 4000);
      }

    }

    catch (error) {
      validationMessage.textContent = error.message || "We could't process this material, please try again.";
      validationMessage.classList.remove("hidden");
    }
    finally {
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-text").textContent = "Process Material";
      submitBtn.querySelector(".btn-loader").classList.add("hidden");
    }


  });
}

// Flashcards Interactions
function setupFlashcards() {
  const flashcardsData = [
    { question: "What is Newton's 2nd law?", answer: "F = ma (Force = mass x acceleration)" },
    { question: "What is the power house of the cell?", answer: "Mitochondria" },
    { question: "What is the formula of photosynthesis?", answer: "6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂" },
    { question: "What is the speed of light in vacuum?", answer: "299,792,458 m/s (≈ 3 x 10⁸ m/s" },
    { question: "What does DNA stand for?", answer: "Deoxyribonucleic Acid" }
  ];

  let currentCardIndex = 0;

  const cardWrapper = document.getElementById("flashcard-wrapper");
  const cardInner = document.getElementById("flashcard-inner");
  const questionEl = document.getElementById("card-text");
  const answerEl = document.getElementById("card-answer");
  const counterEl = document.getElementById("card-counter");
  const prevBtn = document.getElementById("prev-card-btn");
  const nextBtn = document.getElementById("next-card-btn");
  const revealBtn = document.getElementById("btn-reveal");
  const dotsContainer = document.getElementById("progress-dots");

  if (!cardInner) return;

  function renderCard() {
    cardInner.classList.remove("flipped");
    const current = flashcardsData[currentCardIndex];

    if (questionEl) questionEl.textContent = current.question;
    if (answerEl) answerEl.textContent = current.answer;
    if (counterEl) counterEl.textContent = `card ${currentCardIndex + 1} of ${flashcardsData.length}`;

    if (prevBtn) prevBtn.disabled = currentCardIndex === 0;
    if (nextBtn) nextBtn.disabled = currentCardIndex === flashcardsData.length - 1;

    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      flashcardsData.forEach((_, idx) => {
        const dot = document.createElement("div");
        dot.className = `dot ${idx === currentCardIndex ? "active" : ""}`;
        dotsContainer.appendChild(dot);
      });
    }
  }

  // Flip action
  if (revealBtn) {
    revealBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cardInner.classList.toggle("flipped");
    });
  }

  if (cardWrapper) {
    cardWrapper.addEventListener("click", () => {
      cardInner.classList.toggle("flipped");
    });
  }

  // Cards navigation actions
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentCardIndex < flashcardsData.length - 1) {
        currentCardIndex++;
        renderCard();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentCardIndex > 0) {
        currentCardIndex--;
        renderCard();
      }
    });
  }

  renderCard();
}

// Initialize Dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  initMaterials();
  setupInteractions();
  setupUploadModal();
  setupFlashcards();
});
