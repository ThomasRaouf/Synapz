from fastapi import APIRouter, Depends
from models.summary import SummaryRequest, SummaryResponse
from services.summary_service import create_summary
from dependencies.auth import get_current_user
router = APIRouter (
    prefix ="/api/summaries",
    tags = ["summaries"]
)
@router.post("",response_model=SummaryResponse)
def generate_summary_endpoint(request: SummaryRequest, current_user = Depends(get_current_user)):
    """
    Generates a structures summary from the provided text material.
    """
    summary_data = create_summary(request.text)
    return summary_data