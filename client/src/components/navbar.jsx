// src/components/navbar.jsx

import React from 'react';
// FIX 1: Import Link to prevent page reloads
import { Link } from 'react-router'; 
// FIX 2: Import Clerk components for the User Button
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const Navbar = () => {

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ padding: '10px 20px' }}>
            {/* Use Link instead of 'a' tag for the brand */}
            <Link className="navbar-brand" to="/home">AnimeReviewer</Link>
            
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div className="navbar-nav me-auto">
                    {/* FIX 3: Replace all <a href> with <Link to> */}
                    <Link className="nav-item nav-link" to="/home">Home</Link>
                    <Link className="nav-item nav-link" to="/animeSearch">Search</Link>
                    <Link className="nav-item nav-link" to="/displayFavorites">Favorites</Link>
                </div>

                {/* FIX 4: Add Auth Buttons on the right side */}
                <div className="navbar-nav ms-auto" style={{ alignItems: 'center' }}>
                    
                    {/* Show User Button when signed in */}
                    <SignedIn>
                        <div style={{ marginLeft: '15px' }}>
                            <UserButton afterSignOutUrl="/login" />
                        </div>
                    </SignedIn>

                    {/* Show Login link when signed out */}
                    <SignedOut>
                        <Link className="nav-item nav-link" to="/login">Sign In</Link>
                    </SignedOut>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;