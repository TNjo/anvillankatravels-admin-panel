# Anvil Lanka Travels - Admin Panel

Backend API and admin dashboard for the Dream Sri Lanka Planner tour website, built with **Next.js 15** and **Firebase**.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Cloud Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Features

- **Dashboard** — Overview of tours, bookings, and messages
- **Tour Management** — CRUD for multi-day tour packages
- **Day Tour Management** — CRUD for single-day tour experiences
- **Booking Management** — View and manage booking requests (pending/confirmed/cancelled/completed)
- **Contact Messages** — Read and reply to customer inquiries
- **Settings** — Site configuration (contact info, social media)
- **Image Upload** — Upload to Firebase Storage
- **REST API** — Full API endpoints for the frontend to consume

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tours` | List all tours | No |
| GET | `/api/tours?published=true` | List published tours | No |
| POST | `/api/tours` | Create a tour | Yes |
| GET | `/api/tours/:id` | Get a single tour | No |
| PUT | `/api/tours/:id` | Update a tour | Yes |
| DELETE | `/api/tours/:id` | Delete a tour | Yes |
| GET | `/api/day-tours` | List all day tours | No |
| POST | `/api/day-tours` | Create a day tour | Yes |
| GET | `/api/day-tours/:id` | Get a day tour | No |
| PUT | `/api/day-tours/:id` | Update a day tour | Yes |
| DELETE | `/api/day-tours/:id` | Delete a day tour | Yes |
| GET | `/api/bookings` | List all bookings | Yes |
| POST | `/api/bookings` | Create a booking | No |
| PUT | `/api/bookings/:id` | Update booking status | Yes |
| DELETE | `/api/bookings/:id` | Delete a booking | Yes |
| GET | `/api/contacts` | List all contacts | Yes |
| POST | `/api/contacts` | Submit contact form | No |
| PUT | `/api/contacts/:id` | Update contact status | Yes |
| DELETE | `/api/contacts/:id` | Delete a contact | Yes |
| POST | `/api/upload` | Upload image | Yes |
| GET | `/api/stats` | Dashboard statistics | Yes |
| GET | `/api/settings` | Get site settings | Yes |
| PUT | `/api/settings` | Update site settings | Yes |

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore, Auth, and Storage enabled

### 1. Clone and install

```bash
git clone https://github.com/your-username/anvillankatravels-admin-panel.git
cd anvillankatravels-admin-panel
npm install
```

### 2. Set up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Enable **Cloud Firestore**
4. Enable **Storage**
5. Create an admin user in Firebase Auth
6. Generate a service account key from Project Settings > Service Accounts

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

### 5. Build for production

```bash
npm run build
npm start
```

## Connecting the Frontend

The frontend (Dream Sri Lanka Planner) can consume the API endpoints. Update the frontend to fetch tours from:

```
GET /api/tours?published=true
GET /api/day-tours?published=true
```

For bookings and contact forms, POST to:

```
POST /api/bookings
POST /api/contacts
```

## Project Structure

```
src/
├── app/
│   ├── api/               # REST API routes
│   │   ├── tours/
│   │   ├── day-tours/
│   │   ├── bookings/
│   │   ├── contacts/
│   │   ├── upload/
│   │   ├── stats/
│   │   └── settings/
│   ├── dashboard/          # Admin panel pages
│   │   ├── tours/
│   │   ├── day-tours/
│   │   ├── bookings/
│   │   ├── contacts/
│   │   └── settings/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthProvider.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── firebase-admin.ts   # Server-side Firebase
│   ├── firebase-client.ts  # Client-side Firebase
│   ├── auth.ts             # Auth verification
│   └── utils.ts
├── types/
│   └── index.ts            # Shared TypeScript types
└── middleware.ts            # CORS middleware
```
