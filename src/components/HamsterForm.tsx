import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

interface HamsterFormProps {
    roomId: string;
    lobbyId: string; 
    userId: string;
}

const HamsterForm = ({ roomId, lobbyId, userId }: HamsterFormProps) => {
    const [description, setDescription] = useState('');
    const { addHamsterToLobby } = useGame();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!description.trim()) return;

        // In a real app, you'd call an API endpoint here to generate the image
        // and then add the hamster with the generated image URL

        addHamsterToLobby(roomId, lobbyId, description, userId); // Pass userId
        setDescription(''); // Clear input after submission
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                placeholder="Describe your hamster..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Create Hamster</button>
        </form>
    );
};

export default HamsterForm;