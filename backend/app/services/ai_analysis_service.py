from app.services.llm_service import generate_gemini_response

def analyze_customer_sentiment(message: str) -> dict:
    """
    Müşteri mesajından duygu analizi ve talep önceliği çıkarır.
    """
    prompt = f"""
    Aşağıdaki müşteri mesajını analiz et:
    "{message}"

    Lütfen şu bilgileri JSON formatında döndür (sadece JSON):
    1. sentiment: (pozitif, negatif, nötr)
    2. priority: (düşük, orta, yüksek, acil)
    3. urgency_score: (1-10 arası bir puan)
    4. main_intent: (mesajın ana amacı)
    """

    response = generate_gemini_response(prompt)
    
    # Not: Gerçek uygulamada JSON parsing yapılacak. 
    # Mock olarak basit bir mantık veya Gemini cevabı dönebilir.
    # Şimdilik Gemini cevabını döndürelim veya hata durumunda fallback yapalım.
    
    try:
        # Basit bir simülasyon (Gemini kapalıysa veya hata verirse)
        if not response:
            message_lower = message.lower()
            sentiment = "nötr"
            priority = "orta"
            
            if any(word in message_lower for word in ["nerede", "gecikti", "hata", "bozuk", "iade"]):
                sentiment = "negatif"
                priority = "yüksek"
            elif any(word in message_lower for word in ["teşekkür", "harika", "güzel"]):
                sentiment = "pozitif"
                priority = "düşük"
                
            return {
                "sentiment": sentiment,
                "priority": priority,
                "urgency_score": 8 if priority == "yüksek" else 4,
                "main_intent": "genel_bilgi"
            }
        
        # Basit string temizleme (eğer Gemini JSON dışında metin dönerse)
        import json
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        return {"raw_ai_analysis": response}
    except Exception:
        return {"status": "analiz_yapilamadi", "sentiment": "nötr"}

def get_demand_priority_report(orders: list) -> list:
    """
    Sipariş listesini analiz ederek talep önceliği raporu oluşturur.
    """
    report = []
    for order in orders:
        # Geciken veya kritik durumdaki siparişlere yüksek öncelik ver
        priority = "Normal"
        if order.get("status") == "Gecikti":
            priority = "Acil"
        elif order.get("status") == "Hazırlanıyor" and order.get("quantity", 0) > 5:
            priority = "Yüksek"
            
        report.append({
            "order_id": order.get("id"),
            "customer": order.get("customer_name"),
            "priority": priority,
            "reason": "Gecikme tespiti" if priority == "Acil" else "Yüksek hacimli sipariş" if priority == "Yüksek" else "Rutin"
        })
    return report
