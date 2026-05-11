from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_asist_trends():
    """Trend simülasyonu endpoint'ini test eder."""
    response = client.get("/asist/trends")
    assert response.status_code == 200
    data = response.json()
    assert "simulated_data" in data
    assert len(data["simulated_data"]) == 7

def test_asist_recommendations():
    """Akıllı öneriler endpoint'ini test eder."""
    response = client.get("/asist/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert "critical_alerts" in data
    assert "opportunities" in data

def test_sentiment_analysis():
    """AI duygu analizi endpoint'ini test eder."""
    test_message = {"message": "Siparişim hala gelmedi, çok mağdurum."}
    response = client.post("/asist/analyze-sentiment", json=test_message)
    assert response.status_code == 200
    data = response.json()
    # Fallback veya Gemini yanıtında en azından sentiment veya raw verisi olmalı
    assert "sentiment" in data or "raw_ai_analysis" in data

if __name__ == "__main__":
    print("Testler başlatılıyor...")
    try:
        test_asist_trends()
        print("✓ Trend testi başarılı.")
        test_asist_recommendations()
        print("✓ Öneriler testi başarılı.")
        test_sentiment_analysis()
        print("✓ Duygu analizi testi başarılı.")
    except Exception as e:
        print(f"X Test sırasında hata oluştu: {e}")
