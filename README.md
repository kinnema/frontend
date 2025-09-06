# Kinnema

Kinnema is a modern movie application that provide users with a seamless experience for discovering, searching, and watching movies and TV series. Built with Next.js, TypeScript, and Tailwind CSS, Kinnema offers a fast, responsive, and user-friendly interface.

[Live Demo](https://kinnema.vercel.app)

<img width="1437" alt="Screenshot" src="image.png">

## Features

- **Browse & Search:** Discover trending movies and series, or search for specific titles.
- **Authentication:** Secure login and user management.
- **Favorites:** Add movies and series to your favorites list.
- **Continue Watching:** Resume watching from where you left off.
- **Responsive UI:** Optimized for all devices with a clean, modern design.
- **API Integration:** Powered by TMDB for rich metadata and streaming links.
- **Desktop / Electron support:** Desktop builds and improved Electron initialization and routing for a native desktop experience. (See <attachments> above for file contents.)
- **Multilingual (i18n):** Integrated i18next for multilingual support and translations. (See <attachments> above for file contents.)
- **Subtitles manager:** Added a subtitle manager for better subtitle handling, encoding support, and configuration. (See <attachments> above for file contents.)
- **P2P sync between devices:** Peer-to-peer synchronization of state and collections across devices. (See <attachments> above for file contents.)
- **Improved event handling (RxJS):** Replaced EventEmitter with RxJS Subjects for more robust event flow and state management. (See <attachments> above for file contents.)
- **Favorites (RxDB):** Migrated favorites to RxDB for local/offline storage and improved performance. (See <attachments> above for file contents.)
- **Picture-in-Picture & player theming:** Enhanced video player styling with MediaThemeSutro and added Picture-in-Picture support. (See <attachments> above for file contents.)
- **CapacitorHttp integration:** Integrated CapacitorHttp for native network requests when running on mobile/native platforms. (See <attachments> above for file contents.)
- **Sync settings UI:** Sync settings now display a Sync ID and include a clipboard copy action for easy sharing. (See <attachments> above for file contents.)

## Tech Stack

- **Framework:** Vite/React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** TMDB
- **State Management:** Custom hooks and Zustand
- **Icons:** Lucide-react

## Project Structure

```
.
├── app/                # Next.js app directory (pages, layouts, providers)
├── components/         # Shared React components
├── hooks/              # Custom React hooks
├── lib/                # API clients, models, constants, stores
├── public/             # Static assets (icons, images)
├── styles/             # Global styles (Tailwind, PostCSS)
├── .env.example        # Example environment variables
├── openapi.yaml        # OpenAPI spec for backend API
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```

## Getting Started

1. **Clone the repository:**

   ```sh
   git clone https://github.com/kinnema/frontend.git
   cd frontend
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in the required values.

4. **Run the development server:**

   ```sh
   npm run dev
   ```

5. **Build for production:**
   ```sh
   npm run build
   npm start
   ```

## Configuration

- **API Endpoints:** Configure API URLs and keys in the `.env` file.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License.

---

Enjoy

## Recent changes

The following features were added recently (not already documented above):

- i18n / Multilingual support — integrated i18next (commit a518a03). (See <attachments> above for file contents.)
- Subtitles manager — added a subtitle manager for improved subtitle handling (commit 11e6c5b). (See <attachments> above for file contents.)
- P2P sync between devices — initial peer-to-peer sync support and related improvements (commits 9d205da, 0ecdacd). (See <attachments> above for file contents.)
- Favorites & local DB — migrated favorites to RxDB for offline/local storage (commit 3a3ab92 / 706588a). (See <attachments> above for file contents.)
- Picture-in-Picture & MediaThemeSutro — enhanced video player styling and added Picture-in-Picture support (commit 8c3aeb0). (See <attachments> above for file contents.)
- Native & Electron support improvements — added native integrations and improved Electron initialization/routing (commits a0b7761, e97eb40, 5dba297). (See <attachments> above for file contents.)
- CapacitorHttp integration — integrated CapacitorHttp for native network requests in plugin manager and loaders (commit 9cf1328). (See <attachments> above for file contents.)
- Sync settings UI — show Sync ID and provide clipboard copy functionality in sync settings (commit 9339b81). (See <attachments> above for file contents.)
