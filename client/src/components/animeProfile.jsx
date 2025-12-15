import React, { useState, useMemo } from 'react';
// FIX 1: Import useParams from 'react-router-dom'
import { useParams } from 'react-router';
import useSWR from 'swr';
// FIX 2: Import Clerk Hooks
import { useAuth, useUser } from '@clerk/clerk-react'; 

import { fetchAnimeByID, addingFavorite, addReview, fetchReviewsByAnimeId } from '../services/animeServices.jsx';
import Navbar from './navbar.jsx';

const BASE_URL = 'https://api.jikan.moe/v4/anime';

const AnimeProfile = () => {
    // CLERK HOOKS: Get the necessary data
    const { userId, getToken, isLoaded: authLoaded } = useAuth();
    const { user } = useUser();
    // Get the username for the review post, prioritizing firstName if available
    const reviewUsername = user?.firstName || user?.username || 'Clerk User';

    const { id } = useParams();
    const [reviewText, setReviewText] = useState('');

    // SWR for Anime Profile Data
    const animeKey = id ? `${BASE_URL}/${id}` : null;
    const {
        data: responseData,
        error: profileError,
        isLoading: isLoadingProfile
    } = useSWR(animeKey, fetchAnimeByID);

    const animeData = responseData ? responseData.data : null;

    // --- SWR for Reviews Data (No change to keys) ---
    const reviewsKey = id ? id : null; 
    const {
        data: reviewsResponse,
        error: reviewsError,
        isLoading: isLoadingReviews,
        mutate: mutateReviews
    } = useSWR(reviewsKey, fetchReviewsByAnimeId);
    
    const reviewsList = reviewsResponse || [];

    // Sort the Reviews (Newest to Oldest)
    const sortedReviews = useMemo(() => {
        if (!reviewsList.length) return [];

        return [...reviewsList].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    }, [reviewsList]);


    // --- Render Logic (State Checks) ---

    // Initial check: if Clerk or Profile is loading, show loading screen
    if (isLoadingProfile || !authLoaded) {
        return (
            <div style={{ padding: '40px', backgroundColor: '#212529', color: 'lightblue', minHeight: '100vh' }}>
                Loading profile for Anime ID: {id}...
            </div>
        );
    }
    
    // Check for profile error after loading
    if (profileError || !animeData) {
        return (
            <div style={{ padding: '40px', backgroundColor: '#212529', color: 'red', minHeight: '100vh' }}>
                Error loading profile: {profileError?.message || 'Anime not found.'}
            </div>
        );
    }

    // --- Button Handler Function (Favorite) ---
    const handleAddFavorite = async () => {
        if (!userId) {
            alert("Please sign in to add favorites.");
            return;
        }
        if (!id || !animeData) {
            alert("Cannot determine Anime ID or data.");
            return;
        }

        const title = animeData.title;
        const imageUrl = animeData.images?.jpg?.large_image_url;

        try {
            // 1. Get the session token (JWT)
            const token = await getToken();
            
            // 2. PASS ALL AUTH DATA to the service function
            await addingFavorite(id, title, imageUrl, userId, token); 
            
        } catch (error) {
            console.error('Failed to add favorite:', error);
        }
    };

    // --- Review Submission Handler ---
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert("Please sign in to submit a review.");
            return;
        }
        if (!reviewText.trim()) {
            alert("Please enter a review before submitting.");
            return;
        }

        try {
            // 1. Get the session token (JWT)
            const token = await getToken();
            
            // 2. PASS ALL AUTH DATA (including the display username) to the service
            // NOTE: Your backend will likely need to store the userId and username.
            // We pass the username for display/logging purposes.
            await addReview(id, reviewText, userId, token, reviewUsername); 
            
            setReviewText('');

            // Manually re-fetch the reviews list to show the new review instantly
            // NOTE: If your addReview service returns the new review object, 
            // you could directly update the reviewsList state instead of using mutate.
            mutateReviews(); 

        } catch (error) {
            console.error('Failed to submit review:', error);
        }
    };

    // Success state: Display the fetched data
    return (
        <div>
            <Navbar />
            <div style={{ padding: '20px', backgroundColor: '#212529', color: '#f8f9fa', minHeight: '100vh' }}>

                {/* --- HEADER AND SUMMARY --- */}
                <h1 style={{ marginBottom: '20px' }}>{animeData.title}</h1>

                <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #495057', paddingBottom: '20px' }}>
                    <img
                        src={animeData.images?.jpg?.large_image_url}
                        alt={animeData.title}
                        style={{ width: '300px', height: 'auto', borderRadius: '8px', flexShrink: 0 }}
                    />

                    <div>
                        <p><strong>Score:</strong> {animeData.score || 'N/A'}</p>
                        <p><strong>Rank:</strong> {animeData.rank || 'N/A'}</p>
                        <p><strong>Episodes:</strong> {animeData.episodes || 'N/A'}</p>
                        <p><strong>Status:</strong> {animeData.status || 'N/A'}</p>

                        <h2 style={{ marginTop: '20px', borderBottom: '1px solid #495057', paddingBottom: '5px' }}>Synopsis</h2>
                        <p style={{ maxWidth: '800px', lineHeight: '1.6' }}>{animeData.synopsis}</p>
                    </div>
                </div>

                {/* --- FAVORITE BUTTON LOGIC --- */}
                <button
                    onClick={handleAddFavorite}
                    style={{
                        padding: '10px 20px',
                        marginTop: '20px',
                        backgroundColor: '#28a745', // Green for "Add" action
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: userId ? 'pointer' : 'not-allowed', // Disable if not logged in
                        fontWeight: 'bold',
                        opacity: userId ? 1 : 0.6
                    }}
                    disabled={!userId}
                >
                    ⭐ Add to Favorite List
                </button>


                {/* --- REVIEW SUBMISSION FORM (Wider Textarea) --- */}
                <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Write a Review</h2>
                <form
                    onSubmit={handleSubmitReview}
                    style={{
                        maxWidth: '900px',
                        margin: '0 auto 40px 0',
                        padding: '15px',
                        backgroundColor: '#343a40',
                        borderRadius: '8px'
                    }}
                >
                    <p style={{color: '#adb5bd', fontSize: '0.9em', marginBottom: '10px'}}>
                        Reviewing as: <strong>{userId ? reviewUsername : 'Guest (Sign in to post)'}</strong>
                    </p>
                    <textarea
                        rows="4"
                        placeholder={userId ? "Write your review here..." : "Sign in to post a review."}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        style={{
                            width: '100%',
                            resize: 'vertical',
                            padding: '10px',
                            marginBottom: '10px',
                            boxSizing: 'border-box',
                            backgroundColor: '#495057',
                            color: '#f8f9fa',
                            border: '1px solid #6c757d',
                            borderRadius: '4px'
                        }}
                        disabled={!userId} // Disable textarea if not logged in
                    ></textarea>
                    <button
                        type="submit"
                        disabled={!reviewText.trim() || isLoadingReviews || !userId} // Disable if not logged in
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (reviewText.trim() && userId) ? 'pointer' : 'not-allowed',
                            opacity: (reviewText.trim() && userId) ? 1 : 0.6
                        }}
                    >
                        Submit Review
                    </button>
                </form>

                {/* --- REVIEWS DISPLAY LIST --- */}
                <h2 style={{ marginTop: '30px', borderBottom: '1px solid #495057', paddingBottom: '5px' }}>
                    Reviews ({sortedReviews.length})
                </h2>

                {isLoadingReviews && <p>Loading reviews...</p>}
                {reviewsError && <p style={{color: 'orange'}}>Could not load reviews. Check server connection.</p>}
                
                {!isLoadingReviews && sortedReviews.length === 0 && (
                    <p>Be the first to leave a review for this anime!</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    {sortedReviews.map((review, index) => (
                        <div 
                            key={index}
                            style={{ 
                                padding: '15px', 
                                backgroundColor: '#343a40', 
                                borderRadius: '6px', 
                                borderLeft: '3px solid #007bff' 
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9em' }}>
                                {/* FIX: Ensure the backend returns 'username' or similar field */}
                                <strong style={{ color: '#adb5bd' }}>{review.username || 'Anonymous User'}</strong> 
                                <span style={{ color: '#6c757d' }}>
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Date N/A'}
                                </span>
                            </div>
                            <p style={{ margin: 0, lineHeight: '1.4' }}>{review.review}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default AnimeProfile;