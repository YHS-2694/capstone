// src/components/home.jsx

import React, { useRef, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import { fetchTopAnime } from '../services/animeServices.jsx';
import Navbar from './navbar.jsx';
import { Link } from "react-router"; 
import { useMachine } from '@xstate/react';
import { animeGalleryMachine } from '../stateMachines/animeGalleryMachine.jsx';


// --- Configuration ---
const BASE_URL = 'https://api.jikan.moe/v4/top/anime';
const PAGE_SIZE = 25; 

// Function to generate the API key (URL) for the next page
const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.pagination.has_next_page) return null;
    const pageNumber = pageIndex + 1;
    return `${BASE_URL}?sfw=${true}&limit=${PAGE_SIZE}&page=${pageNumber}`;
};

const Home = () => {
    
    // --- XState Integration ---
    const [scrollState, send] = useMachine(animeGalleryMachine);

    // SWR fetch remains the primary source of data and size control
    const { data, error, size, setSize } = useSWRInfinite(getKey, fetchTopAnime);

    const loadMoreRef = useRef(null);

    const animeList = data ? data.flatMap(page => page.data) : [];

    const isLoadingInitialData = !data && !error;
    const isReachingEnd = data && !data[data.length - 1]?.pagination.has_next_page;
    const isLoadingMore =
        isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');

    // --- EFFECT 1: Synchronization between SWR status and XState (Fixed send calls) ---
    useEffect(() => {
        // If SWR has finished loading a batch (initial or subsequent)
        if (!isLoadingMore && !isLoadingInitialData) {
            if (isReachingEnd) {
                // FIX: Send event object
                send({ type: 'END_REACHED' }); 
            } else if (scrollState.matches('fetchingMore')) {
                // FIX: Send event object
                send({ type: 'FETCH_SUCCESS' });
            }
        }
        
        // Error handling (if SWR returns an error while fetching)
        if (error && scrollState.matches('fetchingMore')) {
            // This event already had a data payload, but ensure type is in the object
            send({ type: 'FETCH_FAILURE', data: error.message });
        }
        
    }, [isLoadingMore, isReachingEnd, scrollState, send, error, isLoadingInitialData]);


    // --- EFFECT 2: Scroll Detection Logic (Fixed send call and cleanup fix) ---
    useEffect(() => {
        const targetElement = loadMoreRef.current;
        
        // Only observe if we are in the 'ready' state and not at the end
        const shouldObserve = scrollState.matches('ready') && !isReachingEnd && targetElement;
        
        if (!shouldObserve) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    // FIX: Send event object
                    send({ type: 'LOAD_MORE' }); 
                    // Tell SWR to fetch the next page
                    setSize(size + 1); 
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(targetElement);

        // Cleanup: Disconnects the observer when dependencies change or component unmounts
        return () => {
            if (observer) {
                observer.unobserve(targetElement);
            }
        };
        
    }, [size, setSize, isReachingEnd, scrollState.value, send]); 


    // --- Render Logic ---

    // 1. Initial Loading/Error Handling
    if (error && isLoadingInitialData) {
        return <div style={{ color: 'yellow', padding: '20px', backgroundColor: '#212529', minHeight: '100vh' }}>Failed to load initial anime data: {error.message}</div>;
    }

    if (isLoadingInitialData) {
        return <div style={{ padding: '20px', color: 'lightblue', backgroundColor: '#212529', minHeight: '100vh' }}>Loading initial batch of anime...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#212529', color: '#f8f9fa' }}>
            
            <Navbar />
            
            <div>
                
                <h1 style={{ padding: '20px 0', margin: '0 20px', textAlign: 'center' }}>Top Anime Gallery</h1>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    justifyContent: 'center',
                    padding: '0 20px 20px 20px' 
                }}>
                    {animeList.length > 0 ? (
                        animeList.map((anime) => {
                            const imageUrl = anime.images.jpg.image_url;
                            const title = anime.title;

                            return (
                                <Link
                                    key={anime.mal_id}
                                    to={`/anime/${anime.mal_id}`}
                                    state={{ animeData: anime }} 
                                    style={{
                                        width: '150px',
                                        textAlign: 'center',
                                        border: '1px solid #495057', 
                                        backgroundColor: '#343a40', 
                                        padding: '10px',
                                        cursor: 'pointer', 
                                        textDecoration: 'none', 
                                        color: '#f8f9fa', 
                                        transition: 'box-shadow 0.2s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                                    }}
                                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.8)'}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)'}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`Poster for ${title}`}
                                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                    <p style={{ fontSize: '0.9em', marginTop: '5px' }}>{title}</p>
                                </Link>
                            );
                        })
                    ) : (
                        <p>No top anime results found.</p>
                    )}
                </div>

                {/* Observer Target / Loading Indicator - Controlled by XState */}
                {!scrollState.matches('endReached') && (
                    <div ref={loadMoreRef} className="text-center my-5">
                        {scrollState.matches('fetchingMore') && (
                            <div style={{ color: 'lightblue', padding: '20px' }}>Loading more anime...</div>
                        )}
                        {scrollState.matches('error') && (
                             <div style={{ color: 'red', padding: '20px' }}>
                                 Failed to load more. <button onClick={() => send({ type: 'RETRY' })}>Click to Retry</button>
                             </div>
                        )}
                    </div>
                )}

                {scrollState.matches('endReached') && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'lightgreen' }}>
                        --- All available anime loaded ---
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;