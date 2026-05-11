import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "mock_data.json"


def load_data() -> dict:
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_data(data: dict):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)