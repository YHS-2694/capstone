import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// FIX: Using 'react-router'
import { createBrowserRouter, RouterProvider } from "react-router"; 
import './index.css'
import Login from './components/login.jsx'
import Home from './components/home.jsx'
import AnimeProfile from './components/animeProfile.jsx';
import AnimeSearch from './components/animeSearch.jsx';
import DisplayFavorites from './components/displayFavorites.jsx';
import { ClerkProvider } from '@clerk/clerk-react'

// 🚨 FIX: Import Bootstrap CSS here! 🚨
import 'bootstrap/dist/css/bootstrap.min.css';
// (Optional) Import Bootstrap JS for the mobile menu toggle to work
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/anime/:id",
    element: <AnimeProfile />,
  },
  {
    path: "/animeSearch",
    element: <AnimeSearch />,
  },
  {
    path: "/displayFavorites",
    element: <DisplayFavorites />,
  }
]);


// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);