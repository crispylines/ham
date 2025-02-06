import React from 'react';

const HamsterDisplay = ({ hamster }) => {
    return (
        <div className="hamster-display">
            <img src={hamster.image} alt={hamster.description} width={100} />
            <p>{hamster.description}</p>
            {/* You could add hamster "stats" or flavor text here based on description later */}
        </div>
    );
};

export default HamsterDisplay;