from app.database.db import load_data


def get_all_orders() -> list[dict]:
    data = load_data()
    return data.get("orders", [])


def get_order_by_id(order_id: str) -> dict | None:
    orders = get_all_orders()

    for order in orders:
        if order.get("id") == order_id:
            return order

    return None


def get_delayed_orders() -> list[dict]:
    orders = get_all_orders()

    return [
        order for order in orders
        if order.get("status", "").lower() == "gecikti"
        or "gecik" in order.get("cargo_status", "").lower()
    ]