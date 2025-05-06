import { memo } from "react";
import { NavLink } from "react-router";

function PostCard({ to, title, onClick }) {
    function handleClick(e) {
        if (onClick) {
            onClick(e);
        }
    }

    return (
        <NavLink
            to={to}
            tabIndex={0}
            className="block focus:outline-1 focus:outline-blue-500 focus:outline-offset-2 no-underline animate-fade-in"
            onClick={handleClick}
        >
            <div className="min-h-30 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg dark:shadow-cyan-800/50 transition-all duration-300">
                <h2 className="h-15 text-xl font-semibold mt-0 mb-4 hover:text-blue-300 dark:hover:text-blue-300">
                    {title}
                </h2>
                <span className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none">
                    Read More
                </span>
            </div>
        </NavLink>
    );
}
export default memo(PostCard);
