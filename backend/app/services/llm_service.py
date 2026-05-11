import re

from app.core.config import GEMINI_API_KEY
from app.services.order_service import get_order_by_id
from app.services.stock_service import get_all_products

try:
    import google.generativeai as genai
except ImportError:
    genai = None


def extract_order_id(message: str) -> str | None:
    match = re.search(r"\b\d{2,6}\b", message)
    if match:
        return match.group(0)
    return None


def find_product_in_message(message: str) -> dict | None:
    products = get_all_products()
    message_lower = message.lower()

    for product in products:
        product_name = product.get("name", "").lower()
        if product_name in message_lower:
            return product

        for word in product_name.split():
            if len(word) > 3 and word in message_lower:
                return product

    return None


def generate_gemini_response(prompt: str) -> str:
    if not GEMINI_API_KEY or genai is None:
        return ""

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return ""


def generate_customer_reply(message: str) -> dict:
    order_id = extract_order_id(message)

    if order_id:
        order = get_order_by_id(order_id)

        if order:
            prompt = f"""
            Sen küçük işletmeler için çalışan profesyonel bir müşteri destek asistanısın.

            Müşteri mesajı:
            {message}

            Sipariş bilgisi:
            Sipariş No: {order["id"]}
            Müşteri: {order["customer_name"]}
            Ürün: {order["product"]}
            Sipariş Durumu: {order["status"]}
            Kargo Durumu: {order["cargo_status"]}
            Tahmini Teslimat: {order["estimated_delivery"]}
            Ödeme Durumu: {order["payment_status"]}

            Görev:
            Müşteriye kısa, nazik, güven veren ve net bir Türkçe cevap yaz.
            Sadece müşteriye gönderilecek cevabı üret.
            """

            ai_reply = generate_gemini_response(prompt)

            if not ai_reply:
                ai_reply = (
                    f"Merhaba {order['customer_name']}, "
                    f"{order['id']} numaralı siparişinizin durumu: {order['status']}. "
                    f"Kargo bilgisi: {order['cargo_status']}. "
                    f"Tahmini teslimat: {order['estimated_delivery']}."
                )

            return {
                "reply": ai_reply,
                "intent": "order_status",
                "related_order_id": order_id
            }

        return {
            "reply": (
                f"{order_id} numaralı sipariş sistemde bulunamadı. "
                f"Lütfen sipariş numaranızı kontrol eder misiniz?"
            ),
            "intent": "order_not_found",
            "related_order_id": order_id
        }

    product = find_product_in_message(message)

    if product:
        prompt = f"""
        Sen küçük işletmeler için çalışan profesyonel bir müşteri destek asistanısın.

        Müşteri mesajı:
        {message}

        Ürün bilgisi:
        Ürün adı: {product["name"]}
        Mevcut stok: {product["stock"]} {product["unit"]}
        Kritik stok seviyesi: {product["critical_level"]} {product["unit"]}

        Görev:
        Müşteriye ürünün stok durumunu kısa, nazik ve net şekilde açıkla.
        Sadece müşteriye gönderilecek cevabı üret.
        """

        ai_reply = generate_gemini_response(prompt)

        if not ai_reply:
            if product["stock"] > 0:
                ai_reply = (
                    f"Merhaba, {product['name']} şu anda stokta mevcut. "
                    f"Mevcut stok: {product['stock']} {product['unit']}."
                )
            else:
                ai_reply = (
                    f"Merhaba, {product['name']} şu anda stokta bulunmuyor. "
                    f"Stok yenilendiğinde size bilgi verebiliriz."
                )

        return {
            "reply": ai_reply,
            "intent": "stock_question",
            "related_order_id": None
        }

    prompt = f"""
    Sen küçük işletmeler için çalışan profesyonel bir müşteri destek asistanısın.

    Müşteri mesajı:
    {message}

    Sistemde ilgili sipariş veya ürün bilgisi otomatik bulunamadı.

    Görev:
    Müşteriden daha net bilgi istemek için kısa ve nazik bir Türkçe cevap yaz.
    Örneğin sipariş numarası veya ürün adını isteyebilirsin.
    Sadece müşteriye gönderilecek cevabı üret.
    """

    ai_reply = generate_gemini_response(prompt)

    if not ai_reply:
        ai_reply = (
            "Merhaba, size yardımcı olabilmem için sipariş numaranızı "
            "veya sormak istediğiniz ürün adını paylaşabilir misiniz?"
        )

    return {
        "reply": ai_reply,
        "intent": "clarification_needed",
        "related_order_id": None
    }