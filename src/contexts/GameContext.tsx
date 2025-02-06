'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface GameContextType {
    rooms: Record<string, any>;
    hamsters: Record<string, any>;
    createRoom: (name: string) => string;
    createLobby: (roomId: string) => string;
    joinLobby: (roomId: string, lobbyId: string) => void;
    addHamsterToLobby: (roomId: string, lobbyId: string, description: string, userId: string) => void;
    startRace: (roomId: string, lobbyId: string) => void;
    currentLobby: { roomId: string; lobbyId: string } | null;
    raceResults: string[] | null;
    finishRace: (roomId: string, lobbyId: string, results: string[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
}

export function GameProvider({ children }: { children: ReactNode }) {
    const [rooms, setRooms] = useState<Record<string, any>>({});
    const [hamsters, setHamsters] = useState<Record<string, any>>({});
    const [currentLobby, setCurrentLobby] = useState<{ roomId: string; lobbyId: string } | null>(null);
    const [raceResults, setRaceResults] = useState<string[] | null>(null);

    const createRoom = (name: string) => {
        const roomId = uuidv4();
        setRooms(prevRooms => ({
            ...prevRooms,
            [roomId]: { name, lobbies: {} }
        }));
        return roomId;
    };

    const createLobby = (roomId: string) => {
        const lobbyId = uuidv4();
        setRooms(prevRooms => ({
            ...prevRooms,
            [roomId]: {
                ...prevRooms[roomId],
                lobbies: {
                    ...prevRooms[roomId]?.lobbies,
                    [lobbyId]: { hamsters: [], status: 'waiting' }
                }
            }
        }));
        return lobbyId;
    };

    const joinLobby = (roomId: string, lobbyId: string) => {
        setCurrentLobby({ roomId, lobbyId });
    };

    const addHamsterToLobby = (roomId: string, lobbyId: string, description: string, userId: string) => {
        const hamsterId = uuidv4();
        const mockImage = `/hamster-${Math.ceil(Math.random() * 5)}.png`;

        setHamsters(prev => ({
            ...prev,
            [hamsterId]: {
                id: hamsterId,
                description,
                image: mockImage,
                userId,
                position: 0,
                speed: Math.random() * 5 + 2
            }
        }));

        setRooms(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                lobbies: {
                    ...prev[roomId].lobbies,
                    [lobbyId]: {
                        ...prev[roomId].lobbies[lobbyId],
                        hamsters: [...prev[roomId].lobbies[lobbyId].hamsters, hamsterId]
                    }
                }
            }
        }));
    };

    const startRace = (roomId: string, lobbyId: string) => {
        setRooms(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                lobbies: {
                    ...prev[roomId].lobbies,
                    [lobbyId]: {
                        ...prev[roomId].lobbies[lobbyId],
                        status: 'racing'
                    }
                }
            }
        }));

        // Initialize race positions and speeds
        setHamsters(prev => {
            const updatedHamsters = { ...prev };
            const lobbyHamsterIds = rooms[roomId].lobbies[lobbyId].hamsters;
            lobbyHamsterIds.forEach(hamsterId => {
                updatedHamsters[hamsterId] = {
                    ...updatedHamsters[hamsterId],
                    position: 0,
                    speed: Math.random() * 5 + 2 // Random speed between 2-7
                };
            });
            return updatedHamsters;
        });
    };

    const finishRace = (roomId: string, lobbyId: string, results: string[]) => {
        console.log("Finishing race with results:", results); // Debug log
        setRaceResults(results);
        setRooms(prev => {
            const updatedRooms = {
                ...prev,
                [roomId]: {
                    ...prev[roomId],
                    lobbies: {
                        ...prev[roomId].lobbies,
                        [lobbyId]: {
                            ...prev[roomId].lobbies[lobbyId],
                            status: 'finished'
                        }
                    }
                }
            };
            console.log("Updated rooms state:", updatedRooms); // Debug log
            return updatedRooms;
        });
    };

    const value = {
        rooms,
        hamsters,
        createRoom,
        createLobby,
        joinLobby,
        addHamsterToLobby,
        startRace,
        currentLobby,
        raceResults,
        finishRace,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
} 