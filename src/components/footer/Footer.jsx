import { useSelector } from "react-redux";
import { NavLink } from "react-router";

export default function Footer() {
    const { authStatus } = useSelector((state) => state.auth);
    const { profile } = useSelector((state) => state.user);

    return (
        <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-6">
            <div className="mx-auto px-4 text-center">
                <p className="text-sm md:text-base">
                    Copyright © {new Date().getFullYear()} BlogSmith. All rights
                    reserved.
                </p>
                <div className="mt-4 grid grid-cols-2 md:flex md:flex-row justify-center md:space-x-6">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `hover:underline focus:underline focus:outline-none hover:text-blue-500 dark:hover:text-blue-400 focus:text-blue-500 dark:focus:text-blue-400 ${
                                isActive
                                    ? `text-blue-500 dark:text-blue-400 font-semibold`
                                    : ``
                            }`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `hover:underline focus:underline focus:outline-none hover:text-blue-500 dark:hover:text-blue-400 focus:text-blue-500 dark:focus:text-blue-400 ${
                                isActive
                                    ? `text-blue-500 dark:text-blue-400 font-semibold`
                                    : ``
                            }`
                        }
                    >
                        About
                    </NavLink>
                    <NavLink
                        to="/contact"
                        className={({ isActive }) =>
                            `hover:underline focus:underline focus:outline-none hover:text-blue-500 dark:hover:text-blue-400 focus:text-blue-500 dark:focus:text-blue-400 ${
                                isActive
                                    ? `text-blue-500 dark:text-blue-400 font-semibold`
                                    : ``
                            }`
                        }
                    >
                        Contact
                    </NavLink>
                    {authStatus && (
                        <NavLink
                            to={`/profile/${profile?.$id}`}
                            className={({ isActive }) =>
                                `hover:underline focus:underline focus:outline-none hover:text-blue-500 dark:hover:text-blue-400 focus:text-blue-500 dark:focus:text-blue-400 ${
                                    isActive
                                        ? `text-blue-500 dark:text-blue-400 font-semibold`
                                        : ``
                                }`
                            }
                        >
                            Profile
                        </NavLink>
                    )}
                    <a
                        href="https://twitter.com/07_kaustubh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline focus:underline focus:outline-none hover:text-blue-500 dark:hover:text-blue-400 focus:text-blue-500 dark:focus:text-blue-400"
                    >
                        Twitter
                    </a>
                    <a
                        href="https://github.com/kaustubh-tripathi-1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline focus:underline focus:outline-none hover:text-blue-500 dark:hover:text-blue-400 focus:text-blue-500 dark:focus:text-blue-400"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}
