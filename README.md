# Samra — Saudi Oral Heritage Platform

> Digitally preserving Saudi Arabia's oral heritage through community storytelling and cultural events.

---

## About

**Samra** is a web platform dedicated to collecting, preserving, and sharing the oral stories, folklore, and cultural traditions of Saudi Arabia. Users can explore regional story libraries, discover popular narratives, and — as registered creators — contribute their own stories.

---

## Features

- **Dynamic story libraries** — Riyadh and Ash Sharqiyah collections rendered from a central data store, with live search and genre filtering
- **Popular Stories feed** — filterable by type (stories / events) with real-time search
- **Creator accounts** — sign up, log in, and access a personal dashboard
- **Admin panel** — moderate content and manage the platform
- **Interactive story pages** — views, likes, comments, and follow functionality
- **Responsive design** — mobile-friendly across all pages

---

## Project Structure

```
Samra/
├── public/                    # Frontend — served statically by Express
│   ├── index.html             # Homepage
│   ├── popular-stories.html
│   ├── riyadh-library.html
│   ├── dhahran-library.html
│   ├── map.html
│   ├── creator-login.html
│   ├── creator-signup.html
│   ├── creator-dashboard.html
│   ├── admin-login.html
│   ├── start-write.html
│   ├── forgot-password.html
│   ├── stories-data.js        # Central data store (all stories/events)
│   ├── shared.js              # Reusable header, footer, card builder
│   ├── main.js                # Story page interactions (likes, comments)
│   ├── images/                # All image assets
│   └── stories/               # Individual story & event pages
│       ├── ahmed-al-khobar.html
│       ├── aisha-almutairi.html
│       └── ...
├── models/
│   └── Story.js               # Mongoose story schema
├── routes/
│   └── stories.js             # Express API routes
├── server.js                  # Express backend entry point
├── package.json
├── .env.example               # Environment variable template
└── .gitignore
```

---

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | HTML, CSS, Vanilla JavaScript  |
| Backend   | Node.js + Express.js           |
| Database  | MongoDB Atlas (Mongoose)       |
| Auth      | bcryptjs password hashing      |
| Uploads   | Multer (image upload)          |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Samra.git
cd Samra

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Then edit .env and add your MongoDB URI

# 4. Start the server
npm start
```

Open `http://localhost:3000` in your browser.

---

## Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
PORT=3000
```

---

## Team

| Name               |
|--------------------|
| Fatima Bazroun     |
| Fatimah Alshabaan  |
| Sadeem Alotaibi    |
| Sarah Alsaleem     |
| Renad Alqahtani    |
| Reman Alqahtani    |

---

## License

© 2025 Samra. All rights reserved.
