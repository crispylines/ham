import React from 'react';

interface Hamster {
    id: string;
    image: string;
    description: string;
}

const HamsterDisplay = ({ hamster }: { hamster: Hamster }) => {
    return (
        <div className="hamster-display">
            <img src={hamster.image} alt={hamster.description} width={100} />
            <p>{hamster.description}</p>
            {/* You could add hamster "stats" or flavor text here based on description later */}
        </div>
    );
};

export default HamsterDisplay;