import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { requestPasswordReset, setError } from "../../slices/authSlice";
import { Spinner } from "../componentsIndex";
import { addNotification } from "../../slices/uiSlice";

/**
 * Component for requesting a password reset email.
 * @returns {JSX.Element} Forgot Password form.
 */
export default function ForgotPassword() {
    const { loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    async function requestPasswordResetOnSubmit(data) {
        try {
            await dispatch(requestPasswordReset(data.email)).unwrap();
            setSuccess(true);
            dispatch(
                addNotification({
                    message: "Password reset email sent. Check your inbox.",
                    type: "success",
                    timeout: 3000,
                })
            );

            navigate(`/email-sent?type=password-reset`);
        } catch (error) {
            console.error(error);
            dispatch(setError(error));
            dispatch(
                addNotification({
                    message: error || "Failed to send reset email",
                    type: "error",
                    timeout: 3000,
                })
            );
        }
    }

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Forgot Password
                </h1>

                {success ? (
                    <div className="text-center">
                        <p className="text-green-500 dark:text-green-400 mb-4">
                            Password reset email sent! Please check your inbox
                            (and spam folder).
                        </p>
                        <div className="flex justify-center items-center">
                            <p className="text-gray-700 dark:text-gray-300">
                                Redirecting to login
                            </p>
                            <Spinner size="1" className="ml-2" />
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(requestPasswordResetOnSubmit)}
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
                                } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-transparent shadow-sm hover:shadow-lg dark:shadow-cyan-800/50`}
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

                        {/* Error from Redux */}
                        {error &&
                            error !==
                                `User (role: guests) missing scope (account)` && (
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
                            aria-label="Send reset email"
                        >
                            {loading ? (
                                <>
                                    Sending...{" "}
                                    <Spinner size="1" className="ml-2" />
                                </>
                            ) : (
                                "Send Reset Email"
                            )}
                        </button>
                    </form>
                )}

                {/* Login Link */}
                <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    Back to{" "}
                    <NavLink
                        to="/login"
                        className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                        Log In
                    </NavLink>
                </p>
            </div>
        </section>
    );
}
