'use client';  // Add this since we're using hooks

import React, { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import Link from 'next/link';

interface Room {
    id: string;
    name: string;
    lobbyCount: number;
}

export default function Home() {
    const { rooms, createRoom } = useGame();
    const [roomNameInput, setRoomNameInput] = useState('');
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('/api/rooms');
                const data = await response.json();
                setAvailableRooms(data);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomNameInput.trim()) return;

        try {
            // First, create the room via API
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomName: roomNameInput }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create room');
            }

            // Then update local state
            const roomId = data.roomId;
            createRoom(roomNameInput); // Update context
            setRoomNameInput('');
            setAvailableRooms(prevRooms => [...prevRooms, { id: roomId, name: roomNameInput, lobbyCount: 0 }]);
        } catch (error) {
            console.error('Failed to create room:', error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="max-w-4xl mx-auto p-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Hamster Race Game
                    </h1>
                    <p className="text-gray-400">Create or join a room to start racing your AI-generated hamsters!</p>
                </div>

                {/* Available Rooms Section */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">🏠</span> Available Rooms
                    </h2>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-400">Loading rooms...</div>
                    ) : availableRooms.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No rooms available. Create one below!</div>
                    ) : (
                        <ul className="space-y-3">
                            {availableRooms.map(room => (
                                <li key={room.id} className="transition-all duration-200">
                                    <Link 
                                        href={`/rooms/${room.id}`}
                                        className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{room.name}</span>
                                            <span className="text-sm text-gray-400">
                                                {room.lobbyCount} {room.lobbyCount === 1 ? 'Lobby' : 'Lobbies'}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Create Room Section */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">👑</span> Create a New Room
                        <span className="ml-2 text-sm text-gray-400">(Game Master)</span>
                    </h2>
                    <form onSubmit={handleCreateRoom} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter room name..."
                            value={roomNameInput}
                            onChange={(e) => setRoomNameInput(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                        />
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                            disabled={!roomNameInput.trim()}
                        >
                            Create Room
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
