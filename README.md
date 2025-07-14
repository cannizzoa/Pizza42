# Pizza42 - Auth0 Demo

Pizza42 is a small demonstration application that shows how to integrate authentication using [Auth0](https://auth0.com) in a Single Page Application served by Express. After logging in, the user can view their profile and submit a pizza order through protected APIs.

## Project structure

- `server.js` – Express server that provides the APIs and serves the static files.
- `bin/www` – entry point that starts the application on port 3000.
- `index.html` – main page of the application.
- `public/` – static resources.
  - `js/app.js` handles authentication and API calls.
  - `js/ui.js` implements navigation and updates the interface.
  - `css/main.css` contains styles.
  - `images/` images used by the app.
- `auth_config.json` – Auth0 domain, clientId and audience parameters.

## Installation

1. Clone this repository.
2. Install the dependencies:

   ```bash
   npm install
   ```
3. Customize `auth_config.json` with the values from your Auth0 tenant.

## Running the application

To start the development server run:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## How to test

1. Visit `http://localhost:3000` and click **Log in** to authenticate through Auth0's Universal Login.
2. After logging in you can view your profile and fill out the order form for a pizza.
3. Press **Send Order** to post the order to the protected `/api/orders` endpoint which requires a valid JWT.
4. If your email address is not verified you can use **Verify your email** to request a verification message via the `/api/send-verification-email` endpoint.

Check the browser console or the server logs to see the API calls and verify that the tokens are used correctly.

---

This application is intended exclusively for demonstration purposes as part of a presentation of Auth0 features.
