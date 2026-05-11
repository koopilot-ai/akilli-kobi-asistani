from fastapi import APIRouter

from app.services.alert_service import get_alerts

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/")
def list_alerts():
    return get_alerts()