import React, { useState } from 'react';
import axios from 'axios';

const Chatbot: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [chatResponse, setChatResponse] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userInput.trim()) return;

        try {
            const response = await axios.post('http://localhost:5000/chat', { message: userInput });
            setChatResponse(response.data.response);
            setUserInput(''); // Clear input after sending
        } catch (error) {
            console.error('Error sending message to the chatbot:', error);
            setChatResponse('Failed to get response from the chatbot.');
        }
    };

    return (
        <div>
            <h1>Chat with Our Bot</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                />
                <button type="submit">Send</button>
            </form>
            {chatResponse && <p>{chatResponse}</p>}
        </div>
    );
};

export default Chatbot;