import { useCallback, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router";
import { setTheme, openModal } from "../../slices/uiSlice";
import { updatePreferences } from "../../slices/userSlice";
import darkModeIcon from "../../assets/night-mode.png";
import lightModeIcon from "../../assets/light.png";
import blogSmithLogoDark from "../../assets/BlogSmith-Logo-6-16-9-dark.png";
import blogSmithLogoLight from "../../assets/BlogSmith-Logo-6-light-16-9.png";
import { useDebounce } from "../../hooks/useDebounce";

export default function Header() {
    const dispatch = useDispatch();
    const { authStatus, userData } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.ui);
    const { preferences } = useSelector((state) => state.user);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: "Home", slug: "/", active: true },
        { name: "About", slug: "/about", active: true },
        { name: "Contact", slug: "/contact", active: true },
        { name: "Login", slug: "/login", active: !authStatus },
        { name: "Signup", slug: "/signup", active: !authStatus },
        { name: "Create Post", slug: "/create-post", active: authStatus },
        {
            name: userData?.name || userData?.email || "Profile",
            slug: `/profile/${userData?.$id}`,
            active: authStatus,
        },
    ];

    // Ctrl+K shortcut for search modal
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === "k") {
                event.preventDefault();
                openSearchModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Open logout modal
    function openLogoutModal() {
        setIsMobileMenuOpen(false); // Close mobile menu on logout
        dispatch(openModal({ type: "logout", data: null }));
    }

    // Open search modal
    function openSearchModal() {
        setIsMobileMenuOpen(false);
        dispatch(openModal({ type: "search", data: null }));
    }

    function toggleMobileMenu() {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    /**
     * Executes a callback function only after a delay. Multiple call restarts the delay.
     * @param {function} callback - The callback function to execute when the timeout with delay expires
     * @param {number} delay - The delay after which the callback is to be executed
     * @returns {function} A debounced version of the callback
     */
    // function debounce(callback, delay) {
    //     let timeoutId;

    //     return function (...args) {
    //         if (timeoutId) {
    //             clearTimeout(timeoutId);
    //         }

    //         timeoutId = setTimeout(() => {
    //             callback.call(null, ...args);
    //         }, delay);
    //     };
    // }

    // Debounced updatePreferences
    const debouncedUpdatePreferences = useCallback(
        useDebounce((prefs) => {
            dispatch(updatePreferences(prefs));
        }, 2000),
        [dispatch]
    );

    function handleThemeToggle() {
        const newTheme = theme === "light" ? "dark" : "light";
        dispatch(setTheme(newTheme));
        if (authStatus) {
            debouncedUpdatePreferences({
                theme: newTheme,
                notifications: preferences.notifications || true,
            });
        }
    }

    return (
        <header className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-md">
            <div className="mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo/Title */}
                <NavLink to="/" className="text-2xl font-bold shrink-0">
                    <img
                        src={
                            theme === "dark"
                                ? blogSmithLogoDark
                                : blogSmithLogoLight
                        }
                        alt="blog-smith logo"
                        className="w-24"
                    />
                </NavLink>

                {/* Desktop Navigation (md and above) */}
                <nav
                    className="hidden md:flex md:items-center md:gap-2 lg:gap-4"
                    role="navigation"
                >
                    {navItems.map(
                        (item) =>
                            item.active && (
                                <NavLink
                                    key={item.name}
                                    to={item.slug}
                                    className={({ isActive }) =>
                                        `md:py-1.5 md:px-3 md:text-sm lg:py-1.5 lg:px-4 lg:text-base hover:underline focus:underline text-nowrap hover:decoration-white focus:decoration-white hover:text-white hover:bg-blue-800  rounded-full  focus:text-white focus:bg-blue-800 focus:outline-2 focus:outline-offset-2 focus:outline-blue-800 active:bg-blue-800  ${
                                            isActive
                                                ? "text-blue-500 dark:text-blue-400 font-semibold"
                                                : ""
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            )
                    )}
                    {authStatus && (
                        <button
                            onClick={openLogoutModal}
                            className="text-sm lg:text-base lg:px-3 bg-red-500 text-white hover:bg-red-700 focus:bg-red-600 focus:outline-2 focus:outline-offset-2 focus:outline-red-500 px-3 py-1.5 rounded-full cursor-pointer"
                        >
                            Logout
                        </button>
                    )}

                    {/* Search Icon (md breakpoint) */}
                    <button
                        onClick={openSearchModal}
                        className="md:block lg:hidden p-2 rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 focus:bg-blue-600 dark:focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                        aria-label="Open search modal"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </button>

                    {/* Search Bar with Text (lg breakpoint) */}
                    <button
                        onClick={openSearchModal}
                        className="hidden lg:flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                        aria-label="Open search modal"
                    >
                        <svg
                            className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Search
                        </span>
                        <div className="ml-2 flex items-center gap-1">
                            <span className="text-xs bg-gray-300 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                                Ctrl
                            </span>
                            <span className="text-xs bg-gray-300 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                                K
                            </span>
                        </div>
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={handleThemeToggle}
                        className="min-w-10 w-10 p-2 rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 focus:bg-blue-600 dark:focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? (
                            <img
                                src={darkModeIcon}
                                alt="dark-mode"
                                className="md:w-6 lg:w-8"
                            />
                        ) : (
                            <img
                                src={lightModeIcon}
                                alt="light-mode"
                                className="md:w-6 lg:w-8"
                            />
                        )}
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden focus:outline-none focus:ring-2 focus:ring-gray-500 rounded cursor-pointer"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={
                                isMobileMenuOpen
                                    ? "M6 18L18 6M6 6l12 12"
                                    : "M4 6h16M4 12h16m-7 6h7"
                            }
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <nav className="md:hidden bg-white dark:bg-gray-900 px-4 py-2">
                    {navItems.map(
                        (item) =>
                            item.active && (
                                <NavLink
                                    key={item.name}
                                    to={item.slug}
                                    className={({ isActive }) =>
                                        `block p-2 hover:underline focus:underline focus:outline-none active:bg-blue-600 active:text-white rounded-sm ${
                                            isActive
                                                ? "text-blue-500 dark:text-blue-400 font-semibold"
                                                : ""
                                        }`
                                    }
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </NavLink>
                            )
                    )}
                    {authStatus && (
                        <button
                            onClick={openLogoutModal}
                            className="block w-full text-left p-2  text-red-400 hover:text-red-500 focus:text-red-500 focus:outline-none focus:underline"
                        >
                            Logout
                        </button>
                    )}

                    {/* Search Icon with Text (Mobile Menu) */}
                    <button
                        onClick={openSearchModal}
                        className="w-full text-left p-2 hover:underline focus:underline focus:outline-none cursor-pointer flex items-center gap-2"
                        aria-label="Open search modal"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <span>Search</span>
                    </button>

                    {/* Theme Toggle Button (Mobile) */}
                    <button
                        onClick={handleThemeToggle}
                        className="block w-full text-left py-2 hover:underline focus:underline focus:outline-none px-2 cursor-pointer"
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? (
                            <div className="flex gap-2">
                                <p>Dark Mode</p>{" "}
                                <img
                                    src={darkModeIcon}
                                    alt="dark-mode"
                                    className="w-6 md:w-6 lg:w-8"
                                />
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <p>Light Mode</p>{" "}
                                <img
                                    src={lightModeIcon}
                                    alt="dark-mode"
                                    className="w-6 md:w-6 lg:w-8"
                                />
                            </div>
                        )}
                    </button>
                </nav>
            )}
        </header>
    );
}
