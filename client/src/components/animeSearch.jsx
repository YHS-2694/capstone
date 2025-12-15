// src/components/animeSearch.jsx

import React, { useRef, useEffect, useReducer } from 'react';
import useSWRInfinite from 'swr/infinite';
import Navbar from './navbar.jsx';
import { Link } from "react-router"; 
import { fetchFilteredAnime } from '../services/animeServices.jsx';
import './animation.css';


// --- 1. Filter Data Definition (No Change) ---
const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: "tv", label: "TV" },
    { value: "movie", label: "Movie" },
    { value: "ova", label: "OVA" },
    { value: "special", label: "Special" },
    { value: "ona", label: "ONA" },
    { value: "music", label: "Music" },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'airing', label: 'Airing' },
    { value: 'complete', label: 'Complete' },
    { value: 'upcoming', label: 'Upcoming' },
]

const ORDER_BY_OPTIONS = [
    { value: 'default', label: 'Default Sort' },
    { value: 'mal_id', label: 'Id' },
    { value: 'title', label: 'Title' },
    { value: 'start_date', label: 'Start Date' },
    { value: 'end_date', label: 'End Date' },
    { value: 'episodes', label: 'Episodes' },
    { value: 'score', label: 'Score' },
    { value: 'scored_by', label: 'Scored By' },
    { value: 'rank', label: 'Rank' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'members', label: 'Members' },
    { value: 'favorites', label: 'Favorites' },
]

const SORT_OPTIONS = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
];


// --- 2. Filter State Management (No Change) ---

const initialFilterState = {
    type: 'all',
    q: '',
    status: 'all',
    order_by: 'default',
    sort: 'desc',
    limit: 25,
};

function filterReducer(state, action) {
    const resetPage = { page: 1 };

    switch (action.type) {
        case 'SET_FIELD':
            return {
                ...state,
                [action.field]: action.payload,
                ...resetPage
            };
        case 'SET_QUERY':
            return { ...state, q: action.payload, ...resetPage };
        case 'RESET_FILTERS':
            return initialFilterState;
        default:
            return state;
    }
}


// --- 3. SWR Key Generation (No Change) ---

const BASE_SEARCH_URL = 'https://api.jikan.moe/v4/anime';

const getKey = (filters) => (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.pagination.has_next_page) return null;

    const currentPage = pageIndex + 1;
    const effectiveParams = {};

    effectiveParams.page = currentPage;
    effectiveParams.sfw = true; 
    effectiveParams.limit = filters.limit;

    // Conditional Filters 
    
    // Query
    if (filters.q.trim()) {
        effectiveParams.q = filters.q.trim();
    }
    // Type
    if (filters.type && filters.type !== 'all') {
        effectiveParams.type = filters.type;
    }
    // Status
    if (filters.status && filters.status !== 'all') {
        effectiveParams.status = filters.status;
    }
    // Order By (order_by)
    if (filters.order_by && filters.order_by !== 'default') {
        effectiveParams.order_by = filters.order_by;
        
        // When order_by is set, we must also send 'sort' direction
        effectiveParams.sort = filters.sort || 'desc';
    }

    // Sort (Only include if order_by is NOT 'default' and it wasn't already set above)
    if (!effectiveParams.sort && filters.sort && filters.order_by !== 'default') {
        effectiveParams.sort = filters.sort;
    }
    
    // Convert the clean object to a URL string
    const params = new URLSearchParams(effectiveParams).toString();

    return `${BASE_SEARCH_URL}?${params}`;
};


// --- 4. The AnimeSearch Component ---

// FIX: Removed the unused 'shouldSlide' prop from the function signature
const AnimeSearch = () => { 

    const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

    // --- INTEGRATION: useSWRInfinite ---
    const { data, error, size, setSize } = useSWRInfinite(
        getKey(filters),
        fetchFilteredAnime,
        {
            revalidateOnMount: true,
            revalidateOnFocus: false,
        }
    );
    // -----------------------------------

    const animeList = data ? data.flatMap(page => page.data) : [];

    // Loading State Logic
    const isFetchingEnabled = true;
    const isLoadingInitialData = !data && !error;
    const isReachingEnd = data && !data[data.length - 1]?.pagination.has_next_page;
    const isLoadingMore =
        isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');

    const loadMoreRef = useRef(null);

    // --- EFFECT: Scroll Detection Logic (No Change) ---
    useEffect(() => {
        const targetElement = loadMoreRef.current;

        const shouldObserve = targetElement && !isReachingEnd && !isLoadingMore && !error && isFetchingEnabled;

        if (!shouldObserve) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setSize(size + 1);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(targetElement);

        return () => {
            if (observer) {
                observer.unobserve(targetElement);
            }
        };

    }, [size, setSize, isReachingEnd, isLoadingMore, error, isFetchingEnabled]);


    // --- Render Logic (No Change to logic) ---

    // Full-screen Error Handling
    if (error && isLoadingInitialData) {
        return <div style={{ color: 'yellow', padding: '20px', backgroundColor: '#212529', minHeight: '100vh' }}>Failed to load results: {error.message}</div>;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#212529', color: '#f8f9fa' }}>

            <Navbar />

            <div style={{ margin: '0 20px' }}>

                <h1 style={{ textAlign: 'center', padding: '20px 0' }}>Anime Search Gallery</h1>

                {/* --- FILTER FORM --- */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    style={{
                        padding: '20px',
                        backgroundColor: '#343a40',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}
                >
                    <h3 style={{ marginBottom: '10px' }}>Search Filters</h3>

                    {/* Filter Grid */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        flexWrap: 'wrap',
                        alignItems: 'flex-end'
                    }}>
                        {/* Search Query Input (q) */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="search-q" style={{ marginBottom: '5px', fontSize: '0.9em' }}>Search Title</label>
                            <input
                                id="search-q"
                                type="text"
                                placeholder="e.g., Attack on Titan"
                                value={filters.q}
                                onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                style={{ padding: '8px', backgroundColor: '#495057', color: '#f8f9fa', border: '1px solid #6c757d' }}
                            />
                        </div>

                        {/* Type Selector */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="filter-type" style={{ marginBottom: '5px', fontSize: '0.9em' }}>Anime Type</label>
                            <select
                                id="filter-type"
                                value={filters.type}
                                onChange={(e) => dispatch({
                                    type: 'SET_FIELD',
                                    field: 'type',
                                    payload: e.target.value
                                })}
                                style={{ padding: '8px', backgroundColor: '#495057', color: '#f8f9fa', border: '1px solid #6c757d' }}
                            >
                                {TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Status Selector (NEW) */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="filter-status" style={{ marginBottom: '5px', fontSize: '0.9em' }}>Status</label>
                            <select
                                id="filter-status"
                                value={filters.status}
                                onChange={(e) => dispatch({
                                    type: 'SET_FIELD',
                                    field: 'status',
                                    payload: e.target.value
                                })}
                                style={{ padding: '8px', backgroundColor: '#495057', color: '#f8f9fa', border: '1px solid #6c757d' }}
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Order By Selector (NEW) */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="filter-order-by" style={{ marginBottom: '5px', fontSize: '0.9em' }}>Order By</label>
                            <select
                                id="filter-order-by"
                                value={filters.order_by}
                                onChange={(e) => dispatch({
                                    type: 'SET_FIELD',
                                    field: 'order_by',
                                    payload: e.target.value
                                })}
                                style={{ padding: '8px', backgroundColor: '#495057', color: '#f8f9fa', border: '1px solid #6c757d' }}
                            >
                                {ORDER_BY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Selector (NEW) */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="filter-sort" style={{ marginBottom: '5px', fontSize: '0.9em' }}>Sort Direction</label>
                            <select
                                id="filter-sort"
                                value={filters.sort}
                                onChange={(e) => dispatch({
                                    type: 'SET_FIELD',
                                    field: 'sort',
                                    payload: e.target.value
                                })}
                                // This selector is only truly relevant if order_by is NOT 'default'
                                disabled={filters.order_by === 'default'} 
                                style={{ padding: '8px', backgroundColor: '#495057', color: filters.order_by === 'default' ? '#6c757d' : '#f8f9fa', border: '1px solid #6c757d' }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        

                        {/* Reset Button */}
                        <button
                            type="button"
                            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
                            style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {/* --- RESULTS GALLERY CONTAINER --- */}

                {isLoadingInitialData ? (
                    // Show loading message only in the gallery area during initial fetch
                    <div style={{ textAlign: 'center', padding: '100px', color: 'lightblue' }}>
                        Loading initial anime list...
                    </div>
                ) : animeList.length > 0 ? (
                    // Display the list
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '20px',
                        justifyContent: 'center',
                        paddingBottom: '20px'
                    }}>
                        {animeList.map((anime) => {
                            const imageUrl = anime.images.jpg.image_url;
                            const title = anime.title;

                            return (
                                <Link
                                    className={'anime-gallery-item'} // Class enables pop-out effect
                                    key={anime.mal_id}
                                    to={`/anime/${anime.mal_id}`}
                                    state={{ animeData: anime }}
                                    style={{ width: '150px', textAlign: 'center', textDecoration: 'none', color: '#f8f9fa' }}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`Poster for ${title}`}
                                        style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <p style={{ fontSize: '0.9em', marginTop: '5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{title}</p>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    // Show "No results" message after loading has finished and the list is empty
                    <p style={{ textAlign: 'center', padding: '50px' }}>No anime found matching your criteria.</p>
                )}


                {/* --- Observer Target / Loading Indicator for Infinite Scroll --- */}
                {!isReachingEnd && (
                    <div ref={loadMoreRef} style={{ padding: '20px', textAlign: 'center' }}>
                        {isLoadingMore && !isLoadingInitialData && (
                            <div style={{ color: 'lightblue' }}>Loading more results...</div>
                        )}
                        {error && !isLoadingInitialData && (
                            <div style={{ color: 'red' }}>Failed to load more.</div>
                        )}
                    </div>
                )}

                {isReachingEnd && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'lightgreen' }}>
                        --- All available search results loaded ---
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimeSearch;