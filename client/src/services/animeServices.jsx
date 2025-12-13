// src/services/animeServices.jsx

export const fetchTopAnime = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed.');
    // Jikan API returns JSON with a 'data' property and 'pagination' property
    return response.json(); 
};

export const fetchAnimeByID = async (url) => {
    // This is used for the full profile fallback if data isn't in cache
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed.');
    return response.json();
};