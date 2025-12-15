import React, { useState, useEffect } from 'react';
import { getAllFavorites, removeFavorite } from '../services/animeServices'; 
import Navbar from './navbar.jsx';
// Keeping your preferred import
import { Link } from 'react-router'; 
import { useAuth, useUser } from '@clerk/clerk-react';

const DisplayFavorites = () => {
    // CLERK HOOKS
    const { userId, getToken, isLoaded: authLoaded } = useAuth();
    const { user } = useUser();
    
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- REMOVE FAVORITE HANDLER ---
    const handleRemoveFavorite = async (animeId) => {
        if (!userId) {
             setError("You must be logged in to remove favorites.");
             return;
        }
        try {
            const token = await getToken();
            await removeFavorite(animeId, userId, token);
            setFavorites(prevFavorites => prevFavorites.filter(anime => anime.animeId !== animeId));
        } catch (err) {
            console.error(`Failed to remove favorite with ID: ${animeId}`, err);
            setError(err.message || "Failed to remove favorite. Please try again.");
        }
    };

    // --- LOAD FAVORITES HANDLER ---
    const loadFavorites = async () => {
        // 1. Initial Auth Check
        if (!authLoaded || !userId) {
            setIsLoading(false);
            if (authLoaded && !userId) {
                setError("You must be logged in to view favorites.");
            }
            return;
        }

        try {
            // FIX: Only set isLoading to true if we have NO data.
            // This prevents the screen from flickering to "Loading..." if the list is already visible.
            if (favorites.length === 0) {
                setIsLoading(true);
            }

            const token = await getToken(); 
            const favoritesResponse = await getAllFavorites(userId, token); 
            const detailedFavorites = favoritesResponse.favorites || []; 
            
            setFavorites(detailedFavorites);
            setError(null); 

        } catch (err) {
            setError(err.message || "Failed to load favorites.");
            // Only clear favorites on error if you strictly want to hide stale data
            // setFavorites([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only run this if we actually have a User ID to fetch for
        if (userId) {
            loadFavorites();
        } else if (authLoaded && !userId) {
            // If auth is done loading but there is no user, stop loading immediately
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]); // 👈 ONLY listen to userId changes

    // --- RENDER: Loading State ---
    // Only show full-screen loading if we are loading AND have no data to show
    if (isLoading && favorites.length === 0) {
        return <div style={{ padding: '20px', color: 'lightblue', backgroundColor: '#212529', minHeight: '100vh' }}>Loading your favorite anime...</div>;
    }

    // --- RENDER: Error State ---
    if (error) {
        return <div style={{ padding: '20px', color: 'red', backgroundColor: '#212529', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ padding: '20px' }}>Error: {error}</div>
        </div>;
    }

    // --- RENDER: Empty State ---
    if (!isLoading && favorites.length === 0) {
        return (
             <div style={{ padding: '20px', backgroundColor: '#212529', minHeight: '100vh', color: '#f8f9fa' }}>
                <Navbar />
                <div style={{ padding: '20px' }}>
                    <p style={{marginBottom: '10px'}}>You have no anime in your favorites list yet.</p>
                    <Link to="/animeSearch" style={{color: '#007bff'}}>Start searching now!</Link>
                </div>
            </div>
        );
    }

    // --- RENDER: Success State ---
    return (
        <div>
            <Navbar />
            <div style={{ padding: '20px', backgroundColor: '#212529', minHeight: '100vh', color: '#f8f9fa' }}>
                <h2>⭐ {user?.firstName || user?.username || 'Your'} Favorite Anime</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                    {favorites.map((anime) => (
                        <div 
                            key={anime.animeId} 
                            style={{ 
                                width: '200px', 
                                backgroundColor: '#343a40', 
                                borderRadius: '8px', 
                                overflow: 'hidden', 
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <Link to={`/anime/${anime.animeId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img 
                                    src={anime.imageUrl} 
                                    alt={anime.title} 
                                    style={{ width: '100%', height: '280px', objectFit: 'cover' }} 
                                />
                                <div style={{ padding: '10px' }}>
                                    <h3 style={{ fontSize: '1.1em', margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {anime.title}
                                    </h3>
                                    <p style={{ margin: '0', fontSize: '0.9em', color: '#888' }}>Click for details</p>
                                </div>
                            </Link>

                            <button
                                onClick={() => handleRemoveFavorite(anime.animeId)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DisplayFavorites;