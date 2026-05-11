from fastapi import APIRouter, Body
from app.services.ai_analysis_service import analyze_customer_sentiment, get_demand_priority_report
from app.services.recommendation_service import get_smart_recommendations
from app.services.simulation_service import get_forecast_summary, seed_mock_data
from app.services.order_service import get_all_orders

router = APIRouter(prefix="/asist", tags=["Advanced AI Logic"])

@router.post("/seed-data")
def seed_data(count: int = 20):
    return seed_mock_data(count)

@router.post("/analyze-sentiment")
def sentiment_analysis(message: str = Body(..., embed=True)):
    return analyze_customer_sentiment(message)

@router.get("/recommendations")
def smart_recommendations():
    return get_smart_recommendations()

@router.get("/trends")
def simulated_trends():
    return get_forecast_summary()

@router.get("/priority-report")
def priority_report():
    orders = get_all_orders()
    return get_demand_priority_report(orders)
