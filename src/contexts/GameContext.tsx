'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface HamsterState {
    id: string;
    description: string;
    image: string;
    userId: string;
    position: number;
    speed: number;
    health: number;
    lasersRemaining: number;
}

interface GameContextType {
    rooms: Record<string, any>;
    hamsters: Record<string, HamsterState>;
    createRoom: (name: string) => string;
    createLobby: (roomId: string) => string;
    joinLobby: (roomId: string, lobbyId: string) => void;
    addHamsterToLobby: (roomId: string, lobbyId: string, description: string, userId: string) => void;
    startRace: (roomId: string, lobbyId: string) => void;
    currentLobby: { roomId: string; lobbyId: string } | null;
    raceResults: string[] | null;
    finishRace: (roomId: string, lobbyId: string, results: string[]) => void;
    mountedHamsters: Record<string, string>;
    mountHamster: (userId: string, hamsterId: string) => void;
    shootLaser: (fromHamsterId: string, velocityX: number, velocityY: number) => void;
    handleHamsterHit: (hamsterId: string) => void;
    userId: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
}

export function GameProvider({ children }: { children: ReactNode }) {
    const [rooms, setRooms] = useState<Record<string, any>>({});
    const [hamsters, setHamsters] = useState<Record<string, HamsterState>>({});
    const [currentLobby, setCurrentLobby] = useState<{ roomId: string; lobbyId: string } | null>(null);
    const [raceResults, setRaceResults] = useState<string[] | null>(null);
    const [mountedHamsters, setMountedHamsters] = useState<Record<string, string>>({});
    const [userId] = useState<string>(() => uuidv4());

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
        // Check if the hamster limit has been reached
        const currentHamsterCount = rooms[roomId]?.lobbies[lobbyId]?.hamsters?.length || 0;
        if (currentHamsterCount >= 5) {
            console.warn('Maximum number of hamsters (5) reached');
            return;
        }

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
                speed: Math.random() * 20 + 8,
                health: 5, // Initial health
                lasersRemaining: 3 // Initial laser count for non-mounted hamsters
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
            lobbyHamsterIds.forEach((hamsterId: string) => {
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
        console.log("Starting finishRace with:", { roomId, lobbyId, results });
        
        // Update race results first
        setRaceResults(results);
        
        // Then update room status
        setRooms(prev => {
            // Debug log to check previous state
            console.log("Previous rooms state:", prev);
            
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
            
            // Debug log to check the update
            console.log("New rooms state:", updatedRooms);
            return updatedRooms;
        });

        // Debug log to verify both states were updated
        console.log("Current state after updates:", {
            raceResults: results,
            roomStatus: 'finished'
        });
    };

    const mountHamster = (userId: string, hamsterId: string) => {
        setMountedHamsters(prev => ({
            ...prev,
            [userId]: hamsterId
        }));
    };

    const shootLaser = (fromHamsterId: string, velocityX: number, velocityY: number) => {
        console.log('GameContext shootLaser called:', { fromHamsterId, velocityX, velocityY });
        
        const shooter = hamsters[fromHamsterId];
        if (!shooter || shooter.health <= 0) {
            console.log('Shooter not found or defeated:', { shooter });
            return;
        }

        // Create projectile in RaceTrack component
        const event = new CustomEvent('shoot-laser', {
            detail: {
                fromHamsterId,
                velocityX,
                velocityY
            }
        });
        console.log('Dispatching shoot-laser event:', event);
        window.dispatchEvent(event);
    };

    const handleHamsterHit = (hamsterId: string) => {
        setHamsters(prev => {
            const updatedHamster = {
                ...prev[hamsterId],
                health: Math.max(0, (prev[hamsterId]?.health || 5) - 1)
            };

            // Add hit class to trigger animation
            const hamsterElement = document.getElementById(`hamster-${hamsterId}`);
            if (hamsterElement) {
                hamsterElement.classList.add('hit');
                setTimeout(() => hamsterElement.classList.remove('hit'), 200);
            }

            // If hamster is defeated
            if (updatedHamster.health <= 0) {
                const hamsterElement = document.getElementById(`hamster-${hamsterId}`);
                if (hamsterElement) {
                    hamsterElement.classList.add('hamster-defeated');
                }
            }

            return {
                ...prev,
                [hamsterId]: updatedHamster
            };
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
        mountedHamsters,
        mountHamster,
        shootLaser,
        handleHamsterHit,
        userId,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
} 