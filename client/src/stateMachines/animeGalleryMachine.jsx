// src/stateMachines/animeGalleryMachine.jsx

import { createMachine } from 'xstate';

export const animeGalleryMachine = createMachine({
    id: 'scrollLoader',
    initial: 'ready', 
    context: {
        error: undefined,
    },
    states: {
        ready: {
            // Observer fires, sends LOAD_MORE
            on: {
                LOAD_MORE: 'fetchingMore',
                END_REACHED: 'endReached', // If SWR determined we reached the end
            },
        },
        fetchingMore: {
            // Waiting for SWR's fetch to complete
            on: {
                FETCH_SUCCESS: 'ready', // SWR finished, ready for next scroll
                FETCH_FAILURE: 'error',
            },
        },
        error: {
            on: {
                RETRY: 'fetchingMore', // User clicks retry button
            },
        },
        endReached: {
            type: 'final', 
        },
    },
});