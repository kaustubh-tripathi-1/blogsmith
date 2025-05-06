export default function ProfileSkeleton() {
    return (
        <section className="py-8 px-4 bg-gray-100 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse-fast ">
                {/* Heading */}
                <div className="w-full h-20 bg-gray-300 dark:bg-gray-600 rounded-md mb-6"></div>
                {/* Details */}
                <div className="w-3/4 h-30 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                {/* Edit Button */}
                <div className="w-32 h-13 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            </div>
        </section>
    );
}
