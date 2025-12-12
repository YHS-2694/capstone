import React, { useState } from 'react';
import { registerUser } from './../services/registerService';

const register = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleForm = async (e) => {

        e.preventDefault();

        if (username && password) {
            try {
                // 2. Call the service function, moving all fetch logic out of the component
                console.log('Registration:', username, password);
                const data = await registerUser(username, password);
                setUsername('');
                setPassword('');
                console.log(data);

            } catch (error) {
                // 3. Catch the error thrown by the service file
                console.error('Registration Failed:', error);

            }
        }

    }

    return (
        <form onSubmit={handleForm}>
            <label>Username</label>
            <input type='text' id='username' value={username} onChange={(e) => setUsername(e.target.value)}></input>
            <label>Password</label>
            <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
            <button>Register</button>
        </form>
    )

}

export default register;