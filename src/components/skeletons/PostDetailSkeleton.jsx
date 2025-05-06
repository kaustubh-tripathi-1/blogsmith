export default function PostDetailSkeleton() {
    return (
        <section className="min-h-screen py-8 px-4 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse-fast">
                {/* Feature Image */}
                <div className="w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-md mb-6"></div>
                {/* Title */}
                <div className="w-3/4 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                {/* Edit Button */}
                <div className="w-32 h-10 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                {/* Content */}
                <div className="space-y-4">
                    <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="w-5/6 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
            </div>
        </section>
    );
}
