import React from 'react';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
// FIX 1: Using 'react-router' as per your configuration
import { Navigate } from 'react-router'; 

const Login = () => {

    const signInContainerStyle = {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '30px',
        backgroundColor: '#343a40',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    };
    
    return (
        <div style={{ backgroundColor: '#212529', minHeight: '100vh', paddingTop: '1px' }}>
            
            {/* 1. CHECK AUTHENTICATION STATUS */}
            {/* If the user is signed in, immediately redirect them to /home */}
            <SignedIn>
                <Navigate to="/home" replace={true} />
            </SignedIn>
            
            {/* If the user is signed out, render the sign-in form */}
            <SignedOut>
                <div style={signInContainerStyle}>
                    {/* 2. RENDER THE FULL SIGN-IN FORM */}
                    <SignIn 
                        // Tells Clerk that the component is mounted at this path
                        path="/login" 
                        // FIX 2: Explicitly set redirection URLs
                        afterSignInUrl="/home"
                        afterSignUpUrl="/home" 
                    />
                </div>
            </SignedOut>
        </div>
    );
};

export default Login;