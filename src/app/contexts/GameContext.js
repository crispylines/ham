import React, { createContext, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [rooms, setRooms] = useState({}); // RoomId: { name, lobbies: { lobbyId: { hamsters: [], status: 'waiting' or 'racing' or 'finished' } } }
    const [currentLobby, setCurrentLobby] = useState(null); // { roomId, lobbyId }
    const [hamsters, setHamsters] = useState({}); // hamsterId: { description, image, userId, lobbyId, roomId, speed, position } (position in race)
    const [raceResults, setRaceResults] = useState(null); // Array of hamsterIds in winning order

    const createRoom = (roomName) => {
        const roomId = uuidv4();
        setRooms(prevRooms => ({
            ...prevRooms,
            [roomId]: { name: roomName, lobbies: {} }
        }));
        return roomId;
    };

    const createLobby = (roomId) => {
        const lobbyId = uuidv4();
        setRooms(prevRooms => {
            const updatedRooms = { ...prevRooms };
            updatedRooms[roomId].lobbies[lobbyId] = { hamsters: [], status: 'waiting' };
            return updatedRooms;
        });
        return lobbyId;
    };

    const joinLobby = (roomId, lobbyId) => {
        setCurrentLobby({ roomId, lobbyId });
    };

    const addHamsterToLobby = (roomId, lobbyId, hamsterDescription, userId) => {
        const hamsterId = uuidv4();
        // In a real app, you'd call your AI image API here and get the image URL
        const mockImage = `/images/hamster-${Math.ceil(Math.random() * 5)}.png`; // Mock image for now
        const newHamster = {
            id: hamsterId,
            description: hamsterDescription,
            image: mockImage, // Replace with AI generated image URL
            userId: userId, // You'd need to manage user IDs properly (authentication)
            lobbyId: lobbyId,
            roomId: roomId,
            speed: 0, // Speed will be set when the race starts
            position: 0, // Position in the race
        };

        setHamsters(prevHamsters => ({
            ...prevHamsters,
            [hamsterId]: newHamster,
        }));

        setRooms(prevRooms => {
            const updatedRooms = { ...prevRooms };
            updatedRooms[roomId].lobbies[lobbyId].hamsters.push(hamsterId);
            return updatedRooms;
        });
    };

    const startRace = (roomId, lobbyId) => {
        setRooms(prevRooms => {
            const updatedRooms = { ...prevRooms };
            updatedRooms[roomId].lobbies[lobbyId].status = 'racing';
            return updatedRooms;
        });

        // Simulate setting speeds and positions for hamsters (in real app, this would be more complex)
        setHamsters(prevHamsters => {
            const updatedHamsters = { ...prevHamsters };
            const lobbyHamsterIds = rooms[roomId].lobbies[lobbyId].hamsters;
            lobbyHamsterIds.forEach(hamsterId => {
                updatedHamsters[hamsterId].speed = Math.random() * 5 + 2; // Random speed
                updatedHamsters[hamsterId].position = 0; // Reset position
            });
            return updatedHamsters;
        });
    };

    const finishRace = (roomId, lobbyId, results) => {
        setRooms(prevRooms => {
            const updatedRooms = { ...prevRooms };
            updatedRooms[roomId].lobbies[lobbyId].status = 'finished';
            return updatedRooms;
        });
        setRaceResults(results); // Array of hamster IDs in order of finish
    };


    const value = {
        rooms,
        createRoom,
        createLobby,
        joinLobby,
        currentLobby,
        addHamsterToLobby,
        hamsters,
        startRace,
        raceResults,
        finishRace,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    return useContext(GameContext);
};