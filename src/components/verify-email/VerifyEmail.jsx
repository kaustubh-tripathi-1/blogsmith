import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, NavLink } from "react-router";
import { completeEmailVerification } from "../../slices/authSlice";
import { Spinner } from "../componentsIndex";
import { addNotification } from "../../slices/uiSlice";

/**
 * Component for completing email verification.
 * @returns {JSX.Element} Verification UI.
 */
export default function VerifyEmail() {
    const { loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [verified, setVerified] = useState(false);
    // Add a ref using useRef if you want to absolutely guarantee that verifyEmail doesn't run again, otherwise the current useEffect dependencies are stable.

    useEffect(() => {
        const userID = searchParams.get("userId");
        const secret = searchParams.get("secret");

        if (!userID || !secret) {
            dispatch(
                addNotification({
                    message: "Invalid or missing verification link parameters",
                    type: "error",
                })
            );
            navigate("/login");
            return;
        }

        async function verifyEmail() {
            try {
                await dispatch(
                    completeEmailVerification({ userID, secret })
                ).unwrap();
                setSuccess(true);
                setVerified(true);
                dispatch(
                    addNotification({
                        message:
                            "Signed up and Email verified successfully. Please log in.",
                        type: "success",
                    })
                );
                setTimeout(() => navigate("/login"), 5000);
            } catch (error) {
                setSuccess(false);
                setVerified(false);
                console.error(
                    `Message - ${error.message}, type - ${error.type}, code - ${error.code}`
                );

                const errorMessage = error.type.includes("too_many_requests")
                    ? "Too many verification attempts. Please try again later."
                    : error ||
                      "Failed to verify email. The link may be invalid or expired.";
                dispatch(
                    addNotification({
                        message: errorMessage,
                        type: "error",
                    })
                );
            }
        }

        verifyEmail();
    }, [searchParams, dispatch, navigate]);

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Email Verification
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center">
                        <p className="text-gray-700 dark:text-gray-300">
                            Verifying your email...
                        </p>
                        <Spinner
                            size="1"
                            className="text-gray-700 dark:text-gray-300 ml-2"
                        />
                    </div>
                ) : success && verified ? (
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-green-500 dark:text-green-400 mb-4">
                            Email verified successfully! Please log in.
                        </p>
                        <div className="flex justify-center items-center">
                            <p className="text-gray-700 dark:text-gray-300">
                                Redirecting to login...
                            </p>
                            <Spinner
                                size="1"
                                className="text-gray-700 dark:text-gray-300 ml-2"
                            />
                        </div>
                    </div>
                ) : (
                    error &&
                    error !== `User (role: guests) missing scope (account)` && (
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-red-500 dark:text-red-400 mb-4">
                                {error ||
                                    "Failed to verify email. The link may be invalid or expired."}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                Please try again or request a new verification
                                email.
                            </p>
                            <button
                                onClick={() => {
                                    navigate(`/resend-verification-email`);
                                }}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                Resend Verification Email
                            </button>
                        </div>
                    )
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
