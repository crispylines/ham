'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import HamsterForm from '@/components/HamsterForm';
import HamsterDisplay from '@/components/HamsterDisplay';
import RaceTrack from '@/components/RaceTrack';

interface Hamster {
    id: string;
    image: string;
    description: string;
    // Add other hamster properties as needed
}

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { rooms, joinLobby, currentLobby, createLobby, hamsters, startRace } = useGame();
    const [lobbyId, setLobbyId] = useState<string | null>(null);
    const [isGameMaster, setIsGameMaster] = useState(true);

    useEffect(() => {
        if (!roomId) return;
        
        // Check if we already have a lobby ID set
        if (lobbyId) return;
        
        if (!rooms[roomId] || !Object.keys(rooms[roomId]?.lobbies || {}).length) {
            const newLobbyId = createLobby(roomId);
            setLobbyId(newLobbyId);
            joinLobby(roomId, newLobbyId);
        } else {
            const firstLobbyId = Object.keys(rooms[roomId].lobbies)[0];
            setLobbyId(firstLobbyId);
            joinLobby(roomId, firstLobbyId);
        }
    }, [roomId, lobbyId]); // Only depend on roomId and lobbyId

    if (!roomId || !lobbyId || !currentLobby) {
        return <div className="p-8 text-center">Loading room and lobby...</div>;
    }

    const lobby = rooms[roomId]?.lobbies[lobbyId];
    if (!lobby) {
        return <div className="p-8 text-center">Lobby not found.</div>;
    }

    const lobbyHamsterIds = lobby.hamsters;
    const lobbyHamstersData = lobbyHamsterIds.map((id: string) => hamsters[id]).filter(Boolean);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Room: {rooms[roomId]?.name}</h1>
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Lobby Hamsters ({lobbyHamstersData.length}/5)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lobbyHamstersData.map((hamster: Hamster) => (
                            <HamsterDisplay key={hamster.id} hamster={hamster} />
                        ))}
                    </div>
                </div>

                {lobby.status === 'waiting' && lobbyHamstersData.length < 5 && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Create Your Hamster</h2>
                        <HamsterForm roomId={roomId} lobbyId={lobbyId} userId="user123" />
                    </div>
                )}

                {lobby.status === 'waiting' && lobbyHamstersData.length === 5 && isGameMaster && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <button
                            onClick={() => startRace(roomId, lobbyId)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                        >
                            Start Race! 🏁
                        </button>
                    </div>
                )}

                {(lobby.status === 'racing' || lobby.status === 'finished') && (
                    <RaceTrack roomId={roomId} lobbyId={lobbyId} />
                )}
            </div>
        </div>
    );
} 