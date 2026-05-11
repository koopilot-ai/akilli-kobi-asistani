from app.services.stock_service import get_all_products

def get_smart_recommendations() -> dict:
    """
    Stok verilerini analiz ederek kritik stok ve fırsat ürünleri önerileri sunar.
    """
    products = get_all_products()
    
    critical_alerts = []
    opportunities = []
    
    for product in products:
        stock = product.get("stock", 0)
        critical = product.get("critical_level", 0)
        sales_30 = product.get("last_30_days_sales", 0)
        
        # Kritik Stok Analizi
        if stock <= critical:
            urgency = "Yüksek" if stock <= (critical / 2) else "Orta"
            critical_alerts.append({
                "product_name": product.get("name"),
                "current_stock": stock,
                "unit": product.get("unit"),
                "urgency": urgency,
                "suggestion": f"{critical * 2} birim tedarik planlanmalı."
            })
            
        # Fırsat Ürün Analizi (Yüksek satış hızı, yeterli stok veya stok bitmek üzere)
        if sales_30 > 50: # Örnek eşik
            if stock > critical:
                opportunities.append({
                    "product_name": product.get("name"),
                    "type": "Kampanya Potansiyeli",
                    "reason": "Satış hızı yüksek, stok durumu iyi.",
                    "action": "Öne çıkarılan ürünlere eklenebilir."
                })
            else:
                opportunities.append({
                    "product_name": product.get("name"),
                    "type": "Stok Yenileme Fırsatı",
                    "reason": "Yüksek talep var ama stok kritik.",
                    "action": "Acil stok yenileme ile satış kaybı önlenebilir."
                })
                
    return {
        "critical_alerts": critical_alerts,
        "opportunities": opportunities,
        "summary": f"Toplam {len(critical_alerts)} kritik stok uyarısı ve {len(opportunities)} satış fırsatı belirlendi."
    }
