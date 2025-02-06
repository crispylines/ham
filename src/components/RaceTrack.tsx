'use client';

import React, { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';

interface RaceTrackProps {
    roomId: string;
    lobbyId: string;
}

const RaceTrack = ({ roomId, lobbyId }: RaceTrackProps) => {
    const { hamsters, rooms, finishRace, raceResults } = useGame();
    const trackRef = useRef<HTMLDivElement>(null);
    const finishedHamstersRef = useRef<string[]>([]);  // Use ref to maintain state between renders

    useEffect(() => {
        console.log('Race Track Component State:', {
            lobbyStatus: rooms[roomId]?.lobbies[lobbyId]?.status,
            raceResults,
            hasHamsters: !!hamsters,
            roomExists: !!rooms[roomId],
            lobbyExists: !!rooms[roomId]?.lobbies[lobbyId]
        });
    }, [roomId, lobbyId, hamsters, rooms, raceResults]);

    useEffect(() => {
        if (!rooms[roomId] || !rooms[roomId].lobbies[lobbyId] || rooms[roomId].lobbies[lobbyId].status !== 'racing') {
            return;
        }

        const lobbyHamsterIds = rooms[roomId].lobbies[lobbyId].hamsters;
        let animationFrameId: number;

        const animationFrame = () => {
            if (!trackRef.current) return;

            const trackWidth = trackRef.current.offsetWidth;
            const newFinished: string[] = [];

            lobbyHamsterIds.forEach((hamsterId: string) => {
                const hamsterElement = document.getElementById(`hamster-${hamsterId}`);
                if (!hamsterElement) return;

                const currentPosition = hamsters[hamsterId].position;
                const newPosition = currentPosition + hamsters[hamsterId].speed * 0.04;
                hamsters[hamsterId].position = newPosition;
                hamsterElement.style.left = `${Math.min(newPosition, trackWidth - 30)}px`;

                if (newPosition >= trackWidth - 30) {
                    if (!finishedHamstersRef.current.includes(hamsterId)) {
                        newFinished.push(hamsterId);
                    }
                }
            });

            // Update finished hamsters
            if (newFinished.length > 0) {
                finishedHamstersRef.current = [...finishedHamstersRef.current, ...newFinished];
            }

            if (finishedHamstersRef.current.length < lobbyHamsterIds.length) {
                animationFrameId = requestAnimationFrame(animationFrame);
            } else {
                // Race is finished
                console.log('Race finished, setting results:', finishedHamstersRef.current);
                finishRace(roomId, lobbyId, finishedHamstersRef.current);
                cancelAnimationFrame(animationFrameId);
            }
        };

        animationFrameId = requestAnimationFrame(animationFrame);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            finishedHamstersRef.current = [];
            console.log('RaceTrack component unmounting');
        };
    }, [roomId, lobbyId, hamsters, rooms, finishRace]); // Added finishRace to dependencies

    // Show loading state if no room/lobby data
    if (!rooms[roomId]?.lobbies[lobbyId]) {
        return <div>Loading...</div>;
    }

    const lobby = rooms[roomId].lobbies[lobbyId];
    const lobbyHamsterIds = lobby.hamsters;

    // Show race results if race is finished
    if (lobby.status === 'finished' && raceResults) {
        console.log('Rendering race results:', { raceResults, lobbyStatus: lobby.status });
        return (
            <div className="race-track-container h-96 relative mb-8">
                <h3 className="text-2xl font-bold mb-6 text-center">
                    🏆 Race Results! 🏆
                </h3>
                <div className="race-results rounded-lg p-6 max-w-2xl mx-auto">
                    <div className="space-y-4">
                        {raceResults.map((hamsterId, index) => (
                            <div 
                                key={hamsterId}
                                className={`race-result-item flex items-center space-x-4 p-4 ${
                                    index === 0 ? 'bg-yellow-500/20' : 
                                    index === 1 ? 'bg-gray-400/20' : 
                                    index === 2 ? 'bg-amber-700/20' : 'bg-gray-700/10'
                                } rounded-lg`}
                            >
                                <span className="text-3xl">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}th`}
                                </span>
                                <div className="flex items-center space-x-4 flex-1">
                                    <img 
                                        src={hamsters[hamsterId].image} 
                                        alt={hamsters[hamsterId].description}
                                        className="w-12 h-12 object-contain"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-lg">
                                            {hamsters[hamsterId].description}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {index === 0 ? 'Winner!' : `Finished ${index + 1}${index === 1 ? 'st' : index === 2 ? 'nd' : index === 3 ? 'rd' : 'th'}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Show race track if race is in progress
    if (lobby.status === 'racing') {
        return (
            <div className="race-track-container h-96 relative mb-8">
                <h3 className="text-xl font-semibold mb-4">Race Track</h3>
                <div 
                    className="race-track relative h-80 bg-gray-800 rounded-lg overflow-hidden"
                    ref={trackRef}
                >
                    {lobbyHamsterIds.map((hamsterId: string, index: number) => (
                        <div
                            key={hamsterId}
                            id={`hamster-${hamsterId}`}
                            className="hamster-racer absolute transform -translate-y-1/2"
                            style={{ 
                                position: 'absolute', 
                                left: 0,
                                top: `${(index * 16) + 15}%`,
                                transform: 'translateY(-50%)'
                            }}
                        >
                            <img 
                                src={hamsters[hamsterId].image} 
                                alt={hamsters[hamsterId].description} 
                                width={30} 
                                height={30}
                                className="object-contain"
                            />
                        </div>
                    ))}
                    <div className="finish-line absolute right-0 top-0 h-full w-1 bg-yellow-400"></div>
                </div>
            </div>
        );
    }

    return <p>Waiting for race to start...</p>;
};

export default RaceTrack; 