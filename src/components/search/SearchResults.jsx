// In components/SearchResults.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { searchPostsWithQuery } from "../../slices/postsSlice";
import { PostCard, Spinner } from "../componentsIndex";

export default function SearchResults() {
    const dispatch = useDispatch();
    const { searchResults, loading, error } = useSelector(
        (state) => state.posts
    );
    const { search } = useLocation();
    const query = new URLSearchParams(search).get("q");

    useEffect(() => {
        if (query) {
            dispatch(searchPostsWithQuery(query));
        }
    }, [query, dispatch]);

    return (
        <div className="    mx-auto px-4 py-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Search Results for "{query}"
            </h1>
            {loading && <Spinner size="2" className="mx-auto" />}
            {error && (
                <p className="text-red-500 dark:text-red-400" role="alert">
                    Error: {error}
                </p>
            )}
            {!loading && !error && searchResults.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                    No posts found for "{query}".
                </p>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((post) => (
                    <PostCard
                        key={post.$id}
                        to={`/posts/${post.$id}`}
                        title={post.title}
                    />
                ))}
            </div>
        </div>
    );
}
