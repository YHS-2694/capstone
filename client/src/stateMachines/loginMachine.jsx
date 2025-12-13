// src/stateMachines/loginMachine.js (New File)

import { createMachine, assign } from 'xstate';
// 1. Import your existing service function
import { loginUser } from '../services/loginService'; 

export const loginMachine = createMachine({
    id: 'login',
    initial: 'idle',
    context: {
        token: null,
        error: undefined,
        username: '',
        password: '',
    },
    states: {
        idle: {
            // Wait for the LOGIN event, then store the credentials and transition
            on: {
                LOGIN: {
                    target: 'loading',
                    actions: assign({
                        username: (context, event) => event.username,
                        password: (context, event) => event.password,
                        error: undefined, // Clear any previous error
                    }),
                },
            },
        },
        loading: {
            // 2. The core integration: Use 'invoke' to execute your loginUser service
            invoke: {
                id: 'authenticate',
                // The source is your external service function
                src: (context) => loginUser(context.username, context.password), 
                
                // 3. Success Path: Store the received token
                onDone: {
                    target: 'success',
                    actions: assign({
                        token: (context, event) => event.data.token, // Assuming loginUser returns { token: '...' }
                    }),
                },
                
                // 4. Failure Path: Store the error message
                onError: {
                    target: 'failure',
                    actions: assign({
                        error: (context, event) => event.data.message || 'Login failed',
                    }),
                },
            },
        },
        success: {
            type: 'final', // Marks the end of this state flow
        },
        failure: {
            on: {
                RETRY: 'idle', // Allow the user to retry the login process
            },
        },
    },
});