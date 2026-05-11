from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    intent: str
    related_order_id: str | None = None


class StockUpdateRequest(BaseModel):
    product_id: str
    new_stock: int