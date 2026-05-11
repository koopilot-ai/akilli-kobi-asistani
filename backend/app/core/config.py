import os
from dotenv import load_dotenv

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "StockPilot AI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")