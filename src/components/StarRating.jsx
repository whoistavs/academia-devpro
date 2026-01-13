import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false, size = "w-5 h-5" }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hover || rating);
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !readOnly && setRating(star)}
                        onMouseEnter={() => !readOnly && setHover(star)}
                        onMouseLeave={() => !readOnly && setHover(rating)}
                        className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-150`}
                        disabled={readOnly}
                    >
                        <Star
                            className={`${size} ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
