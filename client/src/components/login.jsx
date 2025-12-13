import React, { useState } from 'react';
// 1. Import useMachine hook from XState
import { useMachine } from '@xstate/react'; 
// 2. Import the XState machine definition
import { loginMachine } from './../stateMachines/loginMachine'; 

// NOTE: Ensure you have imported Bootstrap CSS in your main entry file (e.g., main.jsx)

const Login = () => {
    
    // --- State Initialization (Local Input State remains) ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // 3. Initialize the XState machine
    const [current, send] = useMachine(loginMachine);

    // --- Derived States for UI ---
    // Extract state for conditional rendering
    const isLoading = current.matches('loading');
    const isSuccess = current.matches('success');
    const isFailure = current.matches('failure');

    // Extract context for displaying results/errors
    const { error, token } = current.context;

    // --- Function to handle form submission ---
    const handleSubmit = (e) => {
        e.preventDefault(); 

        if (!username || !password) {
            // Handle client-side validation failure if required
            console.log('Please enter username and password');
            return;
        } 
        
        // 4. Trigger the LOGIN event in the machine
        // The machine's 'idle' state will catch this event, store the credentials, 
        // and transition to 'loading', which invokes your loginUser service.
        send({
            type: 'LOGIN',
            username: username,
            password: password,
        });

        // We leave the fields populated until the login is done or explicitly cleared later
        // setUsername('');
        // setPassword('');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>User Login</h2>

            {/* 5. Display Feedback based on XState */}
            {isLoading && <div style={{ color: 'blue' }}>Authenticating...</div>}
            
            {isFailure && (
                <div style={{ color: 'red' }}>
                    Login Failed: {error}
                    <button onClick={() => send('RETRY')} style={{ marginLeft: '10px' }}>
                        Retry
                    </button>
                </div>
            )}

            {isSuccess && (
                <div style={{ color: 'green' }}>
                    Login Successful! Token: {token}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label>Username</label>
                <input 
                    type='text' 
                    id='username' 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading || isSuccess} // Disable inputs while loading or on success
                /><br />
                
                <label>Password</label>
                <input 
                    type='password' 
                    id='password' 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isSuccess} // Disable inputs while loading or on success
                /><br />
                
                <button type="submit" disabled={isLoading || isSuccess}>
                    {isLoading ? 'Processing...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;