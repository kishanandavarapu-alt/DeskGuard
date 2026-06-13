# DeskGuard

**Library Seat Booking & Anti-Hoarding App**

DeskGuard solves a common campus problem: students reserve library desks with their bags and disappear for hours, leaving other students with nowhere to study. DeskGuard provides a live, color-coded map of desk availability, QR-based check-in, and automatic freeing of abandoned desks.

## Features

- **Live library map** — color-coded grid showing desk status:
  - 🟩 Green = Free
  - 🟥 Red = Occupied
  - 🟨 Yellow = Away (paused, returning soon)
  - ⬜ Grey = Abandoned
- **QR check-in** — students scan a QR code on their desk to check in
- **Away mode** — pause your session for up to 20 minutes without losing your desk
- **Auto-abandon** — if a student doesn't respond to a "Still here?" prompt, the desk is automatically freed
- **Librarian dashboard** — view all desks, filter abandoned ones, and manually reset any desk

## How to Run

1. Clone this repository
   ```bash
   git clone <your-repo-url>
   cd deskguard
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

5. For QR scanning, allow camera access when prompted (works on `localhost` and on HTTPS deployments)

## Environment Variables

None required for this prototype — it runs entirely on mock/local data with no backend or database connection.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **QR Code:** `qrcode.react` (generation), `html5-qrcode` (scanning)
- **Planned Backend:** Node.js / Express
- **Planned Database:** PostgreSQL
- **Planned Real-time Updates:** WebSocket

## Note on Timer Implementation

This Round 1 prototype uses client-side timers (JavaScript `setInterval`) to demonstrate the check-in, away, and auto-abandon flow visually.

In production, all timers would be server-authoritative: a Node.js backend with PostgreSQL stores each desk's check-in/away timestamps, and a background cron job sweeps the database every minute to auto-expire desks — never relying on the browser. See the architecture diagram in the pitch deck for the planned design.

## Engineering Challenge (Production Design)

- All desk timers run **server-side** — never trusted from the browser
- A background cron job sweeps the database every minute, auto-expiring desks whose check-in or Away timer has run out
- Librarians can view abandoned desks and manually reset them via a dedicated dashboard

## Future Scope

- Real QR codes printed and affixed to physical desks
- Push notifications for "Still here?" prompts
- Occupancy analytics and trend reporting for librarians
- Mobile app version
