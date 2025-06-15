import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
    createTempSession,
    requestEmailVerification,
    deleteSession,
    setError,
    setLoading,
} from "../../slices/authSlice";
import { Spinner } from "../componentsIndex";
import { NavLink } from "react-router";
import { addNotification } from "../../slices/uiSlice";

/**
 * Component for resending email verification link.
 * @returns {JSX.Element} Resend verification UI.
 */
export default function ResendVerificationEmail() {
    const { loading, error } = useSelector((state) => state.auth);
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    useEffect(() => {
        dispatch(setError(null)); // Clear errors on mount
    }, [dispatch]);

    async function resendOnSubmit(data) {
        dispatch(setLoading(true));

        try {
            await dispatch(
                createTempSession({
                    email: data.email,
                    password: data.password,
                })
            ).unwrap();
            await dispatch(requestEmailVerification()).unwrap();
            await dispatch(deleteSession()).unwrap();

            dispatch(
                addNotification({
                    message:
                        "Verification email resent. Please check your inbox.",
                    type: "success",
                })
            );
            navigate("/email-sent");
        } catch (error) {
            dispatch(
                setError(error.message || "Failed to resend verification email")
            );
            dispatch(
                addNotification({
                    message:
                        error.message || "Failed to resend verification email",
                    type: "error",
                })
            );
        }
    }

    function togglePasswordVisibility() {
        setIsPasswordShowing((prev) => !prev);
    }

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Resend Verification Email
                </h1>
                <p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-6">
                    Enter the email and password you used during signup to
                    resend the verification email.
                </p>

                <form
                    onSubmit={handleSubmit(resendOnSubmit)}
                    className="space-y-6"
                >
                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                        >
                            Email{" "}
                            <sup
                                className="text-red-600"
                                title="required field"
                            >
                                *
                            </sup>
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
                            autoComplete="email"
                            aria-invalid={errors.email ? "true" : "false"}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                        >
                            Password{" "}
                            <sup
                                className="text-red-600"
                                title="required field"
                            >
                                *
                            </sup>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={isPasswordShowing ? "text" : "password"}
                                {...register("password", {
                                    required: "Password is required",
                                })}
                                className={`w-full px-3 py-2 border ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600"
                                } rounded-md shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-transparent`}
                                disabled={loading}
                                autoComplete="current-password"
                                aria-invalid={
                                    errors.password ? "true" : "false"
                                }
                            />
                            <button
                                type="button"
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

                    {/* Error from Redux */}
                    {error &&
                        error !==
                            "User (role: guests) missing scope (account)" && (
                            <p
                                className="italic text-center text-red-500 dark:text-red-400"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center"
                        disabled={loading}
                        aria-label="Resend verification email"
                    >
                        {loading ? (
                            <>
                                Sending Email...{" "}
                                <Spinner size="1" className="ml-2" />
                            </>
                        ) : (
                            "Resend Verification Email"
                        )}
                    </button>
                </form>

                {/* Login and Signup Links */}
                <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    <p>
                        Already verified?{" "}
                        <NavLink
                            to="/login"
                            className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300"
                        >
                            Log In
                        </NavLink>
                    </p>
                    <p className="mt-2">
                        Need to create an account?{" "}
                        <NavLink
                            to="/signup"
                            className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300"
                        >
                            Sign Up
                        </NavLink>
                    </p>
                </div>
            </div>
        </section>
    );
}
