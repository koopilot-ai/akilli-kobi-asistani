const API_BASE_URL = "http://127.0.0.1:8000";

const totalOrdersEl = document.getElementById("totalOrders");
const lowStockCountEl = document.getElementById("lowStockCount");
const delayedOrdersEl = document.getElementById("delayedOrders");
const estimatedRevenueEl = document.getElementById("estimatedRevenue");

const ordersListEl = document.getElementById("ordersList");
const stockListEl = document.getElementById("stockList");
const alertsListEl = document.getElementById("alertsList");
const dailySummaryEl = document.getElementById("dailySummary");

const chatInputEl = document.getElementById("chatInput");
const sendButtonEl = document.getElementById("sendButton");
const chatMessagesEl = document.getElementById("chatMessages");

async function fetchJson(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${endpoint}`);
  }

  return response.json();
}

function formatCurrency(value) {
  if (typeof value !== "number") {
    return "0 ₺";
  }

  return `${value.toLocaleString("tr-TR")} ₺`;
}

function getOrderBadgeClass(status) {
  const lowerStatus = String(status || "").toLowerCase();

  if (lowerStatus.includes("gecikti")) return "red";
  if (lowerStatus.includes("kargoda")) return "green";

  return "orange";
}

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

  if (!alerts || alerts.length === 0) {
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

async function loadDashboard() {
  try {
    const [summary, orders, products, alerts] = await Promise.all([
      fetchJson("/analytics/daily-summary"),
      fetchJson("/orders/"),
      fetchJson("/stock/"),
      fetchJson("/alerts/"),
    ]);

    totalOrdersEl.textContent = summary.total_orders;
    lowStockCountEl.textContent = summary.low_stock_count;
    delayedOrdersEl.textContent = summary.delayed_orders_count;
    estimatedRevenueEl.textContent = formatCurrency(summary.estimated_revenue);
    dailySummaryEl.textContent = summary.daily_summary;

    renderOrders(orders);
    renderStock(products);
    renderAlerts(alerts);
  } catch (error) {
    console.error(error);
    dailySummaryEl.textContent =
      "Backend bağlantısı kurulamadı. Lütfen FastAPI sunucusunun çalıştığından emin olun.";
  }
}

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
    console.error(error);
    addChatMessage(
      "Şu anda AI asistanına ulaşılamıyor. Backend bağlantısını kontrol edin.",
      "bot"
    );
  } finally {
    sendButtonEl.disabled = false;
    sendButtonEl.textContent = "Gönder";
  }
}

function setupNavigation() {
  const navLinks = document.querySelectorAll("nav a");
  const clickableCards = document.querySelectorAll(".clickable-card");

  function navigateToSection(targetId, activeElement = null) {
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    targetElement.classList.add("section-highlight");

    setTimeout(() => {
      targetElement.classList.remove("section-highlight");
    }, 1600);

    if (activeElement) {
      navLinks.forEach((item) => item.classList.remove("active"));
      activeElement.classList.add("active");
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navigateToSection(link.dataset.target, link);
    });
  });

  clickableCards.forEach((card) => {
    card.addEventListener("click", () => {
      navigateToSection(card.dataset.target);
    });
  });
}

sendButtonEl.addEventListener("click", sendMessage);

chatInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

setupNavigation();
loadDashboard();