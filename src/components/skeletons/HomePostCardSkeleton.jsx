export default function HomePostCardSkeleton() {
    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md animate-pulse-fast">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
    );
}
