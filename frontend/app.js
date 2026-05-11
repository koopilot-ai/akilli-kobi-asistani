const API_BASE_URL = "http://127.0.0.1:8000";

// Mevcut DOM Elemanları
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

// Yeni DOM Elemanları (Yeni eklediğimiz AI panelleri için)
const aiRecommendationsListEl = document.getElementById("aiRecommendationsList");
const trendSummaryEl = document.getElementById("trendSummary");
const trendChartEl = document.getElementById("trendChart");

async function fetchJson(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API error: ${endpoint}`);
    return await response.json();
  } catch (err) {
    console.error(`Fetch hatası (${endpoint}):`, err);
    return null; // Hata durumunda null dön ki Promise.all çökmesin
  }
}

function formatCurrency(value) {
  return typeof value === 'number' ? `${value.toLocaleString("tr-TR")} ₺` : "0 ₺";
}

function getOrderBadgeClass(status) {
  const lowerStatus = String(status || "").toLowerCase();
  if (lowerStatus.includes("gecikti")) return "red";
  if (lowerStatus.includes("kargoda")) return "green";
  return "orange";
}

// --- RENDER FONKSİYONLARI ---

function renderOrders(orders) {
  if (!ordersListEl || !orders) return;
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
  if (!stockListEl || !products) return;
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
  if (!alertsListEl || !alerts) return;
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

// --- YENİ AI RENDER FONKSİYONLARI ---

function renderAIRecommendations(data) {
  if (!aiRecommendationsListEl || !data) return;
  aiRecommendationsListEl.innerHTML = "";
  
  if (data.critical_alerts) {
    data.critical_alerts.forEach(alert => {
      const item = document.createElement("div");
      item.className = "list-item ai-alert";
      item.style.borderLeft = "4px solid #ef4444";
      item.innerHTML = `
        <strong>⚠️ ${alert.product_name}</strong>
        <p>Stok: ${alert.current_stock} | Öneri: ${alert.suggestion}</p>
        <span class="badge red">${alert.urgency} Öncelik</span>
      `;
      aiRecommendationsListEl.appendChild(item);
    });
  }

  if (data.opportunities) {
    data.opportunities.forEach(opp => {
      const item = document.createElement("div");
      item.className = "list-item ai-opportunity";
      item.style.borderLeft = "4px solid #10b981";
      item.innerHTML = `
        <strong>✨ ${opp.product_name}</strong>
        <p>${opp.reason}</p>
        <span class="badge green">${opp.type}</span>
      `;
      aiRecommendationsListEl.appendChild(item);
    });
  }
}

function renderTrendSimulation(data) {
  if (!trendSummaryEl || !trendChartEl || !data) return;
  
  trendSummaryEl.innerHTML = `
    <div style="margin-bottom: 10px;">
      <p>Gelecek 7 Gün Tahmini Satış: <strong>${data.next_7_days_total_sales} Adet</strong></p>
      <p>Trend Yönü: <span class="badge ${data.trend_direction === 'Artış' ? 'green' : 'orange'}">${data.trend_direction}</span></p>
    </div>
  `;

  if (data.simulated_data) {
    trendChartEl.style.display = "flex";
    trendChartEl.style.alignItems = "flex-end";
    trendChartEl.style.gap = "8px";
    trendChartEl.style.height = "100px";
    trendChartEl.style.padding = "10px";
    trendChartEl.style.background = "#f1f5f9";
    trendChartEl.style.borderRadius = "8px";

    trendChartEl.innerHTML = data.simulated_data.map(d => `
      <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
        <div style="background: #6366f1; width: 100%; height: ${Math.max(10, d.sales * 3)}px; border-radius: 4px 4px 0 0;" title="${d.date}: ${d.sales} satış"></div>
        <span style="font-size: 9px; margin-top: 4px;">${d.date.split('-')[2]}</span>
      </div>
    `).join('');
  }
}

// --- ANA YÜKLEME FONKSİYONU ---

async function loadDashboard() {
  try {
    // Tüm API çağrılarını paralel yap
    const [summary, orders, products, alerts, aiRecs, aiTrends] = await Promise.all([
      fetchJson("/analytics/daily-summary"),
      fetchJson("/orders/"),
      fetchJson("/stock/"),
      fetchJson("/alerts/"),
      fetchJson("/asist/recommendations"),
      fetchJson("/asist/trends")
    ]);

    if (summary) {
      totalOrdersEl.textContent = summary.total_orders || 0;
      lowStockCountEl.textContent = summary.low_stock_count || 0;
      delayedOrdersEl.textContent = summary.delayed_orders_count || 0;
      estimatedRevenueEl.textContent = formatCurrency(summary.estimated_revenue);
      dailySummaryEl.textContent = summary.daily_summary || "Veri alınamadı.";
    }

    renderOrders(orders);
    renderStock(products);
    renderAlerts(alerts);
    
    // Yeni AI verilerini render et
    if (aiRecs) renderAIRecommendations(aiRecs);
    if (aiTrends) renderTrendSimulation(aiTrends);

  } catch (error) {
    if (dailySummaryEl) dailySummaryEl.textContent = "Backend bağlantısı hatası!";
    console.error("Dashboard yüklenirken kritik hata:", error);
  }
}

// --- CHAT FONKSİYONU ---

async function sendMessage() {
  const message = chatInputEl.value.trim();
  if (!message) return;

  addChatMessage(message, "user");
  chatInputEl.value = "";
  sendButtonEl.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    addChatMessage(data.reply, "bot");
  } catch (error) {
    addChatMessage("AI asistanı şu an yanıt veremiyor.", "bot");
  } finally {
    sendButtonEl.disabled = false;
  }
}

function addChatMessage(message, type) {
  const messageEl = document.createElement("div");
  messageEl.className = type === "user" ? "user-message" : "bot-message";
  messageEl.textContent = message;
  chatMessagesEl.appendChild(messageEl);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

sendButtonEl.addEventListener("click", sendMessage);
chatInputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

// Başlat
loadDashboard();
