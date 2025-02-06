import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../../../../contexts/GameContext';
import HamsterForm from '../../components/HamsterForm';
import HamsterDisplay from '../../../../components/HamsterDisplay';
import RaceTrack from '../../components/RaceTrack';

const RoomPage = () => {
    const router = useRouter();
    const { roomId } = router.query;
    const { rooms, joinLobby, currentLobby, createLobby, addHamsterToLobby, hamsters, startRace } = useGame();
    const [lobbyId, setLobbyId] = useState(null); // Local state to manage lobby ID (could be in context too)
    const [isGameMaster, setIsGameMaster] = useState(true); // Placeholder - real GM check would be needed

    useEffect(() => {
        if (roomId) {
            // For simplicity, let's create a lobby automatically when entering a room in this example
            // In a real app, you might have lobby selection or more complex lobby management
            if (!rooms[roomId] || !Object.keys(rooms[roomId].lobbies).length) {
                const newLobbyId = createLobby(roomId);
                setLobbyId(newLobbyId);
                joinLobby(roomId, newLobbyId); // Set current lobby in context
            } else {
                const firstLobbyId = Object.keys(rooms[roomId].lobbies)[0]; // Just pick the first lobby for now
                setLobbyId(firstLobbyId);
                joinLobby(roomId, firstLobbyId); // Set current lobby in context
            }
        }
    }, [roomId, rooms, createLobby, joinLobby]);

    if (!roomId || !lobbyId || !currentLobby) {
        return <p>Loading room and lobby...</p>; // Or handle room/lobby not found
    }

    const lobby = rooms[roomId]?.lobbies[lobbyId];
    if (!lobby) {
        return <p>Lobby not found.</p>;
    }

    const lobbyHamsterIds = lobby.hamsters;
    const lobbyHamstersData = lobbyHamsterIds.map(id => hamsters[id]);

    const handleStartRace = async () => {
        if (isGameMaster) { // Basic Game Master check
            await fetch('/api/start-race', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, lobbyId }),
            });
            startRace(roomId, lobbyId); // Trigger race start in context (and animation on frontend)
        } else {
            alert("Only Game Master can start the race.");
        }
    };

    return (
        <div>
            <h1>Welcome to Room: {rooms[roomId]?.name}</h1>
            <h2>Lobby ID: {lobbyId}</h2>

            <h3>Lobby Hamsters ({lobbyHamstersData.length}/{5})</h3>
            <div className="lobby-hamsters">
                {lobbyHamstersData.map(hamster => (
                    <HamsterDisplay key={hamster.id} hamster={hamster} />
                ))}
            </div>

            {lobby.status === 'waiting' && lobbyHamstersData.length < 5 && (
                <div>
                    <h3>Create Your Hamster</h3>
                    <HamsterForm roomId={roomId} lobbyId={lobbyId} userId="user123" /> {/* Placeholder userId - replace with actual auth */}
                </div>
            )}

            {lobby.status === 'waiting' && isGameMaster && (
                <button onClick={handleStartRace} disabled={lobbyHamstersData.length < 2}> {/* Example: min 2 hamsters to start */}
                    Start Race
                </button>
            )}

            {lobby.status === 'racing' && (
                <RaceTrack roomId={roomId} lobbyId={lobbyId} />
            )}

            {lobby.status === 'finished' && (
                <div>
                    <h3>Race Finished!</h3>
                    {/* Display race results here (from raceResults in context) */}
                    {/* You'd fetch race results from context and display them */}
                </div>
            )}
        </div>
    );
};

export default RoomPage;