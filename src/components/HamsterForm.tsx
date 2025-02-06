import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

interface HamsterFormProps {
    roomId: string;
    lobbyId: string;
    userId: string;
}

const HamsterForm = ({ roomId, lobbyId, userId }: HamsterFormProps) => {
    const [description, setDescription] = useState('');
    const { addHamsterToLobby, rooms } = useGame();

    const hamsterCount = rooms[roomId]?.lobbies[lobbyId]?.hamsters?.length || 0;
    const isLimitReached = hamsterCount >= 5;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!description.trim() || isLimitReached) return;

        // In a real app, you'd call an API endpoint here to generate the image
        // and then add the hamster with the generated image URL

        addHamsterToLobby(roomId, lobbyId, description, userId);
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <textarea
                    placeholder="Describe your hamster..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLimitReached}
                    className={`w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 
                        ${isLimitReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                    rows={3}
                />
            </div>
            <button
                type="submit"
                disabled={isLimitReached || !description.trim()}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors
                    ${isLimitReached || !description.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isLimitReached ? 'Maximum Hamsters Reached' : 'Create Hamster'}
            </button>
        </form>
    );
};

export default HamsterForm;