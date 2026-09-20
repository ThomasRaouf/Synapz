from fastapi import APIRouter
from models.summary import SummaryRequest, SummaryResponse
from services.summary_service import create_summary
router = APIRouter (
    prefix ="/api/summaries",
    tags = ["summaries"]
)
@router.post("",response_model=SummaryResponse)
def generate_summary_endpoint(request: SummaryRequest):
    """
    Generates a structures summary from the provided text material.
    """
    summary_data = create_summary(request.text)
    return summary_data