import React from 'react';

interface Hamster {
    id: string;
    image: string;
    description: string;
}

interface HamsterDisplayProps {
    hamster: Hamster;
    isGameMaster: boolean;
    onMount?: () => void;
    isMounted?: boolean;
}

const HamsterDisplay = ({ hamster, isGameMaster, onMount, isMounted }: HamsterDisplayProps) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 relative">
            <img 
                src={hamster.image} 
                alt={hamster.description} 
                className="w-24 h-24 object-contain mx-auto mb-2" 
            />
            <p className="text-sm text-gray-300">{hamster.description}</p>
            
            {isGameMaster && onMount && (
                <button
                    onClick={onMount}
                    disabled={isMounted}
                    className={`mt-2 w-full px-3 py-1 rounded ${
                        isMounted 
                            ? 'bg-green-600 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isMounted ? 'Mounted' : 'Mount Hamster'}
                </button>
            )}
        </div>
    );
};

export default HamsterDisplay;