
import React from 'react';
import Skeleton from './Skeleton';

const TableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                <Skeleton className="h-6 w-48" />
            </div>

            <div className="p-6 space-y-4">
                {}
                <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 gap-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>

                {}
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="w-1/4 flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <div className="w-1/4 flex justify-end">
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;
