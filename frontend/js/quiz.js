const quizQuestions = [
    {
        question: "Which organelle is responsible for ATP production?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgie apparatus"],
        correctAnswer: "Mitochondria",
        explanation: "Mitochondria are responsible for most cellular ATP production through cellular respiration."
    },
    {
        question: "What is the primary function of enzymes in biochemical reactions?",
        options: ["Provide energy", "Lower activation energy", "Act as reactants", "Increase temperature"],
        correctAnswer: "Lower activation energy",
        explanation: "Enzymes act as biological catalysts by lowering the activation energy needed for a reaction to occur."
    },
    {
        question: "Which molecule is considered the universal energy currency of cells?",
        options: ["Glucose", "ATP", "DNA", "NADH"],
        correctAnswer: "ATP",
        explanation: "ATP (Adenosine Triphosphate) stores and provides energy for many cellular processes."
    },
    {
        question: "What type of bond links amino acids together in a protein?",
        options: ["Hydrogen Bond", "Peptide Bond", "Ionic Bond", "Glycosidic Bond"],
        correctAnswer: "Peptide Bond",
        explanation: "Amino acids are linked together by peptide bonds to form polypeptide chains."
    },
    {
        question: "Which of the following is NOT a component of a nucleotide?",
        options: ["Nitrogenous Base", "Phosphate group", "Five-carbon sugar", "Fatty acid"],
        correctAnswer: "Fatty acid",
        explanation: "A nucleotide consists of a sugar, a phosphate group, and a nitrogenous base. Fatty acids are found in lipids."
    },
];

let currentQuestionIndex =0;
let score = 0;
let selectedOptionIndex = null;
let isAnswerSubmitted = false;

function initQuiz() {
    const quizSelection = document.getElementById("quiz-selection");
    const activeQuiz = document.getElementById("active-quiz");
    const quizResults = document.getElementById("quiz-results");
    const startBtn = document.getElementById("start-quiz-btn");
    const submitBtn = document.getElementById("quiz-submit-btn");
    const nextBtn = document.getElementById("quiz-next-btn");
    const tryAgainBtn = document.getElementById("quiz-try-again-btn");

    if (startBtn) {
        startBtn.addEventListener("click", () =>{
            quizSelection.style.display = "none";
            activeQuiz.style.display = "block";
            startNewQuiz();
        });
    }
    if (submitBtn) {
        submitBtn.addEventListener("click", submitAnswer);
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", nextQuestion);
    }
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener("click", () =>{
            quizResults.style.display = "none";
            quizSelection.style.display = "block";
        });
    }
}

function startNewQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
}

function renderQuestion() {
    isAnswerSubmitted = false;
    selectedOptionIndex = null;
    const question = quizQuestions[currentQuestionIndex];
    document.getElementById("quiz-progress-text").textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    const progressPercent = ((currentQuestionIndex)/quizQuestions.length)*100;
    document.getElementById("quiz-progress-bar-fill").style.width = `${progressPercent}%`;
    document.getElementById("question-text").textContent = question.question;
    const optionsContainer = document.getElementById("options-list");
    optionsContainer.innerHTML = "";
    question.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerHTML = `
            <div class="option-indicator"></div>
            <span>${option}</span>
        
        `;
        btn.addEventListener("click", () => selectOption(index, btn));
        optionsContainer.appendChild(btn);


    });

    document.getElementById("quiz-submit-btn").style.display = "inline-block";
    document.getElementById("quiz-submit-btn").disabled = true;
    document.getElementById("quiz-next-btn").style.display = "none";
    document.getElementById("quiz-feedback").style.display = "none";

}

function selectOption(index, btnElement) {
    if (isAnswerSubmitted) return;
    selectedOptionIndex = index;
    const options = document.querySelectorAll(".option-btn");
    options.forEach(opt => opt.classList.remove("selected"));
    btnElement.classList.add("selected");
    document.getElementById("quiz-submit-btn").disabled = false;

}

function submitAnswer() {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;
    isAnswerSubmitted = true;
    const question = quizQuestions[currentQuestionIndex];
    const selectedOptionText = question.options[selectedOptionIndex];
    const isCorrect = selectedOptionText === question.correctAnswer;
    if (isCorrect) {
        score++;
    }
    const options = document.querySelectorAll(".option-btn");
    options.forEach((opt, index) => {
        opt.disabled = true;
        const optText = question.options[index];
        if (optText === question.correctAnswer) {
            opt.classList.add("correct");
        } else if (index === selectedOptionIndex && !isCorrect) {
            opt.classList.add("incorrect");
        }
    });

    const feedbackEl = document.getElementById("quiz-feedback");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackText = document.getElementById("feedback-text");

    feedbackEl.style.display = "block";
    feedbackEl.className = "feedback-section " + (isCorrect ? "correct-feedback" : "incorrect-feedback");

    if (isCorrect) {
        feedbackTitle.innerHTML = `Correct 👌`;
        feedbackText.innerHTML = `<p>${question.explanation}</p>`;
    } else {
        feedbackTitle.innerHTML = `Incorrect 😢`;
        feedbackText.innerHTML = `
            <div class="feedback-correct-answer">Correct answer: ${question.correctAnswer}</div>
            <p>${question.explanation}</p>
        `;
    }

    document.getElementById("quiz-submit-btn").style.display = "none";
    document.getElementById("quiz-next-btn").style.display = "inline-block";

}

function nextQuestion () {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById("active-quiz").style.display = "none";
    const resultsScreen = document.getElementById("quiz-results");
    resultsScreen.style.display = "block";
    const percentage = Math.round((score/quizQuestions.length)*100);
    document.getElementById("score-number").textContent = `${score}/${quizQuestions.length}`;
    document.getElementById("score-percentage").textContent = `${percentage}%`;
    document.getElementById("stat-correct-val").textContent = score;
    document.getElementById("stat-incorrect-val").textContent = quizQuestions.length - score;

}

document.addEventListener("DOMContentLoaded", () => {
    initQuiz();
});