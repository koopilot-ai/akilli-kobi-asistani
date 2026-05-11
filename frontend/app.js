const API_BASE_URL = "http://127.0.0.1:8000";

const totalOrdersEl = document.getElementById("totalOrders");
const lowStockCountEl = document.getElementById("lowStockCount");
const delayedOrdersEl = document.getElementById("delayedOrders");
const estimatedRevenueEl = document.getElementById("estimatedRevenue");
const ordersListEl = document.getElementById("ordersList");
const stockListEl = document.getElementById("stockList");
const alertsListEl = document.getElementById("alertsList");
const dailySummaryEl = document.getElementById("dailySummary");

// ---- Tam sayfa liste referansları ----
const ordersListFullEl  = document.getElementById("ordersListFull");
const stockListFullEl   = document.getElementById("stockListFull");
const alertsListFullEl  = document.getElementById("alertsListFull");

const chatInputEl = document.getElementById("chatInput");
const sendButtonEl = document.getElementById("sendButton");
const chatMessagesEl = document.getElementById("chatMessages");

// ---- Chat referansları (AI Asistan sayfası) ----
const chatInputFullEl   = document.getElementById("chatInputFull");
const sendButtonFullEl  = document.getElementById("sendButtonFull");
const chatMessagesFullEl = document.getElementById("chatMessagesFull");
 
// ============================================================
//  SEKMELİ NAVİGASYON
//  Her nav-link'e tıklanınca ilgili page görünür, diğerleri gizlenir
// ============================================================
 
const navLinks = document.querySelectorAll(".nav-link");
const pages    = document.querySelectorAll(".page");
 
// Sayfa başlıkları — data-page değerine göre
const pageTitles = {
  "dashboard":    { title: "Operasyon Paneli",  sub: "KOBİ ve kooperatifler için AI destekli günlük iş takibi" },
  "siparisler":   { title: "📦 Siparişler",      sub: "Tüm müşteri siparişleri" },
  "stok":         { title: "📊 Stok Yönetimi",   sub: "Ürün stok seviyeleri ve kritik eşikler" },
  "uyarilar":     { title: "🔔 Uyarılar",        sub: "AI tarafından oluşturulan akıllı uyarılar" },
  "ai-asistan":   { title: "✨ AI Asistan",       sub: "Gemini destekli müşteri ve operasyon asistanı" },
};
 
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const targetPage = link.dataset.page; // Tıklanan linkin data-page değeri
 
    // 1. Tüm nav linklerden "active" kaldır, tıklanana ekle
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
 
    // 2. Tüm sayfaları gizle, hedef sayfayı göster
    pages.forEach(p => p.classList.remove("active"));
    const targetEl = document.getElementById("page-" + targetPage);
    if (targetEl) targetEl.classList.add("active");
 
    // 3. Topbar başlığını güncelle
    const info = pageTitles[targetPage];
    if (info) {
      document.getElementById("pageTitle").textContent    = info.title;
      document.getElementById("pageSubtitle").textContent = info.sub;
    }
  });
});
 
// ============================================================
//  YARDIMCI FONKSİYONLAR
// ============================================================


async function fetchJson(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${endpoint}`);
  }

  return response.json();
}

function formatCurrency(value) {
  return `${value.toLocaleString("tr-TR")} ₺`;
}

function getOrderBadgeClass(status) {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes("gecikti")) return "red";
  if (lowerStatus.includes("kargoda")) return "green";
  return "orange";
}

// ============================================================
//  SAYAÇ ANİMASYONU
//  Sayılar 0'dan hedef değere kadar artar
// ============================================================
 
function animateCounter(element, targetValue) {
  // Sadece sayısal değerler için
  if (isNaN(targetValue)) {
    element.textContent = targetValue;
    return;
  }
 
  let start = 0;
  const duration = 800; // ms
  const stepTime = 20;  // her adım arası ms
  const steps = duration / stepTime;
  const increment = targetValue / steps;
 
  element.classList.add("animated");
 
  const timer = setInterval(() => {
    start += increment;
    if (start >= targetValue) {
      clearInterval(timer);
      element.textContent = targetValue;
    } else {
      element.textContent = Math.floor(start);
    }
  }, stepTime);
 
  // Animasyon class'ını temizle
  setTimeout(() => element.classList.remove("animated"), duration + 100);
}
 
// ============================================================
//  RENDER FONKSİYONLARI
// ============================================================

// Sipariş kartı HTML'i oluşturur
function createOrderItem(order) {
  const badgeClass = getOrderBadgeClass(order.status);
  const item = document.createElement("div");
  item.className = "list-item";
  item.innerHTML = `
    <strong>#${order.id} - ${order.customer_name}</strong>
    <p>${order.product} • ${order.quantity} adet</p>
    <p>Kargo: ${order.cargo_status}</p>
    <span class="badge ${badgeClass}">${order.status}</span>
  `;
  return item;
}
 
// Stok kartı HTML'i oluşturur
function createStockItem(product) {
  const isLow = product.stock <= product.critical_level;
  const item = document.createElement("div");
  item.className = "list-item";
  item.innerHTML = `
    <strong>${product.name}</strong>
    <p>Mevcut stok: ${product.stock} ${product.unit}</p>
    <p>Kritik eşik: ${product.critical_level} ${product.unit}</p>
    <span class="badge ${isLow ? "red" : "green"}">
      ${isLow ? "⚠ Kritik Stok" : "✔ Yeterli Stok"}
    </span>
  `;
  return item;
}
 
// Uyarı kartı HTML'i oluşturur
function createAlertItem(alert) {
  const isHigh = alert.priority === "high";
  const item = document.createElement("div");
  item.className = "list-item";
  item.innerHTML = `
    <strong>${alert.title}</strong>
    <p>${alert.message}</p>
    <span class="badge ${isHigh ? "red" : "orange"}">
      ${isHigh ? "🔴 Yüksek Öncelik" : "🟠 Orta Öncelik"}
    </span>
  `;
  return item;
}
 
// Dashboard siparişler listesi
function renderOrders(orders) {
  ordersListEl.innerHTML = "";

  orders.forEach((order) => {
    const item = document.createElement("div");
    item.className = "list-item";

    item.innerHTML = `
      <strong>#${order.id} - ${order.customer_name}</strong>
      <p>${order.product} • ${order.quantity} adet</p>
      <p>Kargo: ${order.cargo_status}</p>
      <span class="badge ${getOrderBadgeClass(order.status)}">${order.status}</span>
    `;

    ordersListEl.appendChild(item);
  });
}

function renderStock(products) {
  stockListEl.innerHTML = "";

  products.forEach((product) => {
    const isLow = product.stock <= product.critical_level;

    const item = document.createElement("div");
    item.className = "list-item";

    item.innerHTML = `
      <strong>${product.name}</strong>
      <p>Mevcut stok: ${product.stock} ${product.unit}</p>
      <p>Kritik eşik: ${product.critical_level} ${product.unit}</p>
      <span class="badge ${isLow ? "red" : "green"}">
        ${isLow ? "Kritik Stok" : "Yeterli Stok"}
      </span>
    `;

    stockListEl.appendChild(item);
  });
}

function renderAlerts(alerts) {
  alertsListEl.innerHTML = "";

  if (alerts.length === 0) {
    alertsListEl.innerHTML = `<p>Şu anda aktif uyarı yok.</p>`;
    return;
  }

  alerts.forEach((alert) => {
    const item = document.createElement("div");
    item.className = "list-item";

    item.innerHTML = `
      <strong>${alert.title}</strong>
      <p>${alert.message}</p>
      <span class="badge ${alert.priority === "high" ? "red" : "orange"}">
        ${alert.priority === "high" ? "Yüksek Öncelik" : "Orta Öncelik"}
      </span>
    `;

    alertsListEl.appendChild(item);
  });
}

function renderOrdersFull(orders) {
  ordersListFullEl.innerHTML = "";
  if (orders.length === 0) {
    ordersListFullEl.innerHTML = `<p class="loading-text">Sipariş bulunamadı.</p>`;
    return;
  }
  orders.forEach(order => ordersListFullEl.appendChild(createOrderItem(order)));
}

function renderStockFull(products) {
  stockListFullEl.innerHTML = "";
  if (products.length === 0) {
    stockListFullEl.innerHTML = `<p class="loading-text">Ürün bulunamadı.</p>`;
    return;
  }
  products.forEach(product => stockListFullEl.appendChild(createStockItem(product)));
}

function renderAlertsFull(alerts) {
  alertsListFullEl.innerHTML = "";
  if (alerts.length === 0) {
    alertsListFullEl.innerHTML = `<p class="loading-text">Şu anda aktif uyarı yok.</p>`;
    return;
  }
  alerts.forEach(alert => alertsListFullEl.appendChild(createAlertItem(alert)));
}

async function loadDashboard() {
  try {
    const [summary, orders, products, alerts] = await Promise.all([
      fetchJson("/analytics/daily-summary"),
      fetchJson("/orders/"),
      fetchJson("/stock/"),
      fetchJson("/alerts/"),
    ]);

    //totalOrdersEl.textContent = summary.total_orders;
    //lowStockCountEl.textContent = summary.low_stock_count;
    //delayedOrdersEl.textContent = summary.delayed_orders_count;
     // Özet kartlara animasyonlu sayaç
    animateCounter(totalOrdersEl,   summary.total_orders);
    animateCounter(lowStockCountEl, summary.low_stock_count);
    animateCounter(delayedOrdersEl, summary.delayed_orders_count);
    estimatedRevenueEl.textContent = formatCurrency(summary.estimated_revenue);
    dailySummaryEl.textContent = summary.daily_summary;

    renderOrders(orders);
    renderStock(products);
    renderAlerts(alerts);
    renderOrdersFull(orders);
    renderStockFull(products);
    renderAlertsFull(alerts);

  } catch (error) {
    dailySummaryEl.textContent =
      "Backend bağlantısı kurulamadı. Lütfen FastAPI sunucusunun çalıştığından emin olun.";
    console.error(error);
  }
}

// ============================================================
//  OTOMATİK YENİLEME — Her 30 saniyede bir dashboard güncellenir
// ============================================================
setInterval(loadDashboard, 30000);
 
// ============================================================
//  CHAT FONKSİYONLARI
// ============================================================

function addChatMessage(message, type) {
  const messageEl = document.createElement("div");
  messageEl.className = type === "user" ? "user-message" : "bot-message";
  messageEl.textContent = message;

  chatMessagesEl.appendChild(messageEl);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

async function sendMessage() {
  const message = chatInputEl.value.trim();

  if (!message) return;

  addChatMessage(message, "user");
  chatInputEl.value = "";
  sendButtonEl.disabled = true;
  sendButtonEl.textContent = "Yanıtlanıyor...";

  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Chat API error");
    }

    const data = await response.json();
    addChatMessage(data.reply, "bot");
  } catch (error) {
    addChatMessage(
      "Şu anda AI asistanına ulaşılamıyor. Backend bağlantısını kontrol edin.",
      "bot"
    );
    console.error(error);
  } finally {
    sendButtonEl.disabled = false;
    sendButtonEl.textContent = "Gönder";
  }
}

sendButtonEl.addEventListener("click", sendMessage);

chatInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// AI Asistan sayfası chat
sendButtonFullEl.addEventListener("click", sendMessageFull);
chatInputFullEl.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessageFull();
});

async function sendMessageFull() {
  const message = chatInputFullEl.value.trim();
  if (!message) return;

  const msgEl = document.createElement("div");
  msgEl.className = "user-message";
  msgEl.textContent = message;
  chatMessagesFullEl.appendChild(msgEl);
  chatMessagesFullEl.scrollTop = chatMessagesFullEl.scrollHeight;

  chatInputFullEl.value = "";
  sendButtonFullEl.disabled = true;
  sendButtonFullEl.textContent = "Yanıtlanıyor...";

  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    const replyEl = document.createElement("div");
    replyEl.className = "bot-message";
    replyEl.textContent = data.reply;
    chatMessagesFullEl.appendChild(replyEl);
    chatMessagesFullEl.scrollTop = chatMessagesFullEl.scrollHeight;
  } catch (error) {
    const errEl = document.createElement("div");
    errEl.className = "bot-message";
    errEl.textContent = "⚠ AI asistanına ulaşılamıyor.";
    chatMessagesFullEl.appendChild(errEl);
  } finally {
    sendButtonFullEl.disabled = false;
    sendButtonFullEl.textContent = "Gönder";
  }
}
 
// ============================================================
//  İLK YÜKLEME
// ============================================================

loadDashboard();