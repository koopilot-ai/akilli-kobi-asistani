# StockPilot AI

AI-Powered Smart Operations Assistant for SMEs and Cooperatives

---

## Problem Statement

Small and medium-sized businesses (SMEs) and cooperatives often struggle with operational management processes such as:

* Tracking customer orders
* Managing stock and inventory
* Monitoring delayed shipments
* Responding to repetitive customer questions
* Generating operational insights from daily business data

Most small businesses do not have access to intelligent automation systems because existing enterprise solutions are expensive, complex, and difficult to integrate.

As a result:

* Customer response times become slow
* Critical stock shortages are missed
* Shipment delays reduce customer satisfaction
* Business owners spend too much time on repetitive tasks

---

# Solution

StockPilot AI is an AI-powered operational dashboard designed for SMEs and cooperatives.

The platform combines:

* Order management
* Stock monitoring
* Shipment tracking
* Smart alerts
* AI-assisted customer support
* Operational analytics

into a single intelligent web platform.

The system helps business owners automate daily operational workflows and improve customer communication efficiency.

---

# Key Features

## AI-Powered Customer Response Assistant

Business owners can simulate customer messages and automatically generate intelligent response drafts.

Example:

Customer message:

> “128 numaralı siparişim nerede?”

The AI system:

* Detects the order number
* Retrieves shipment information
* Generates a contextual response

Example response:

> “Siparişiniz bugün kargoya verilmiştir. Tahmini teslimat süresi yarındır.”

---

## Smart Inventory Monitoring

The platform continuously checks stock levels and detects critical inventory situations.

Features:

* Critical stock detection
* Low stock alerts
* Inventory overview dashboard
* Smart operational recommendations

---

## Shipment Delay Alerts

The system automatically identifies delayed cargo deliveries and displays them on the dashboard.

This allows business owners to proactively contact customers before complaints occur.

---

## AI Operational Summary

StockPilot AI generates a daily operational summary for the business owner.

Example:

* Total orders today
* Delayed shipments
* Critical stock products
* Estimated revenue
* Operational recommendations

---

## Interactive Dashboard

Modern dashboard interface including:

* Summary cards
* Live alerts
* Order tracking
* Inventory management
* AI assistant panel
* Weekly sales visualization

---

# AI Usage

Artificial Intelligence is used as a core operational layer inside the platform.

AI capabilities include:

* Natural language understanding
* Customer message interpretation
* Intelligent response generation
* Operational summarization
* Business insight generation
* Recommendation support

The system uses Google Gemini API for intelligent response generation.

---

# System Architecture

```text
Frontend (HTML / CSS / JavaScript)
        ↓
FastAPI Backend
        ↓
Service Layer
 ├── Order Service
 ├── Stock Service
 ├── Alert Service
 ├── Analytics Service
 └── LLM Service
        ↓
Mock Database (JSON)
        ↓
Gemini API
```

---

# Project Structure

```text
akilli-kobi-asistani/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database/
│   │   ├── models/
│   │   └── core/
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── README.md
└── .gitignore
```

---

# API Endpoints

## Orders

* `GET /orders`
* `GET /orders/{id}`

## Stock

* `GET /stock`

## Alerts

* `GET /alerts`

## Analytics

* `GET /analytics/daily-summary`

## AI Chat

* `POST /chat`

---

# Technologies Used

## Backend

* Python
* FastAPI
* Uvicorn
* Google Gemini API

## Frontend

* HTML5
* CSS3
* JavaScript

## AI

* Google Gemini
* Natural Language Processing

---

# Installation

## Clone Repository

```bash
git clone https://github.com/koopilot-ai/akilli-kobi-asistani.git
```

---

## Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

### Windows

```bash
.\venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` file:

```env
GEMINI_API_KEY=your_api_key
APP_NAME=StockPilot AI
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Open a new terminal:

```bash
cd frontend
python -m http.server 5500
```

Frontend URL:

```text
http://127.0.0.1:5500
```

---

# Future Improvements

Potential future improvements include:

* Real database integration
* Role-based authentication system
* WhatsApp Business API integration
* Trendyol / Shopify integration
* Real-time notifications
* Advanced AI analytics
* Sales forecasting
* Customer sentiment analysis

---

# Hackathon Focus

This project was developed as an AI-powered operational automation platform for SMEs and cooperatives.

The main goal is to demonstrate how artificial intelligence can simplify operational workflows and improve customer communication efficiency.

---

# Team Members

* Arzu Yaprak
* Döne Sakız
* Nida Elvin Mertoğlu

---

# Demo

Demo video and screenshots will be added here.
