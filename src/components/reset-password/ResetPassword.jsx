import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, NavLink } from "react-router";
import { completePasswordReset, setError } from "../../slices/authSlice";
import { Spinner } from "../componentsIndex";
import { addNotification } from "../../slices/uiSlice";

/**
 * Component for completing password reset.
 * @returns {JSX.Element} Password reset form.
 */
export default function ResetPassword() {
    const { loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);
    const [isConfirmPasswordShowing, setIsConfirmPasswordShowing] =
        useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    const password = watch("password");

    useEffect(() => {
        if (!searchParams.get("userId") || !searchParams.get("secret")) {
            dispatch(
                addNotification({
                    message:
                        "Invalid or missing password reset link parameters",
                    type: "error",
                })
            );
            navigate("/login");
        }
    }, [searchParams, dispatch, navigate]);

    async function resetPasswordOnSubmit(data) {
        const userID = searchParams.get("userId");
        const secret = searchParams.get("secret");

        try {
            await dispatch(
                completePasswordReset({
                    userID,
                    secret,
                    newPassword: data.password,
                })
            ).unwrap();
            setSuccess(true);
            dispatch(
                addNotification({
                    message: "Password reset successfully. Please log in.",
                    type: "success",
                    timeout: 4000,
                })
            );
            setTimeout(() => navigate("/login"), 5000);
        } catch (error) {
            console.error(error);
            dispatch(setError(error));
            dispatch(
                addNotification({
                    message: error.message || "Failed to reset password",
                    type: "error",
                    timeout: 4000,
                })
            );
        }
    }

    function togglePasswordVisibility() {
        setIsPasswordShowing((prev) => !prev);
    }

    function toggleConfirmPasswordVisibility() {
        setIsConfirmPasswordShowing((prev) => !prev);
    }

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Reset Password
                </h1>

                {success ? (
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-green-500 dark:text-green-400 mb-4">
                            Password reset successfully! Please log in with your
                            new password.
                        </p>
                        <div className="flex justify-center items-center">
                            <p className="text-gray-700 dark:text-gray-300">
                                Redirecting to login
                            </p>
                            <Spinner
                                size="1"
                                className="text-gray-700 dark:text-gray-300 ml-2"
                            />
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(resetPasswordOnSubmit)}
                        className="space-y-6"
                    >
                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            >
                                New Password{" "}
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
                                    type={
                                        isPasswordShowing ? "text" : "password"
                                    }
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
                                    autoComplete="new-password"
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

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            >
                                Confirm Password{" "}
                                <sup
                                    className="text-red-600"
                                    title="required field"
                                >
                                    *
                                </sup>
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={
                                        isConfirmPasswordShowing
                                            ? "text"
                                            : "password"
                                    }
                                    {...register("confirmPassword", {
                                        required:
                                            "Confirm Password is required",
                                        validate: (value) =>
                                            value === password ||
                                            "Passwords do not match",
                                    })}
                                    className={`w-full px-3 py-2 border ${
                                        errors.confirmPassword
                                            ? "border-red-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-transparent shadow-sm hover:shadow-lg dark:shadow-cyan-800/50`}
                                    disabled={loading}
                                    autoComplete="new-password"
                                    aria-invalid={
                                        errors.confirmPassword
                                            ? "true"
                                            : "false"
                                    }
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
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.confirmPassword.message}
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
                            aria-label="Reset password"
                        >
                            {loading ? (
                                <>
                                    Resetting...{" "}
                                    <Spinner size="1" className="ml-2" />
                                </>
                            ) : (
                                "Reset Password"
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
