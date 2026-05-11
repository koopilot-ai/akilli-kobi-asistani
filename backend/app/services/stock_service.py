from app.database.db import load_data


def get_all_products() -> list[dict]:
    data = load_data()
    return data.get("products", [])


def get_product_by_name(product_name: str) -> dict | None:
    products = get_all_products()
    product_name_lower = product_name.lower()

    for product in products:
        if product_name_lower in product.get("name", "").lower():
            return product

    return None


def get_low_stock_products() -> list[dict]:
    products = get_all_products()

    return [
        product for product in products
        if product.get("stock", 0) <= product.get("critical_level", 0)
    ]


def calculate_reorder_suggestion(product: dict) -> int:
    monthly_sales = product.get("last_30_days_sales", 0)
    current_stock = product.get("stock", 0)

    suggested_stock = max(monthly_sales // 2, product.get("critical_level", 0))

    reorder_amount = suggested_stock - current_stock

    return max(reorder_amount, 0)