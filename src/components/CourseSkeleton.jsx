
import React from 'react';
import Skeleton from './Skeleton';

const CourseSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full">
            {}
            <div className="relative h-48 w-full">
                <Skeleton className="h-full w-full" />
            </div>

            <div className="p-6 flex flex-col flex-grow space-y-4">
                {}
                <Skeleton className="h-6 w-3/4" />

                {}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>

                {}
                <div className="flex items-center space-x-4 pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {}
                <div className="pt-4 mt-auto">
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default CourseSkeleton;
