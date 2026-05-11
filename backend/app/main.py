from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import APP_NAME
from app.routes import orders, stock, alerts, analytics, chat

app = FastAPI(
    title=APP_NAME,
    description="KOBİ ve kooperatifler için yapay zeka destekli operasyon asistanı.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "StockPilot AI backend çalışıyor.",
        "docs": "/docs"
    }


app.include_router(orders.router)
app.include_router(stock.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(chat.router)