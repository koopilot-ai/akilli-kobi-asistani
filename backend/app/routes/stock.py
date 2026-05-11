from fastapi import APIRouter

from app.services.stock_service import get_all_products, get_low_stock_products

router = APIRouter(prefix="/stock", tags=["Stock"])


@router.get("/")
def list_products():
    return get_all_products()


@router.get("/low")
def list_low_stock_products():
    return get_low_stock_products()