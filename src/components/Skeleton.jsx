import React from 'react';

const Skeleton = ({ className, width, height, circle = false }) => {
    const style = {
        width: width || '100%',
        height: height || '20px',
        borderRadius: circle ? '50%' : '8px'
    };

    return (
        <div 
            className={`bg-gray-200 dark:bg-gray-800 animate-pulse-shimmer relative overflow-hidden ${className}`}
            style={style}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
        </div>
    );
};

export const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex justify-between items-center text-center">
            <div className="space-y-2">
                <Skeleton width="100px" height="12px" />
                <Skeleton width="150px" height="32px" />
            </div>
            <Skeleton width="48px" height="48px" circle />
        </div>
        <div className="pt-4 flex gap-2">
            <Skeleton width="40%" height="32px" />
            <Skeleton width="30%" height="32px" />
        </div>
    </div>
);

export const SkeletonList = ({ items = 3 }) => (
    <div className="space-y-4">
        {Array(items).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
                <Skeleton width="40px" height="40px" circle />
                <div className="flex-1 space-y-2">
                    <Skeleton width="70%" height="16px" />
                    <Skeleton width="40%" height="12px" />
                </div>
                <Skeleton width="60px" height="32px" />
            </div>
        ))}
    </div>
);

export default Skeleton;
