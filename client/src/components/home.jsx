import React, { useState } from 'react';

const Home = () => {
    // State to hold the form data
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default form submission (page reload)

        // *** In a real application, you would send this data to your backend API ***

        if (!username && !password) {
            console.log('Please enter username and password');
            // Example: Redirect user or store token
        } else {
            const data = await loginUser(username, password);
            console.log(data);
        }

        // Clear the form after submission
        setUsername('');
        setPassword('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input type='text' id='username' value={username} onChange={(e) => setUsername(e.target.value)}></input>
            <label>Password</label>
            <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
            <button>Login</button>
        </form>
    );
};

export default Home;