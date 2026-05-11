from app.services.order_service import get_delayed_orders
from app.services.stock_service import get_low_stock_products, calculate_reorder_suggestion


def get_alerts() -> list[dict]:
    alerts = []

    for product in get_low_stock_products():
        reorder_amount = calculate_reorder_suggestion(product)

        alerts.append({
            "type": "low_stock",
            "title": "Kritik stok uyarısı",
            "message": (
                f"{product['name']} stoğu kritik seviyede. "
                f"Mevcut stok: {product['stock']} {product['unit']}. "
                f"Önerilen yeniden sipariş miktarı: {reorder_amount} {product['unit']}."
            ),
            "priority": "high"
        })

    for order in get_delayed_orders():
        alerts.append({
            "type": "delayed_cargo",
            "title": "Kargo gecikme uyarısı",
            "message": (
                f"{order['id']} numaralı siparişte gecikme var. "
                f"Kargo durumu: {order['cargo_status']}."
            ),
            "priority": "medium"
        })

    return alerts