'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import GameControls from '@/components/GameControls';

interface RaceTrackProps {
    roomId: string;
    lobbyId: string;
}

const RaceTrack = ({ roomId, lobbyId }: RaceTrackProps) => {
    const { hamsters, rooms, finishRace, raceResults, mountedHamsters, userId, handleHamsterHit } = useGame();
    const trackRef = useRef<HTMLDivElement>(null);
    const finishedHamstersRef = useRef<string[]>([]);  // Use ref to maintain state between renders
    const projectilesRef = useRef<Array<{
        id: string;
        x: number;
        y: number;
        angle: number;
        speed: number;
        fromHamsterId: string;
    }>>([]);
    const mountedHamsterId = mountedHamsters[userId];

    // At the top of the component, add a constant for max projectiles
    const MAX_PROJECTILES = 50; // Adjust this number as needed

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

    useEffect(() => {
        // Initialize hamster health when race starts
        if (rooms[roomId]?.lobbies[lobbyId]?.status === 'racing') {
            const lobbyHamsterIds = rooms[roomId].lobbies[lobbyId].hamsters;
            lobbyHamsterIds.forEach((hamsterId: string) => {
                if (!hamsters[hamsterId]?.health) {
                    handleHamsterHit(hamsterId); // This will set initial health to 5
                }
            });
        }
    }, [rooms, lobbyId, hamsters, handleHamsterHit]);

    const handleShootLaser = useCallback((event: CustomEvent) => {
        const { mountedHamsterId, velocityX, velocityY } = event.detail;
        console.log('Shoot laser event received:', { mountedHamsterId, velocityX, velocityY });
        
        // Get the shooter's position
        const hamsterElement = document.getElementById(`hamster-${mountedHamsterId}`);
        if (!hamsterElement || !trackRef.current) {
            console.log('Missing elements:', { hamsterElement, trackRef: trackRef.current });
            return;
        }

        const hamsterRect = hamsterElement.getBoundingClientRect();
        const trackRect = trackRef.current.getBoundingClientRect();

        // Calculate starting position relative to the track
        const startX = parseInt(hamsterElement.style.left) + 15; // Center of hamster (30px width / 2)
        const startY = parseInt(hamsterElement.style.top); // Use the actual top position

        const newProjectile = {
            id: Math.random().toString(),
            x: startX,
            y: startY,
            angle: Math.atan2(velocityY, velocityX),
            speed: 8, // Adjust speed as needed
            fromHamsterId: mountedHamsterId,
        };

        console.log('Creating new projectile:', newProjectile);
        projectilesRef.current = [...projectilesRef.current, newProjectile];
    }, []);

    useEffect(() => {
        window.addEventListener('shoot-laser', handleShootLaser as EventListener);
        return () => window.removeEventListener('shoot-laser', handleShootLaser as EventListener);
    }, [handleShootLaser]);

    useEffect(() => {
        let animationId: number;

        const updateLoop = () => {
            updateProjectiles();
            animationId = requestAnimationFrame(updateLoop);
        };

        animationId = requestAnimationFrame(updateLoop);

        return () => cancelAnimationFrame(animationId);
    }, []);

    const updateProjectiles = () => {
        if (!trackRef.current) return;
        
        const trackWidth = trackRef.current.offsetWidth;
        const trackHeight = trackRef.current.offsetHeight;
        
        projectilesRef.current = projectilesRef.current.filter(projectile => {
            // Update position using angle and speed
            projectile.x += Math.cos(projectile.angle) * projectile.speed;
            projectile.y += Math.sin(projectile.angle) * projectile.speed;

            // Log position for debugging
            console.log('Projectile updated:', { x: projectile.x, y: projectile.y });

            // Check if out of bounds
            if (projectile.x < -20 || projectile.x > trackWidth + 20 || 
                projectile.y < -20 || projectile.y > trackHeight + 20) {
                return false;
            }

            // Check collisions with hamsters
            const lobby = rooms[roomId]?.lobbies[lobbyId];
            if (!lobby) return true;
            
            let hasHit = false;
            
            lobby.hamsters.forEach((hamsterId: string) => {
                if (hasHit || hamsterId === projectile.fromHamsterId) return;
                
                const hamsterElement = document.getElementById(`hamster-${hamsterId}`);
                if (!hamsterElement) return;

                const hamsterRect = hamsterElement.getBoundingClientRect();
                const trackRect = trackRef.current!.getBoundingClientRect();
                
                // Simplified collision check using center points and radius
                const hamsterCenterX = hamsterRect.left - trackRect.left + hamsterRect.width / 2;
                const hamsterCenterY = hamsterRect.top - trackRect.top + hamsterRect.height / 2;
                
                const dx = projectile.x - hamsterCenterX;
                const dy = projectile.y - hamsterCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20) { // Collision radius
                    console.log('Hit detected:', hamsterId);
                    handleHamsterHit(hamsterId);
                    hasHit = true;
                    
                    // Add hit effect
                    createHitEffect(projectile.x, projectile.y);
                }
            });

            return !hasHit;
        });
    };

    const createHitEffect = (x: number, y: number) => {
        const trackElement = trackRef.current;
        if (!trackElement) return;

        // Create explosion particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            // Random angle for each particle
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 20;
            
            // Calculate transform values
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                background: white;
                --tx: ${tx}px;
                --ty: ${ty}px;
                animation: explode 0.3s ease-out forwards;
            `;
            
            trackElement.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => particle.remove(), 300);
        }
    };

    // Show loading state if no room/lobby data
    if (!rooms[roomId]?.lobbies[lobbyId]) {
        return <div>Loading...</div>;
    }

    const lobby = rooms[roomId].lobbies[lobbyId];
    const lobbyHamsterIds = lobby.hamsters;

    console.log('Race status:', lobby?.status);

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
        console.log('Mounted hamster:', { mountedHamsterId, userId, mountedHamsters });
        return (
            <div className="race-track-container h-96 relative mb-8">
                <div className="bg-red-500 p-2">Debug: Race is in progress</div>
                <h3 className="text-xl font-semibold mb-4">Race Track</h3>
                <div 
                    ref={trackRef}
                    className="race-track relative h-80 bg-gray-800 rounded-lg overflow-hidden"
                >
                    {/* Debug info */}
                    <div className="absolute top-2 left-2 text-xs text-white z-50 space-y-1">
                        <div>Projectiles: {projectilesRef.current.length}</div>
                        <div>Track size: {trackRef.current?.offsetWidth}x{trackRef.current?.offsetHeight}</div>
                    </div>

                    {/* Render projectiles */}
                    {projectilesRef.current.map(projectile => (
                        <div
                            key={`projectile-${projectile.id}`}
                            className="absolute w-2 h-2 bg-white rounded-full z-40 energy-ball"
                            style={{
                                left: `${projectile.x}px`,
                                top: `${projectile.y}px`,
                                transform: 'translate(-50%, -50%)',
                                boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)',
                            }}
                        />
                    ))}

                    {/* Rest of your existing racing view */}
                    {lobbyHamsterIds.map((hamsterId: string, index: number) => (
                        <div
                            key={hamsterId}
                            id={`hamster-${hamsterId}`}
                            className={`hamster-racer absolute transform -translate-y-1/2 ${
                                mountedHamsterId === hamsterId ? 'mounted-hamster' : ''
                            }`}
                            style={{ 
                                position: 'absolute', 
                                left: 0,
                                top: `${(index * 16) + 15}%`,
                                transform: 'translateY(-50%)'
                            }}
                        >
                            <div className="health-bar w-12 h-1 bg-gray-700 rounded absolute -top-2 left-1/2 -translate-x-1/2">
                                <div 
                                    className="h-full bg-green-500 rounded transition-all duration-200"
                                    style={{ width: `${(hamsters[hamsterId].health / 5) * 100}%` }}
                                />
                            </div>
                            <img 
                                src={hamsters[hamsterId].image} 
                                alt={hamsters[hamsterId].description} 
                                width={30} 
                                height={30}
                                className={`object-contain ${hamsters[hamsterId].health <= 0 ? 'hamster-defeated' : ''}`}
                            />
                        </div>
                    ))}
                    <div className="finish-line absolute right-0 top-0 h-full w-1 bg-yellow-400"></div>
                </div>
                {mountedHamsterId && (
                    <GameControls 
                        mountedHamsterId={mountedHamsterId}
                        disabled={hamsters[mountedHamsterId]?.health <= 0}
                    />
                )}
            </div>
        );
    }

    return <p>Waiting for race to start...</p>;
};

export default RaceTrack; 