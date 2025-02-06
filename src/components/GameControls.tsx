import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

interface GameControlsProps {
    mountedHamsterId: string | null;
    disabled?: boolean;
}

const GameControls = ({ mountedHamsterId, disabled }: GameControlsProps) => {
    console.log('GameControls rendering with hamsterId:', mountedHamsterId);

    const { shootLaser } = useGame();
    const [angle, setAngle] = useState(0);
    const [isShooting, setIsShooting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const joystickRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

    const updateJoystickPosition = (clientX: number, clientY: number) => {
        if (!joystickRef.current) return;

        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate relative position from center of joystick
        const dx = clientX - rect.left - centerX;
        const dy = clientY - rect.top - centerY;

        // Calculate angle and distance
        const newAngle = Math.atan2(dy, dx);
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), rect.width / 3);

        // Calculate final position
        const x = Math.cos(newAngle) * distance;
        const y = Math.sin(newAngle) * distance;

        setJoystickPos({ x, y });
        setAngle(newAngle); // Store the angle for shooting
    };

    const handleJoystickMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        updateJoystickPosition(clientX, clientY);
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        updateJoystickPosition(clientX, clientY);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleMouseUp);
        document.addEventListener('mouseleave', handleMouseUp);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseUp);
        };
    }, []);

    const handleShoot = () => {
        if (!mountedHamsterId || disabled) {
            console.log('No mounted hamster ID or disabled');
            return;
        }

        setIsShooting(true);
        const velocity = 10;
        const velocityX = Math.cos(angle) * velocity;
        const velocityY = Math.sin(angle) * velocity;
        
        // Dispatch the event with the correct detail structure
        const shootEvent = new CustomEvent('shoot-laser', {
            detail: {
                mountedHamsterId,  // Make sure this matches what handleShootLaser expects
                velocityX,
                velocityY
            }
        });
        window.dispatchEvent(shootEvent);
        
        setTimeout(() => setIsShooting(false), 300);
    };

    return (
        <div className="game-controls flex items-center justify-between p-4 bg-gray-900 rounded-lg mt-4 border-2 border-red-500">
            <div className="text-white font-bold">DEBUG: Controls visible</div>
            <div 
                ref={joystickRef}
                className="joystick-base w-24 h-24 bg-gray-800 rounded-full relative cursor-pointer"
                onMouseDown={handleMouseDown}
                onMouseMove={handleJoystickMove}
                onTouchStart={handleMouseDown}
                onTouchMove={handleJoystickMove}
            >
                <div 
                    ref={knobRef}
                    className="joystick-knob w-12 h-12 bg-blue-500 rounded-full absolute top-1/2 left-1/2"
                    style={{
                        transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
                    }}
                />
            </div>

            <button
                onClick={handleShoot}
                disabled={!mountedHamsterId || isShooting || disabled}
                className={`fire-button w-20 h-20 rounded-full ${
                    isShooting || disabled
                        ? 'bg-red-700 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600'
                } transition-colors duration-200`}
            >
                🔥
            </button>
        </div>
    );
};

export default GameControls; 