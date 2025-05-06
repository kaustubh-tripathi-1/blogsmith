import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import {
    setError,
    requestEmailVerification,
    signupUser,
    createTempSession,
    deleteSession,
} from "../../slices/authSlice";
import { Spinner } from "../componentsIndex";
import { addNotification } from "../../slices/uiSlice";
import { updatePreferences } from "../../slices/userSlice";

export default function Signup() {
    const { authStatus, loading, error } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);
    const [isConfirmPasswordShowing, setIsConfirmPasswordShowing] =
        useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        mode: "onChange", // Validate on every change
    });

    useEffect(() => {
        dispatch(setError(null)); // Clear errors on mount
        if (authStatus) {
            navigate(`/`);
        }
    }, [authStatus, navigate, dispatch]);

    // Watch password for confirmation validation
    const password = watch("password");

    async function signupOnSubmit(data) {
        try {
            const user = await dispatch(signupUser(data)).unwrap();
            // Create temporary session to send verification email to user
            await dispatch(
                createTempSession({
                    email: data.email,
                    password: data.password,
                })
            ).unwrap();
            await dispatch(
                updatePreferences({ theme: "dark", notifications: true })
            ).unwrap();
            await dispatch(requestEmailVerification()).unwrap();

            // Delete the session to keep user logged out
            await dispatch(deleteSession()).unwrap();

            dispatch(
                addNotification({
                    message:
                        "Signed up successfully. Please check your email and verify it to proceed",
                    type: "success",
                    timeout: 10000,
                })
            );

            navigate(`/email-sent?type=email-verification`);
        } catch (error) {
            if (error.type === `user_already_exists`) {
                console.error(error.type, error.message);
                dispatch(
                    setError(
                        `A user already exists with the same email! Please login.`
                    )
                );
                dispatch(
                    addNotification({
                        message:
                            "A user already exists with the same email! Please login.",
                        type: "error",
                    })
                );
            } else {
                console.error(error);
                dispatch(setError(error));
                dispatch(
                    addNotification({
                        message: error,
                        type: "error",
                    })
                );
            }
        }
    }

    function togglePasswordVisibility() {
        setIsPasswordShowing((prev) => !prev);
    }

    function toggleConfirmPasswordVisibility() {
        setIsConfirmPasswordShowing((prev) => !prev);
    }

    return (
        <section className="w-full min-h-screen flex items-center justify-center px-4 py-6 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Sign Up
                </h1>

                <form
                    onSubmit={handleSubmit(signupOnSubmit)}
                    className="space-y-6"
                >
                    {/* Name Field */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            title="Name - required field"
                        >
                            Name <sup className="text-red-600">*</sup>
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register("name", {
                                required: "Name is required",
                                maxLength: {
                                    value: 127,
                                    message:
                                        "Name must be less than 128 characters",
                                },
                            })}
                            className={`w-full px-3 py-2 border ${
                                errors.name
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-transparent shadow-sm hover:shadow-lg dark:shadow-cyan-800/50`}
                            disabled={loading}
                            autoComplete="on"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email Field with Real-Time Validation */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            title="Email - required field"
                        >
                            Email <sup className="text-red-600">*</sup>
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format",
                                },
                            })}
                            className={`w-full px-3 py-2 border ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-transparent`}
                            disabled={loading}
                            autoComplete="on"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field with eye icon*/}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            title="Password - required field"
                        >
                            Password <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            {" "}
                            {/* Nested div for input + button */}
                            <input
                                id="password"
                                type={isPasswordShowing ? "text" : "password"}
                                {...register("password", {
                                    required: "Password is required",
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
                                className={`w-full px-3 py-2 border ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600"
                                } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-transparent shadow-sm hover:shadow-lg dark:shadow-cyan-800/50`}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={togglePasswordVisibility}
                                className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                                aria-label={
                                    isPasswordShowing
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {!isPasswordShowing ? (
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
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field with eye icon*/}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            title="Password - required field"
                        >
                            Confirm Password{" "}
                            <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            {" "}
                            {/* Nested div for input + button */}
                            <input
                                id="confirmPassword"
                                type={
                                    isConfirmPasswordShowing
                                        ? "text"
                                        : "password"
                                }
                                {...register("confirmPassword", {
                                    required: "Confirm Password is required",
                                    validate: (value) =>
                                        !password ||
                                        value === password ||
                                        "Passwords do not match",
                                })}
                                className={`w-full px-3 py-2 border ${
                                    errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600"
                                } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-transparent shadow-sm hover:shadow-lg dark:shadow-cyan-800/50`}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
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
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Error from Redux */}
                    {error &&
                        error !==
                            `User (role: guests) missing scope (account)` && (
                            <p className="italic text-center text-red-500 dark:text-red-400">
                                {error}{" "}
                                {error ===
                                    `A user already exists with the same email! Please login.` && (
                                    <NavLink
                                        to="/login"
                                        className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300"
                                    >
                                        Log In instead
                                    </NavLink>
                                )}
                            </p>
                        )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                Signing Up...{" "}
                                <Spinner size="1" className="ml-2" />
                            </>
                        ) : (
                            `Sign Up`
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    Already have an account?{" "}
                    <NavLink
                        to="/login"
                        className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                        Log In
                    </NavLink>
                </p>

                {/* Resend Verification Email Link */}
                <div className="flex flex-col justify-center items-center">
                    <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
                        Already signed up but missed verification email?
                    </p>
                    <NavLink
                        to="/resend-verification-email"
                        className="text-blue-500 dark:text-blue-400 text-sm hover:underline focus:underline focus:outline-none transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                        Resend Verification Email
                    </NavLink>
                </div>
            </div>
        </section>
    );
}
