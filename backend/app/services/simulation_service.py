import random
from datetime import datetime, timedelta
from app.database.db import load_data, save_data

def generate_simulated_trends(days: int = 30) -> list:
    """
    Demo için geçmişe yönelik simüle edilmiş satış trend verileri üretir.
    """
    trends = []
    base_sales = 10
    
    current_date = datetime.now()
    
    for i in range(days):
        date = (current_date - timedelta(days=days-i)).strftime("%Y-%m-%d")
        
        # Rastgele dalgalanma (hafif artış trendi ile)
        volatility = random.uniform(0.8, 1.2)
        growth_factor = 1 + (i / 100) # Zamanla hafif artış
        
        daily_sales = int(base_sales * volatility * growth_factor + random.randint(0, 5))
        
        trends.append({
            "date": date,
            "sales": daily_sales,
            "orders": max(1, daily_sales // 2),
            "revenue": daily_sales * 250
        })
        
    return trends

def seed_mock_data(count: int = 20):
    """
    Sisteme rastgele örnek siparişler ve ürünler ekleyerek veri hacmini artırır.
    """
    data = load_data()
    
    customers = ["Ali Veli", "Fatma Nur", "Hasan Can", "Merve Su", "Kemal Bey", "Selin Hanım", "Berat Koç"]
    products_pool = [
        {"name": "Doğal Bal", "unit": "kavanoz", "price": 450},
        {"name": "Köy Yumurtası", "unit": "koli", "price": 120},
        {"name": "Ev Yapımı Tarhana", "unit": "paket", "price": 180},
        {"name": "Sızma Zeytinyağı", "unit": "litre", "price": 600}
    ]
    
    # Yeni ürünleri ekle (eğer yoksa)
    existing_product_names = [p["name"] for p in data["products"]]
    for p_info in products_pool:
        if p_info["name"] not in existing_product_names:
            new_id = f"p{len(data['products']) + 1}"
            data["products"].append({
                "id": new_id,
                "name": p_info["name"],
                "stock": random.randint(5, 50),
                "critical_level": 15,
                "unit": p_info["unit"],
                "last_30_days_sales": random.randint(20, 100)
            })

    # Yeni siparişler ekle
    start_id = int(data["orders"][-1]["id"]) + 1 if data["orders"] else 100
    statuses = ["Kargoda", "Hazırlanıyor", "Teslim Edildi", "Gecikti"]
    cargo_statuses = ["Yolda", "Dağıtımda", "Şubede", "Gecikmeli"]

    for i in range(count):
        prod = random.choice(data["products"])
        data["orders"].append({
            "id": str(start_id + i),
            "customer_name": random.choice(customers),
            "customer_phone": f"0555 {random.randint(100,999)} {random.randint(10,99)} {random.randint(10,99)}",
            "product": prod["name"],
            "quantity": random.randint(1, 5),
            "status": random.choice(statuses),
            "cargo_status": random.choice(cargo_statuses),
            "estimated_delivery": (datetime.now() + timedelta(days=random.randint(1, 5))).strftime("%d %B %Y"),
            "payment_status": "Ödendi"
        })
    
    save_data(data)
    return {"message": f"{count} yeni sipariş ve yeni ürünler başarıyla eklendi."}

def get_forecast_summary() -> dict:
    """
    Simüle edilmiş veriler üzerinden gelecek 7 gün için tahmin sunar.
    """
    trends = generate_simulated_trends(7)
    total_forecast_sales = sum(t["sales"] for t in trends)
    
    return {
        "next_7_days_total_sales": total_forecast_sales,
        "next_7_days_revenue": total_forecast_sales * 250,
        "trend_direction": "Artış" if trends[-1]["sales"] > trends[0]["sales"] else "Stabil",
        "simulated_data": trends
    }
