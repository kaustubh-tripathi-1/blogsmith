import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeNotification } from "../../slices/uiSlice";

/**
 * Notifications component to display toast-like alerts.
 * @returns {React.ReactElement} Notifications container
 */
export default function Notifications() {
    const dispatch = useDispatch();
    const { notifications } = useSelector((state) => state.ui);
    const [exitingIds, setExitingIds] = useState([]);

    // Auto-dismiss notifications
    useEffect(() => {
        const timers = notifications.map((notification) => {
            const timer = setTimeout(() => {
                // Trigger exit animation
                setExitingIds((prev) => [...prev, notification.id]);

                // Then remove from Redux store AFTER animation duration
                setTimeout(() => {
                    dispatch(removeNotification(notification.id));
                    setExitingIds((prev) =>
                        prev.filter((id) => id !== notification.id)
                    );
                }, 300);
            }, notification.timeout);

            return () => clearTimeout(timer);
        });

        return () => timers.forEach((clear) => clear());
    }, [notifications, dispatch]);

    if (!notifications.length) return null;

    return (
        <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 w-full max-w-xs sm:max-w-sm">
            {notifications.length &&
                notifications.map((notification) => {
                    const isExiting = exitingIds.includes(notification.id);

                    return (
                        <div
                            key={notification.id}
                            className={`rounded-lg p-4 shadow-md transition-all duration-300 ${
                                isExiting
                                    ? "animate-slide-out"
                                    : "animate-slide-in"
                            } ${
                                notification.type === "success"
                                    ? "bg-green-500 text-white"
                                    : notification.type === "error"
                                    ? "bg-red-500 text-white"
                                    : "bg-blue-500 text-white"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    {notification.message}
                                </p>
                                <button
                                    type="button"
                                    className="ml-2 text-white hover:text-gray-200 cursor-pointer"
                                    onClick={() => {
                                        setExitingIds((prev) => [
                                            ...prev,
                                            notification.id,
                                        ]);
                                        setTimeout(() => {
                                            dispatch(
                                                removeNotification(
                                                    notification.id
                                                )
                                            );
                                            setExitingIds((prev) =>
                                                prev.filter(
                                                    (id) =>
                                                        id !== notification.id
                                                )
                                            );
                                        }, 300);
                                    }}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
