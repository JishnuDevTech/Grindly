# Architecture

Grindly is currently a client-side React application.

- `App.jsx` controls the active page, onboarding gate, and user state.
- Page components compose reusable components and mock data.
- `mockData.js` is the temporary data source and can later be replaced by service calls.
- Tailwind utility classes and `index.css` provide the visual system.

The frontend does not yet depend on the backend, authentication, or a persistent database.
