from fastapi import APIRouter

from app.services.analytics_service import get_dashboard_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/daily-summary")
def daily_summary():
    return get_dashboard_summary()