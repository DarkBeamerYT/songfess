# songfess 🎵

> say what you can't with words. send it through a song.

**songfess** is an anonymous music confession platform; search for a song, write a short message, and send it into the void. anyone can look up a name and find confessions sent to them.

live at [songfess.dbyt.my.id](https://songfess.dbyt.my.id) · built by [dark](https://dbyt.my.id) · inspired by [sendthesong.xyz](https://sendthesong.xyz)

---

## features

- 🎵 search songs via Spotify API
- 🎧 30-second song previews via iTunes API
- 💌 send anonymous confessions tied to a song
- 🔍 look up confessions sent to any name
- 🌌 dark astronomical aesthetic
- 📱 mobile responsive

---

## tech stack

- **backend** — Node.js + Express
- **database** — MySQL
- **song search** — Spotify Web API
- **song previews** — iTunes Search API
- **frontend** — vanilla HTML/CSS/JS
- **hosting** — DirectAdmin shared hosting or any Node-capable server

---

## getting started

### prerequisites

- Node.js 18+
- MySQL database
- Spotify Developer account

### 1. clone the repo

```bash
git clone https://github.com/yourusername/songfess.git
cd songfess
```

### 2. install dependencies

```bash
npm install
```

### 3. set up the database

create a MySQL database and run this SQL to create the confessions table:

```sql
CREATE TABLE confessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(50) NOT NULL,
  message VARCHAR(300) NOT NULL,
  song_title VARCHAR(100) NOT NULL,
  song_artist VARCHAR(100) NOT NULL,
  song_cover TEXT,
  spotify_url TEXT,
  preview_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. set up Spotify API

1. go to [developer.spotify.com](https://developer.spotify.com)
2. create an app
3. copy your **Client ID** and **Client Secret**

### 5. configure environment

```bash
cp .env.example .env
```

fill in your `.env`:

```env
DB_HOST=localhost
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

PORT=3000
NODE_ENV=production
```

### 6. run the app

```bash
# development
npm run dev

# production
npm start
```

visit `http://localhost:3000`

---

## deployment

### with PM2 (recommended)

```bash
npm install -g pm2
pm2 start server.js --name songfess
pm2 save
```

### with DirectAdmin Node.js App

1. create a subdomain in DirectAdmin
2. upload files to the subdomain folder
3. go to **Node.js App** → create app, set startup file to `server.js`
4. run `npm install` in terminal
5. add a `.htaccess` to `public_html` to proxy to Node:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000%{REQUEST_URI} [P,L]
```

---

## API

| method | endpoint | description |
|--------|----------|-------------|
| GET | `/api/confessions` | fetch confessions (paginated) |
| GET | `/api/confessions?random=true` | fetch random confessions |
| GET | `/api/confessions/random` | fetch random snippets (for floating label) |
| GET | `/api/confessions/search?name=x` | search confessions by recipient |
| POST | `/api/confessions` | submit a new confession |
| GET | `/api/spotify/search?q=x` | search songs |

---

## rate limiting

- **submissions** — 5 per hour per IP
- **song search** — 30 per minute per IP

---

## license

MIT — do whatever you want with it, just credit me :)

---


made with 🖤 by [dark](https://dbyt.my.id)
