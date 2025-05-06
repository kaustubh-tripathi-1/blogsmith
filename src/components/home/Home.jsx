import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchActivePosts,
    fetchAllPosts,
    fetchMoreActivePosts,
} from "../../slices/postsSlice";
import { NavLink } from "react-router";
import { HomePostCardSkeleton, PostCard, Spinner } from "../componentsIndex";

export default function Home() {
    const { activePosts, loading, infiniteScrollLoading, error, hasMore } =
        useSelector((state) => state.posts);
    const { authStatus } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const observerRef = useRef(null);

    useEffect(() => {
        dispatch(fetchActivePosts());
        dispatch(fetchAllPosts());
    }, [dispatch]);

    // Intersection Observer to detect when the user scrolls to the bottom
    const lastPostRef = useCallback(
        (node) => {
            if (loading || infiniteScrollLoading) return;

            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore) {
                        dispatch(fetchMoreActivePosts());
                    }
                } /* ,
                { threshold: 1.0 } */
            );

            if (node) {
                observerRef.current.observe(node);
            }
        },
        [loading, infiniteScrollLoading, hasMore, dispatch]
    );

    return (
        <section className="min-h-full px-4 py-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 animate-fade-in">
            {/* Hero Section */}
            {!authStatus && (
                <section className="flex flex-col items-center justify-center py-12 px-4 mb-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
                    <h1 className="text-center text-4xl font-bold mb-4">
                        Welcome to BlogSmith 🛠️
                    </h1>
                    <p className="text-lg text-center text-gray-600 dark:text-gray-300">
                        A modern platform to write and share blog posts
                        effortlessly. Join a space where writers share ideas,
                        stay up-to-date, and grow their voice and career.
                    </p>
                </section>
            )}

            <h2 className="text-3xl font-bold mb-6">Latest Posts</h2>

            {/* Loading State with Skeleton */}
            {loading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                    {/* Show 4-6 skeleton cards as placeholders when loading */}
                    <HomePostCardSkeleton />
                    <HomePostCardSkeleton />
                    <HomePostCardSkeleton />
                    <HomePostCardSkeleton />
                    {activePosts.length > 6 && (
                        <>
                            <HomePostCardSkeleton />
                            <HomePostCardSkeleton />
                        </>
                    )}
                </div>
            )}

            {/* Error State */}
            {error && (
                <p className="text-center text-red-500 dark:text-red-400">
                    Error: {error}
                </p>
            )}

            {/* Posts List */}
            {!loading && !error && activePosts.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                    {activePosts.map((post, index) => {
                        const isLastPost = index === activePosts.length - 1;
                        return (
                            <div
                                key={post.$id}
                                ref={isLastPost ? lastPostRef : null}
                            >
                                <PostCard
                                    to={`/posts/${post.$id}`}
                                    title={post.title}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Infinite Scroll Loading Spinner */}
            {infiniteScrollLoading && (
                <Spinner size="2" className="mx-auto mt-4" />
            )}

            {/* No More Posts Message */}
            {!loading &&
                !infiniteScrollLoading &&
                !error &&
                activePosts.length > 0 &&
                !hasMore && (
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                        No more posts to load.
                    </p>
                )}

            {/* No Posts - Conditional Messaging */}
            {!loading && !error && activePosts.length === 0 && (
                <div className="text-center">
                    <p className="text-lg mb-4">
                        {authStatus
                            ? "No posts yet. Be the first to create one!"
                            : "No posts yet. Log in to create one!"}
                    </p>
                    {authStatus ? (
                        <NavLink
                            to="/create-post"
                            className="inline-block bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Create a Post
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/login"
                            className="inline-block bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Log In
                        </NavLink>
                    )}
                </div>
            )}
        </section>
    );
}
