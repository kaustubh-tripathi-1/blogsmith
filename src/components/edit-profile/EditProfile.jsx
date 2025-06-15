import { useEffect, useState, startTransition } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { useOptimistic } from "react";
import {
    fetchProfile,
    updateName,
    updateEmail,
    updatePassword,
    setError,
    updatePreferences,
} from "../../slices/userSlice";
import { addNotification } from "../../slices/uiSlice";
import { Spinner } from "../componentsIndex";

/**
 * EditProfile component for updating user details and preferences..
 * @returns {React.ReactElement} Form for editing user profile
 */
export default function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userID } = useParams();
    const { profile, preferences, loading, error } = useSelector(
        (state) => state.user
    );
    const { theme } = useSelector((state) => state.ui);

    // Optimistic state for profile updates
    const [optimisticProfile, setOptimisticProfile] = useOptimistic(profile);

    // States for password visiblity toggle
    const [isCurrentPasswordShowing, setIsCurrentPasswordShowing] =
        useState(false);
    const [isNewPasswordShowing, setIsNewPasswordShowing] = useState(false);
    const [isConfirmPasswordShowing, setIsConfirmPasswordShowing] =
        useState(false);

    // Form setup with react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            name: profile?.name || "",
            email: profile?.email || "",
            notifications: preferences?.notifications || false,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Watch newPassword for confirmation validation
    const newPassword = watch("newPassword");

    // Watch notification preference checkbox
    const notifications = watch("notifications");

    // Fetch profile on mount
    useEffect(() => {
        if (userID && (!profile || profile.$id !== userID)) {
            dispatch(fetchProfile());
        }
    }, [dispatch, userID, profile]);

    // Update form defaults when profile or preferences change
    useEffect(() => {
        if (profile && preferences) {
            reset({
                name: profile.name,
                email: profile.email,
                notifications: preferences?.notifications,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            startTransition(() => {
                setOptimisticProfile(profile);
            });
        }
    }, [profile, preferences, reset]);

    // Handlers to toggle password visibility
    function toggleCurrentPasswordVisibility() {
        setIsCurrentPasswordShowing(
            (prevIsCurrentPasswordShowing) => !prevIsCurrentPasswordShowing
        );
    }
    function toggleNewPasswordVisibility() {
        setIsNewPasswordShowing(
            (prevIsNewPasswordShowing) => !prevIsNewPasswordShowing
        );
    }
    function toggleConfirmPasswordVisibility() {
        setIsConfirmPasswordShowing(
            (prevIsConfirmPasswordShowing) => !prevIsConfirmPasswordShowing
        );
    }

    // Handle form submission
    async function updateProfileOnSubmit(data) {
        try {
            // Name update
            if (data.name !== profile?.name) {
                startTransition(() => {
                    setOptimisticProfile({
                        ...optimisticProfile,
                        name: data.name,
                    });
                });
                await dispatch(updateName(data.name)).unwrap();
                if (preferences?.notifications) {
                    dispatch(
                        addNotification({
                            message: "Name updated successfully",
                            type: "success",
                        })
                    );
                }
            }

            // Email update
            if (data.email !== profile?.email && data.currentPassword) {
                startTransition(() => {
                    setOptimisticProfile({
                        ...optimisticProfile,
                        email: data.email,
                    });
                });
                await dispatch(
                    updateEmail({
                        emailToUpdate: data.email,
                        currentPassword: data.currentPassword,
                    })
                ).unwrap();
                if (preferences?.notifications) {
                    dispatch(
                        addNotification({
                            message: "Email updated successfully",
                            type: "success",
                        })
                    );
                }
            }

            // Password update
            if (data.newPassword && data.newPassword && data.currentPassword) {
                await dispatch(
                    updatePassword({
                        newPassword: data.newPassword,
                        currentPassword: data.currentPassword,
                    })
                ).unwrap();
                if (preferences?.notifications) {
                    dispatch(
                        addNotification({
                            message: "Password updated successfully",
                            type: "success",
                        })
                    );
                }
            }

            // Notification Preference update
            if (data.notifications !== preferences?.notifications) {
                const userPrefs = await dispatch(
                    updatePreferences({
                        theme: theme || preferences.theme || "light", // Preserve existing theme
                        notifications: data.notifications,
                    })
                ).unwrap();
                if (userPrefs?.notifications) {
                    dispatch(
                        addNotification({
                            message: "Preferences updated successfully",
                            type: "success",
                        })
                    );
                }
            }

            navigate(`/profile/${userID}`);
        } catch (error) {
            dispatch(setError(error));
            if (preferences?.notifications) {
                dispatch(
                    addNotification({
                        message: error || "Update failed",
                        type: "error",
                    })
                );
            }
            startTransition(() => {
                setOptimisticProfile(profile); // Roll back optimistic update
            });
        }
    }

    if (loading && !optimisticProfile) {
        return (
            <div className="flex justify-center items-center text-gray-600 dark:text-gray-300">
                <Spinner size="4" />
            </div>
        );
    }

    if (error && !optimisticProfile) {
        return (
            <div className="text-center text-red-600 dark:text-red-400">
                {error}
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Edit Profile
            </h1>
            <form
                onSubmit={handleSubmit(updateProfileOnSubmit)}
                className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 space-y-6"
            >
                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="on"
                        {...register("name", {
                            required: "Name is required",
                            maxLength: {
                                value: 127,
                                message:
                                    "Name must be less than 128 characters",
                            },
                        })}
                        className={`mt-1 h-10 px-2 block w-full rounded-md border ${
                            errors.name
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="on"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email format",
                            },
                        })}
                        className={`mt-1 h-10 px-2 block w-full rounded-md border ${
                            errors.email
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Notifications Preference */}
                <div>
                    <label
                        htmlFor="notifications"
                        id="notifications-label"
                        className="block text-sm font-medium  text-gray-700 dark:text-gray-200"
                    >
                        Show Notifications
                    </label>
                    <div className="mt-1 flex items-center">
                        <label className="toggle-switch">
                            <input
                                id="notifications"
                                type="checkbox"
                                {...register("notifications")}
                            />
                            <span
                                className="toggle-slider"
                                role="switch"
                                aria-checked={notifications}
                                aria-labelledby="notifications-label"
                            >
                                <span
                                    className={`toggle-text toggle-text-on ${
                                        notifications ? "block" : "hidden"
                                    }`}
                                >
                                    On
                                </span>
                                <span
                                    className={`toggle-text toggle-text-off ${
                                        notifications ? "hidden" : "block"
                                    }`}
                                >
                                    Off
                                </span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Current Password (for email/password updates) */}
                <div>
                    <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            id="currentPassword"
                            type={
                                isCurrentPasswordShowing ? "text" : "password"
                            }
                            {...register("currentPassword", {
                                required:
                                    watch("email") !== profile?.email ||
                                    watch("newPassword")
                                        ? "Current password is required for this update"
                                        : false,
                            })}
                            className={`mt-1 h-10 px-2 block w-full rounded-md border ${
                                errors.currentPassword
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                        />
                        <button
                            type="button"
                            onClick={toggleCurrentPasswordVisibility}
                            className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                            aria-label={
                                isCurrentPasswordShowing
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {!isCurrentPasswordShowing ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.currentPassword.message}
                        </p>
                    )}
                </div>

                {/* New Password */}
                <div>
                    <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            type={isNewPasswordShowing ? "text" : "password"}
                            {...register("newPassword", {
                                minLength: {
                                    value: 8,
                                    message:
                                        "Password must be at least 8 characters",
                                },
                                maxLength: {
                                    value: 256,
                                    message:
                                        "Password must be less than 256 characters",
                                },
                            })}
                            className={`mt-1 h-10 px-2 block w-full rounded-md border ${
                                errors.newPassword
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                        />
                        <button
                            type="button"
                            onClick={toggleNewPasswordVisibility}
                            className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                            aria-label={
                                isNewPasswordShowing
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {!isNewPasswordShowing ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={
                                isConfirmPasswordShowing ? "text" : "password"
                            }
                            {...register("confirmPassword", {
                                validate: (value) =>
                                    !newPassword ||
                                    value === newPassword ||
                                    "Passwords do not match",
                            })}
                            className={`mt-1 h-10 px-2 block w-full rounded-md border ${
                                errors.confirmPassword
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                            aria-label={
                                isConfirmPasswordShowing
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {!isConfirmPasswordShowing ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Redux Errors */}
                {error && (
                    <p
                        className="italic text-center text-red-500 dark:text-red-400"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/profile/${userID}`)}
                        className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-gray-600 transition-all duration-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 cursor-pointer flex items-center justify-center focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 transition-all duration-100"
                    >
                        {loading ? (
                            <>
                                Updating...
                                <Spinner size="1" className="ml-2" />
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}
