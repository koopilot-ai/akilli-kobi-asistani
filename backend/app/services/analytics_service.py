from app.services.order_service import get_all_orders, get_delayed_orders
from app.services.stock_service import get_all_products, get_low_stock_products
from app.services.simulation_service import generate_simulated_trends


def get_dashboard_summary() -> dict:
    orders = get_all_orders()
    products = get_all_products()

    delayed_orders = get_delayed_orders()
    low_stock_products = get_low_stock_products()

    total_orders = len(orders)
    total_products = len(products)

    total_low_stock = len(low_stock_products)
    total_delayed = len(delayed_orders)

    estimated_revenue = 0

    for order in orders:
        estimated_revenue += order.get("quantity", 0) * 250

    # Demo için simüle edilmiş trend verilerini ekle
    simulated_trends = generate_simulated_trends(7)

    return {
        "total_orders": total_orders,
        "total_products": total_products,
        "low_stock_count": total_low_stock,
        "delayed_orders_count": total_delayed,
        "estimated_revenue": estimated_revenue,
        "daily_summary": (
            f"Bugün toplam {total_orders} sipariş işlendi. "
            f"{total_delayed} geciken kargo ve "
            f"{total_low_stock} kritik stok uyarısı bulunuyor."
        ),
        "weekly_trend_simulation": simulated_trends # Demo grafikleri için yeni alan
    }