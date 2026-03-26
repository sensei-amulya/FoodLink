# FoodLink

FoodLink is a full-stack sustainable platform built on the MERN stack that connects individuals and organizations with surplus food to those in need. It effectively combats food waste while fostering a supportive community ecosystem through four distinct user roles.

## Core Features

- **Live Matching Map**: An interactive map powered by Leaflet to spot nearby food donations in real-time.
- **Real-Time Notifications**: Instant updates natively powered by Socket.io.
- **Authentication**: Secure, fast, and protected operations using JSON Web Tokens (JWT).
- **Circular Economy (Compost)**: Fully automated chronological workflows that transition expired or rejected food seamlessly to farmers for agricultural compost.

## User Roles

1. **Donor**: Share surplus food securely with the community. You can forcefully expire the item to directly send it to a local farmer for compost.
2. **Receiver**: Actively locate and request active food listings from Donors via the Live Map.
3. **Volunteer**: Manage, accept, and drop-off requested deliveries from Donors accurately to Receivers/Farmers via the Delivery Board. Proof-of-delivery enabled.
4. **Farmer**: Browse automatically expired or organically unusable food locally and claim it seamlessly as compost to promote environmental sustainability.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Leaflet
- **Backend**: Node.js, Express.js, Socket.io, Mongoose
- **Database**: MongoDB

---

## Getting Started

Follow these steps to safely configure and run the project locally.

### 1. Prerequisites

Make sure you have Node.js and npm installed.

### 2. Environment Configuration (`.env`)

Since sensitive keys shouldn't be pushed to GitHub, you need to create two `.env` files locally to hold your configuration.

#### Server Environment

Create a file named `.env` inside the `server/` directory: `server/.env`

Add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key
```

*(Replace `your_mongodb_connection_string_here` with a real standard MongoDB connection URI and enter any strong string for the `JWT_SECRET`)*

#### Client Environment

Create a file named `.env` inside the `client/` directory: `client/.env`

Add the following variables:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Installation & Running

1. Open two separate terminal windows.
2. In the first terminal, navigate to the **server** directory:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. In the second terminal, navigate to the **client** directory:
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. Open your browser and navigate to the localhost port provided in the client terminal (typically `http://localhost:5173`).
