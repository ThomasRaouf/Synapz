"""
Synapz backend - main entry point.

This is the foundation of the backend.

Authentication, database, and AI logic will be added later.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.materials import router as materials_router
from routes.summaries import router as summaries_router


app = FastAPI(
    title="Synapz Backend",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(materials_router)
app.include_router(summaries_router)


@app.get("/")
def read_root():
    """Simple root endpoint to confirm the backend is running."""
    return {"message": "Synapz backend is running"}


@app.get("/api/health")
def health_check():
    """Health check endpoint used by the frontend."""
    return {"status": "ok"}