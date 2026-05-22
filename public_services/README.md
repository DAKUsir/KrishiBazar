# 🌾 FarmShield AI Marketplace

A high-performance, real-time, bilingual selling channel built for small farmers in India to bypass middlemen and list crops directly to retailers, mandi traders, restaurant owners, and local households. This is a 24-hour hackathon deliverable for **P.E.S. College of Engineering Mandya (22–23 May 2026)**.

---

## 🚀 Key Features

1. **Live Product Feed (Real-Time)**: Crop listing dashboard utilizing `Socket.io` to update the feed in under 5 seconds whenever a farmer posts produce, with fallback intervals.
2. **"Today's Fresh" Indicator**: Automatically flags any crop listed within the last 6 hours to promote maximum shelf-life sales.
3. **Bilingual Navigation Toggle**: Instantly toggles the entire website interface among **English, Hindi, and Kannada** to assist local users and regional traders.
4. **GPS Distance Filtering**: Allows buyers to auto-share browser GPS coordinates to dynamically sort listings by physical distance (calculated via the **Haversine formula** on the server) and set kilometer thresholds.
5. **Interactive Mapping**: Employs **Leaflet + OpenStreetMap** in the crop details view for completely free, API-keyless location mapping.
6. **Express Buyer Inquiries**: Buyers can express instant interest, automatically creating leads in the MongoDB collection and triggering Twilio SMS dispatches straight to the farmer's mobile number.
7. **Trust & Safety Shields**: Displays "Verified Farmer" badges for users with 5+ scans on the FarmShield disease advisor and contains a reporting utility for suspicious listings.

---

## 📁 Repository Structure

```text
public_services/
├── models/
│   ├── Listing.js       # Crop listings database model (Mongoose)
│   └── Lead.js          # Buyer leads/inquiries tracking model (Mongoose)
├── routes/
│   └── listings.js      # API router (Listings, Leads, Reports, Mock OTP, Seeding)
├── uploads/             # Directory where uploaded crop photos are hosted
├── server.js            # Express API + Socket.io Server + MongoDB engine
├── package.json         # Server dependencies & launch scripts
├── README.md            # Setup and structural guide
└── frontend/            # React + Vite + Tailwind CSS Single-Page Application
    ├── index.html       # Loads Leaflet stylesheets and Google Fonts
    ├── tailwind.config.js
    ├── package.json     # Frontend dependencies
    └── src/
        ├── main.jsx
        ├── index.css    # Tailwind base + custom slider overlays
        ├── App.jsx      # Navigation, bilingual state, socket hooks & routes
        ├── components/
        │   ├── ProductCard.jsx
        │   ├── FilterSidebar.jsx
        │   ├── ListingDetail.jsx
        │   └── ListProduceForm.jsx
        └── utils/
            └── translations.js # English, Hindi, and Kannada dictionaries
```

---

## 🛠️ Environmental Variables

Create a `.env` file in the `public_services` root directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://agri:krishi@cluster0.qkki81l.mongodb.net/farmshield_marketplace?retryWrites=true&w=majority

# Port for our marketplace server
PORT=5050

# Twilio SMS API Credentials (helpline integration)
TWILIO_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE=your_twilio_number_here
```

---

## 🏃 Setup & Launch Instructions

### 1. Automatic installation for both backend and frontend:
From the `public_services` directory, run:
```bash
npm run setup
```
This single command runs `npm install` for the server, navigates into the `frontend` folder, and installs frontend assets.

### 2. Launch Dev Environment (Concurrently):
To launch the Node/Express backend (`PORT=5050`) and the Vite React frontend (`PORT=5180`) concurrently:
```bash
npm run dev
```

### 3. Demo Login Credentials:
- Enter any Indian mobile number (e.g. `+91 98765 43210`) inside the farmer listing form.
- Click **"Send OTP"**.
- Enter OTP code **`123456`** (mock credentials configured for hackathon evaluations).
