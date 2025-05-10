import {
    createBrowserRouter,
    RouterProvider,
    useLocation,
    useNavigationType,
} from "react-router";
import Layout from "./components/layout/Layout";
import {
    Home,
    Login,
    Signup,
    About,
    Contact,
    Spinner,
    ProtectedRoute,
    PostEditorForm,
    PostDetail,
    NotFound,
    ErrorBoundaryInRouter,
    UserProfile,
    EditProfile,
    Notifications,
    ForgotPassword,
    ResetPassword,
    VerifyEmail,
    EmailSent,
    ResendVerificationEmail,
    SearchResults,
} from "./components/componentsIndex";
import { useEffect, useState /* lazy, Suspense */ } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatus, setInitialLoading } from "./slices/authSlice";
import { setPreferences, setProfile } from "./slices/userSlice";

/**
 * Persists the current route path in sessionStorage for redirect handling.
 * @returns {null} Renders nothing.
 */
function PathPersistor() {
    const location = useLocation();
    const navigationType = useNavigationType(); // "PUSH", "POP", or "REPLACE"

    useEffect(() => {
        // Store the last path for redirect handling
        sessionStorage.setItem("lastPath", location.pathname);

        // Set a flag to indicate the navigation type
        sessionStorage.setItem("navigationType", navigationType);
    }, [location.pathname, navigationType]);
    return null;
}

// Try Lazy loading of compo
// const About = lazy(() => import("./components/about/About"));

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <>
                <PathPersistor />
                <Layout />
            </>
        ),
        errorElement: <ErrorBoundaryInRouter />, // Root Error fallback
        children: [
            { path: "", index: true, element: <Home /> },
            {
                path: "about",
                element: (
                    // <Suspense
                    //     fallback={
                    //         <div className="w-full min-h-dvh flex justify-center items-center">
                    //             {" "}
                    //             <Spinner size="4" />
                    //         </div>
                    //     }
                    // >
                    <About />
                    // </Suspense>
                ),
            },
            { path: "contact", element: <Contact /> },
            {
                path: "create-post",
                element: (
                    <ProtectedRoute>
                        <PostEditorForm />
                    </ProtectedRoute>
                ),
            },
            { path: "posts/:slug", element: <PostDetail /> },
            {
                path: "edit-post/:slug",
                element: (
                    <ProtectedRoute>
                        <PostEditorForm />
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile/:userID",
                element: (
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile/edit/:userID",
                element: (
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                ),
            },
            { path: "search", element: <SearchResults /> },
            { path: "*", element: <NotFound /> },
        ],
    },
    {
        path: "login",
        element: <Login />,
        errorElement: <ErrorBoundaryInRouter />,
    },
    {
        path: "signup",
        element: <Signup />,
        errorElement: <ErrorBoundaryInRouter />,
    },
    {
        path: "forgot-password",
        element: <ForgotPassword />,
        errorElement: <ErrorBoundaryInRouter />,
    },
    {
        path: "reset-password",
        element: <ResetPassword />,
        errorElement: <ErrorBoundaryInRouter />,
    },
    {
        path: "verify-email",
        element: <VerifyEmail />,
        errorElement: <ErrorBoundaryInRouter />,
    },
    {
        path: "email-sent",
        element: <EmailSent />,
        errorElement: <ErrorBoundaryInRouter />,
    },
    {
        path: "resend-verification-email",
        element: <ResendVerificationEmail />,
        errorElement: <ErrorBoundaryInRouter />,
    },
]);

/**
 * Root component that sets up routing, auth checks, and theme toggling.
 * @returns {JSX.Element} The router provider or a loading spinner.
 */
export default function App() {
    const dispatch = useDispatch();
    const { initialLoading } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.ui);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        // Set initialLoading to true manually before checking auth
        dispatch(setInitialLoading(true));
        dispatch(checkAuthStatus())
            .then((action) => {
                setAuthChecked(true);
                if (action.meta.requestStatus === "fulfilled") {
                    const userData = action.payload;
                    dispatch(setProfile(userData));
                    dispatch(setPreferences(userData.prefs));
                }
            })
            .catch((error) => {
                console.error("Auth check failed:", error);
                setAuthChecked(true); // Proceed to render even if auth fails
            });
    }, [dispatch]);

    useEffect(() => {
        const html = document.documentElement;
        if (theme === "dark") {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
    }, [theme]);

    if (!authChecked || initialLoading) {
        return (
            <section className="min-h-screen flex justify-center items-center bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <Spinner size="4" />
            </section>
        );
    }

    return (
        <>
            <Notifications />
            <RouterProvider router={router} />
        </>
    );
}
