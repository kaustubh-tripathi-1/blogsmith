import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { closeModal, addNotification } from "../../slices/uiSlice";
import { logoutUser, logout } from "../../slices/authSlice";
import { deletePostFromDB } from "../../slices/postsSlice";
import { deleteFile } from "../../slices/storageSlice";
import { Spinner } from "../componentsIndex";
import { removeUserPost } from "../../slices/userSlice";
import { SearchModalContent } from "../componentsIndex";

/**
 * Reusable Modal component for displaying confirmations or custom content.
 * @param {Object} props - Component props
 * @param {string} props.modalType - Type of modal (e.g., 'delete-post', 'logout')
 * @param {Object} [props.modalData] - Optional data for the modal (e.g., { slug })
 * @param {React.ReactNode} props.children - Custom content or form
 * @returns {React.ReactElement | null} Modal portal or null if not open
 */
function Modal({ modalType, modalData, children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isModalOpen } = useSelector((state) => state.ui);
    const { preferences } = useSelector((state) => state.user);
    const { loading: postsLoading } = useSelector((state) => state.posts);
    const { deleting: storageDeleting } = useSelector((state) => state.storage);
    const { loading: authLoading } = useSelector((state) => state.auth);
    const [isClosing, setIsClosing] = useState(false);

    const modalRef = useRef(null);
    const firstFocusableRef = useRef(null);
    const lastFocusableRef = useRef(null);
    const triggerRef = useRef(null);
    const scrollPositionRef = useRef(0);

    // Handle close with animation
    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            dispatch(closeModal());
        }, 300);
    }, [dispatch]);

    // Prevent click propagation on modal content
    const handleContentClick = useCallback((event) => {
        event.stopPropagation();
    }, []);

    // Focus trapping and accessibility and Close modal on Escape key
    useEffect(() => {
        if (!isModalOpen) return;

        // Store the trigger element
        triggerRef.current = document.activeElement;

        // Prevent background scrolling
        scrollPositionRef.current = window.scrollY;
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollPositionRef.current}px`;

        const modal = modalRef.current;

        // Function to update focusable elements
        const updateFocusableElements = () => {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable =
                focusableElements[focusableElements.length - 1];

            firstFocusableRef.current = firstFocusable;
            lastFocusableRef.current = lastFocusable;

            // Set initial focus to the first focusable element (e.g., input in SearchModalContent)
            firstFocusable?.focus();
        };

        // Initial setup of focusable elements
        updateFocusableElements();

        // Handle Tab and Shift+Tab
        const handleKeyDown = (event) => {
            if (event.key === "Tab") {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstFocusable = focusableElements[0];
                const lastFocusable =
                    focusableElements[focusableElements.length - 1];

                if (focusableElements.length === 0) return;

                if (
                    event.shiftKey &&
                    document.activeElement === firstFocusable
                ) {
                    event.preventDefault();
                    lastFocusable.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === lastFocusable
                ) {
                    event.preventDefault();
                    firstFocusable.focus();
                }
            } else if (
                event.key === "Escape" &&
                !postsLoading &&
                !storageDeleting &&
                !authLoading
            ) {
                handleClose();
            }
        };

        modal.addEventListener("keydown", handleKeyDown);

        // Hide background content
        const mainContent = document.querySelector("main") || document.body;
        mainContent.setAttribute("aria-hidden", "true");
        mainContent.setAttribute("inert", "");

        // Observe changes to the modal content to update focusable elements
        const observer = new MutationObserver(() => {
            updateFocusableElements();
        });

        observer.observe(modal, { childList: true, subtree: true });

        return () => {
            // Restore background scrolling
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.top = "";
            window.scrollTo(0, scrollPositionRef.current);

            modal.removeEventListener("keydown", handleKeyDown);
            mainContent.removeAttribute("aria-hidden");
            mainContent.removeAttribute("inert");
            observer.disconnect();
            // Restore focus
            if (triggerRef.current) {
                triggerRef.current?.focus();
            }
        };
    }, [
        isModalOpen,
        handleClose,
        postsLoading,
        storageDeleting,
        authLoading,
        modalType,
        children,
    ]);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            dispatch(logout());
            if (preferences?.notifications) {
                dispatch(
                    addNotification({
                        message: "Logged out successfully",
                        type: "success",
                    })
                );
            }

            navigate("/login");
            handleClose();
        } catch (error) {
            console.error("Logout failed:", error);
            if (preferences?.notifications) {
                dispatch(
                    addNotification({
                        message: error || "Logout failed",
                        type: "error",
                    })
                );
            }
            handleClose();
        }
    }, [dispatch, navigate, handleClose, preferences?.notifications]);

    // Handle post deletion
    const handleDeletePost = useCallback(async () => {
        try {
            await dispatch(deletePostFromDB(modalData.postID)).unwrap();
            if (modalData.featureImage) {
                await dispatch(deleteFile(modalData.featureImage)).unwrap();
            }

            // Remove the post from userPosts if we're in the /profile route
            dispatch(removeUserPost(modalData.postID));

            if (preferences?.notifications) {
                dispatch(
                    addNotification({
                        message: "Post deleted successfully",
                        type: "success",
                    })
                );
            }
            if (modalData.shouldNavigate) {
                navigate(`/`);
            }
            handleClose();
        } catch (error) {
            console.error("Delete Post failed:", error);
            if (preferences?.notifications) {
                dispatch(
                    addNotification({
                        message: error || "Delete failed",
                        type: "error",
                    })
                );
            }
            handleClose();
        }
    }, [
        dispatch,
        modalData,
        navigate,
        handleClose,
        preferences?.notifications,
    ]);

    // Modal configurations based on type
    const modalConfigs = {
        "delete-post": {
            title: "Delete Post",
            message:
                "Are you sure you want to delete this post? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            confirmAction: handleDeletePost,
            isLoading: postsLoading || storageDeleting,
        },
        logout: {
            title: "Confirm Logout",
            message: "Are you sure you want to log out?",
            confirmText: 'Yes, "I\'m sure"🙄 Log Out',
            cancelText: "Cancel",
            confirmAction: handleLogout,
            isLoading: authLoading,
        },
        search: {
            title: "Search Posts",
            message: <SearchModalContent />,
            confirmText: null,
            cancelText: "Close (esc)",
            confirmAction: null,
            isLoading: false,
        },
    };

    const config = modalConfigs[modalType] || {
        title: "Modal",
        message: children || "No content provided.",
        confirmText: "Confirm",
        cancelText: "Cancel",
        confirmAction: handleClose,
        isLoading: false,
    };

    if (!isModalOpen) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                isClosing
                    ? "opacity-0 animate-fade-out"
                    : "opacity-100 animate-fade-in"
            }`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`relative mx-4 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-2xl transition-transform duration-300 sm:max-w-lg ${
                    isClosing ? "scale-95" : "scale-100"
                }`}
                onClick={handleContentClick}
                ref={modalRef}
            >
                {modalType === "search" && (
                    <p className="hidden absolute top-5.5 right-4 text-gray-900 dark:text-gray-300 rounded-md md:flex justify-center items-center px-2 py-1 gap-1">
                        <span className="bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-300 shadow-2xl rounded-sm px-1 pb-0.5">
                            esc
                        </span>
                        to close
                    </p>
                )}

                <h2
                    id="modal-title"
                    className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
                >
                    {config.title}
                </h2>
                <div className="mb-6 text-gray-700 dark:text-gray-200 prose dark:prose-invert">
                    {children || config.message}
                </div>
                {modalType !== "search" && (
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-gray-600"
                            onClick={handleClose}
                            disabled={config.isLoading}
                        >
                            {config.cancelText}
                        </button>
                        {config.confirmText && (
                            <button
                                type="button"
                                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-700 cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-red-600"
                                onClick={config.confirmAction}
                                disabled={config.isLoading}
                            >
                                {config.isLoading ? (
                                    <div className="flex justify-center items-center">
                                        {modalType === "delete-post"
                                            ? "Deleting..."
                                            : "Logging out..."}
                                        <Spinner size="1" className="ml-2" />
                                    </div>
                                ) : (
                                    config.confirmText
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

export default memo(Modal);
