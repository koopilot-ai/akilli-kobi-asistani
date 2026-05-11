from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import generate_customer_reply

router = APIRouter(prefix="/chat", tags=["AI Assistant"])


@router.post("/", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    result = generate_customer_reply(request.message)
    return result