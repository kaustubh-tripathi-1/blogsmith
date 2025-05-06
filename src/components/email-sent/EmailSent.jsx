import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { NavLink } from "react-router";
import { Spinner } from "../componentsIndex";

/**
 * Component displayed after signup to inform user that a verification email has been sent.
 * @returns {JSX.Element} Email sent UI with Tailwind animations.
 */
export default function EmailSent() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const emailType = queryParams.get("type") || "email-verification"; // Fallback

    useEffect(() => {
        // Debug query params
        console.log("Query params:", queryParams.toString());
        console.log("Email type:", emailType);

        // Auto-redirect to login after 20 seconds
        const timer = setTimeout(() => {
            navigate("/login");
        }, 20000);
        return () => clearTimeout(timer);
    }, [navigate, location.state]);

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-blue-100 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center animate-scale-in">
                <div className="mb-6">
                    <svg
                        className="w-18 h-18 mx-auto text-green-500 dark:text-green-400 animate-pulse-checkmark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-4 text-green-500 dark:text-green-400">
                    Email Sent!
                </h1>
                <div className="flex flex-col items-center justify-center mb-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {emailType === "email-verification" ? (
                            <>
                                A verification email has been sent to your
                                inbox. Please check your email (including
                                spam/junk folders) and click the link to verify
                                your account.
                            </>
                        ) : (
                            <>
                                A password reset email has been sent to your
                                inbox. Please check your email (including
                                spam/junk folders) and click the link to reset
                                your password.
                            </>
                        )}
                    </p>
                    <div className="flex justify-center items-center text-gray-700 dark:text-gray-300">
                        <p className="text-gray-700 dark:text-gray-300">
                            Redirecting to login
                        </p>
                        <Spinner size="1" className="ml-2" />
                    </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-8 animate-fade-in-1000 opacity-0">
                    Didn’t receive the email?{" "}
                    {emailType === "email-verification" ? (
                        <NavLink
                            to="/resend-verification-email"
                            className="text-blue-500 dark:text-blue-400 hover:underline focus:underline"
                        >
                            Resend Verification Email
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/forgot-password"
                            className="text-blue-500 dark:text-blue-400 hover:underline focus:underline"
                        >
                            Try Again
                        </NavLink>
                    )}
                </p>

                <NavLink
                    to="/login"
                    className="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 animate-fade-in-1500 opacity-0"
                >
                    Go to Login
                </NavLink>
            </div>
        </section>
    );
}
