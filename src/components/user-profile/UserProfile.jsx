import { useEffect, useCallback, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router";
import {
    fetchMoreUserPosts,
    fetchProfile,
    fetchUserPosts,
} from "../../slices/userSlice";
import { openModal } from "../../slices/uiSlice";
import defaultUserAvatar from "../../assets/man.png";
import {
    ProfileSkeleton,
    Spinner,
    UserPostCardSkeleton,
} from "../componentsIndex";

/**
 * UserProfile component to display and manage user details and posts.
 * @returns {React.ReactElement} User profile section
 */
export default function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        profile,
        userPosts,
        preferences,
        loading,
        infiniteScrollLoading,
        userPostsLoading,
        hasMore,
        error,
    } = useSelector((state) => state.user);
    const { authStatus, userData } = useSelector((state) => state.auth);
    const [showPosts, setShowPosts] = useState(false);
    const observerRef = useRef(null);

    // Fetch user posts
    const getUserPosts = useCallback(() => {
        if (profile?.$id) {
            dispatch(fetchUserPosts(profile.$id));
        }
    }, [dispatch, profile?.$id]);

    // Fetch user profile
    useEffect(() => {
        dispatch(fetchProfile());
    }, []);

    // Intersection Observer to detect when the user scrolls to the bottom of the posts list
    const lastPostRef = useCallback(
        (node) => {
            if (loading || infiniteScrollLoading || !showPosts) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    dispatch(fetchMoreUserPosts(profile.$id));
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [
            loading,
            infiniteScrollLoading,
            hasMore,
            showPosts,
            dispatch,
            profile?.$id,
        ]
    );

    // Toggle posts section and fetch user posts
    const togglePostsAndFetchPosts = useCallback(() => {
        const newShowPosts = !showPosts;
        setShowPosts(newShowPosts);
        if (newShowPosts && profile?.$id) {
            getUserPosts();
        }
    }, [showPosts, profile?.$id, getUserPosts]);

    // Check if the current user is viewing their own profile
    const isOwnProfile = authStatus && profile?.$id === userData.$id;

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen py-10 flex flex-col items-center justify-center gap-20 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400">
                <p className="min-h-full text-3xl text-center text-red-600 dark:text-red-400">
                    {error || "Profile not found"}
                </p>
                <Link
                    to="/"
                    className="text-2xl text-blue-500 dark:text-blue-500 hover:text-blue-700 hover:underline focus:text-blue-700 focus:outline-none"
                >
                    Return to Home Page
                </Link>
            </div>
        );
    }

    let accountCreationDate = new Date(profile?.$createdAt).toDateString();
    accountCreationDate = accountCreationDate.slice(4);

    return (
        <section className="min-h-full mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Your Profile
            </h1>
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img
                        src={profile?.avatar || defaultUserAvatar}
                        alt="User avatar"
                        className="h-20 w-20 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {profile?.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            {profile?.email}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                            Joined on - {accountCreationDate}
                        </p>
                        <p className="text-lg">
                            <strong>Notifications:</strong>{" "}
                            {preferences?.notifications ? "On" : "Off"}
                        </p>
                    </div>
                </div>
                {isOwnProfile && (
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:bg-blue-700 dark:focus:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
                            onClick={() =>
                                navigate(`/profile/edit/${profile.$id}`)
                            }
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>

            {/* User Posts Section */}
            <div className="mt-8">
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-2 focus:outline-offset-2 focus:outline-gray-600 cursor-pointer"
                    onClick={togglePostsAndFetchPosts}
                >
                    {showPosts ? "Hide My Posts" : "Show My Posts"}
                    <svg
                        className={`w-5 h-5 transform transition-transform ${
                            showPosts ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* User posts skeleton when loading */}
                {showPosts && userPostsLoading && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in">
                        <UserPostCardSkeleton />
                        <UserPostCardSkeleton />
                        <UserPostCardSkeleton />
                        <UserPostCardSkeleton />
                        <UserPostCardSkeleton />
                        <UserPostCardSkeleton />
                    </div>
                )}

                {/* User posts */}
                {showPosts && !userPostsLoading && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in">
                        {userPosts.length > 0 ? (
                            userPosts.map((post, index) => {
                                const isLastPost =
                                    index === userPosts.length - 1;
                                return (
                                    <div
                                        key={post.$id}
                                        ref={isLastPost ? lastPostRef : null}
                                        className="min-h-30 rounded-lg bg-white p-4 shadow-md dark:bg-gray-700 hover:shadow-lg dark:shadow-cyan-800/50 transition-shadow duration-300 animate-fade-in"
                                    >
                                        <h3 className="h-10 text-lg font-semibold text-gray-900 dark:text-white">
                                            {post.title}
                                        </h3>
                                        <div className="mt-8 flex gap-2">
                                            <button
                                                type="button"
                                                className="px-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer focus:outline focus:outline-blue-400 rounded-md"
                                                onClick={() =>
                                                    navigate(
                                                        `/posts/${post.$id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                className="px-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer focus:outline focus:outline-red-400 rounded-md"
                                                onClick={() =>
                                                    dispatch(
                                                        openModal({
                                                            type: "delete-post",
                                                            data: {
                                                                postID: post.$id,
                                                                featureImage:
                                                                    post.featureImage,
                                                                shouldNavigate: false,
                                                            },
                                                        })
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">
                                No posts yet.
                            </p>
                        )}

                        {/* Infinite Scroll Loading Spinner */}
                        {infiniteScrollLoading && (
                            <Spinner
                                size="2"
                                className="mx-auto mt-4 col-span-full"
                            />
                        )}

                        {/* No More Posts Message */}
                        {!infiniteScrollLoading &&
                            !error &&
                            userPosts.length > 0 &&
                            !hasMore && (
                                <p className="text-center text-gray-600 dark:text-gray-400 mt-4 col-span-full">
                                    No more posts to load.
                                </p>
                            )}
                    </div>
                )}
            </div>
        </section>
    );
}
