const API_BASE_URL = 'http://localhost:5050';

export const registerUser = async (username, password) => {
    const url = `${API_BASE_URL}/registration/register`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        // Check for non-successful HTTP status codes
        if (!response.ok) {
            const errorData = await response.json();
            // Throw an error with the server's specific message for the component to catch
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json(); // Return the success data (e.g., confirmation ID)

    } catch (error) {
        // Re-throw to be caught by the calling component
        throw error;
    }
};