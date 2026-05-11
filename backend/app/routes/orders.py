from fastapi import APIRouter, HTTPException

from app.services.order_service import get_all_orders, get_order_by_id

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/")
def list_orders():
    return get_all_orders()


@router.get("/{order_id}")
def get_order(order_id: str):
    order = get_order_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order