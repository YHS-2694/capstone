// src/services/animeServices.jsx

// NOTE: All references to './loginService.jsx' are removed.
// All authenticated functions now REQUIRE userId and token as parameters.

// --- UNAUTHENTICATED FETCH FUNCTIONS (REMAIN UNCHANGED) ---

export const fetchTopAnime = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed.');
    return response.json();
};
// ... (fetchAnimeByID and fetchFilteredAnime remain the same) ...
export const fetchAnimeByID = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed.');
    return response.json();
};

export async function fetchFilteredAnime(url) {
    if (!url) return null;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Jikan API Error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching filtered anime:", error);
        throw error;
    }
}
// ...


// --- FAVORITES MANAGEMENT (AUTHENTICATED) ---

// FIX: Requires userId and token
export async function addingFavorite(animeId, title, imageUrl, userId, token) {
    if (!userId || !token) {
        throw new Error("Authentication required. Cannot add favorite.");
    }

    const url = `http://localhost:5050/anime/addFavorite`;

    const favoriteData = { userId, animeId, title, imageUrl };

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // ⚠️ SECURE: Pass the JWT
            },
            body: JSON.stringify(favoriteData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}. Message: ${errorText}`);
        }

        alert(`Successfully added "${title}" to favorites!`);
        return response.json();

    } catch (error) {
        console.error("Error adding favorite anime:", error);
        alert(`Failed to add favorite. Error: ${error.message}`);
        throw error;
    }
}

// FIX: Requires userId and token
export async function getAllFavorites(userId, token) {
    if (!userId || !token) {
        throw new Error("Authentication required. Cannot fetch favorites.");
    }

    const url = `http://localhost:5050/anime/Favorites/${userId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // ⚠️ SECURE: Pass the JWT
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}. Message: ${errorText}`);
        }

        return response.json();

    } catch (error) {
        console.error("Error fetching favorite anime list:", error);
        throw error;
    }
}

// FIX: Requires userId and token
export async function removeFavorite(animeId, userId, token) {
    if (!userId || !token) {
        throw new Error("Authentication required. Cannot remove favorite.");
    }  

    const url = `http://localhost:5050/anime/removeFavorite`;

    const removeData = { userId, animeId };

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // ⚠️ SECURE: Pass the JWT
            },
            body: JSON.stringify(removeData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}. Message: ${errorText}`);
        }
        alert(`Successfully removed anime ID "${animeId}" from favorites!`);
        return response.json();
    } catch (error) {
        console.error("Error removing favorite anime:", error);
        alert(`Failed to remove favorite. Error: ${error.message}`);
        throw error;
    }
}

// --- REVIEWS MANAGEMENT (AUTHENTICATED) ---

// FIX: Added 'username' to the parameters
export async function addReview(animeId, reviewText, userId, token, username) {
    if (!userId || !token) {
        throw new Error("User is not logged in. Cannot add review.");
    }  

    const url = `http://localhost:5050/anime/addReview`;

    // FIX: Included 'username' in the payload sent to the backend
    const reviewData = { userId, animeId, reviewText, username };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
            body: JSON.stringify(reviewData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}. Message: ${errorText}`);
        }
        alert(`Successfully added review for anime ID "${animeId}"!`);
        return response.json();
    } catch (error) {
        console.error("Error adding review for anime:", error);
        alert(`Failed to add review. Error: ${error.message}`);
        throw error;
    }  
}

// ... (fetchReviewsByAnimeId remains the same as it doesn't require authentication)
export async function fetchReviewsByAnimeId(animeId) {
    if (!animeId) {
        throw new Error("Anime ID is required to fetch reviews.");
    }

    const url = `http://localhost:5050/anime/getReviews/${animeId}`; 

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}. Message: ${errorText}`);
        }
        
        return response.json(); 
        
    } catch (error) {
        console.error("Error fetching reviews for anime:", error);
        throw error;
    }
}