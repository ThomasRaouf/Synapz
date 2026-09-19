# Synapz

## 1. What is Synapz?

Synapz is an all-in-one smart study ecosystem for medical and engineering
students. The eventual goal is to let students upload study materials
(PDFs, Word documents, images, notes, plain text) and use AI to turn them
into summaries, mind maps, quizzes, flashcards, and shareable study content.

## 2. Current stage

**This repository currently contains only the foundation and development
environment.** There are no real Synapz features yet - no login, no file
uploads, no AI, no database. This is intentional. The goal of this stage
was to set up a clean, working skeleton that the team can safely build on,
one feature at a time.

## 3. Technologies used

- **HTML** - structure of the web pages
- **CSS** - styling of the web pages
- **JavaScript (vanilla)** - browser-side logic, including talking to the backend
- **Python** - backend programming language
- **FastAPI** - the Python web framework that powers our backend API
- **Supabase** - will be used later for authentication, database, and file storage
- **Git** - version control (tracking changes to the code over time)
- **GitHub** - where our shared Git repository is hosted, and where we do
  code review through Pull Requests


If you instead see "Could not reach backend. Is it running?", double-check
that the `uvicorn` terminal is still running and didn't show an error.
