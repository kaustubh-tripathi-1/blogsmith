import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
    clearSearchResults,
    searchPostsWithQuery,
} from "../../slices/postsSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { PostCard, Spinner } from "../componentsIndex";
import { closeModal } from "../../slices/uiSlice";

export default function SearchModalContent() {
    const { register, handleSubmit, watch, setFocus, setValue } = useForm({
        mode: "onChange",
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { searchResults, searchLoading, error } = useSelector(
        (state) => state.posts
    );
    const searchQuery = watch("searchQuery", "");
    const inputRef = useRef(null);

    // Memoize the search callback to prevent re-creation on every render
    const memoizedDebouncedSearch = useCallback(
        useDebounce((query) => {
            if (query.trim()) {
                dispatch(searchPostsWithQuery(query));
                // navigate(`/search?q=${encodeURIComponent(query)}`, {
                //     replace: true,
                // });
            }
        }, 400),
        [dispatch, navigate]
    );

    // Trigger search on searchQuery change
    useEffect(() => {
        if (searchQuery.trim()) {
            memoizedDebouncedSearch(searchQuery);
        } else {
            dispatch(clearSearchResults());
        }
    }, [searchQuery, memoizedDebouncedSearch, dispatch]);

    function handleClear() {
        inputRef.current.value = "";
        dispatch(clearSearchResults());
        setValue("searchQuery", "");
        setFocus("searchQuery");
    }

    // Handle form submission (Enter key)
    function searchOnSubmit(data) {
        if (data.searchQuery.trim()) {
            memoizedDebouncedSearch(data.searchQuery);
        }
    }

    // Close modal when a PostCard is clicked
    function handlePostCardClick() {
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <form
                onSubmit={handleSubmit(searchOnSubmit)}
                className="relative flex justify-center items-center"
            >
                <label htmlFor="search">
                    <svg
                        className="w-5 h-5 absolute top-1/2 transform -translate-y-1/2 translate-x-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </label>
                <input
                    id="search"
                    type="text"
                    {...register("searchQuery")}
                    ref={(element) => {
                        register("searchQuery").ref(element);
                        inputRef.current = element;
                    }}
                    placeholder="Search posts by title or content..."
                    aria-label="Search posts by title or content"
                    className="w-full pl-10 pr-4 py-2 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 text-gray-500 hover:text-gray-700 dark:hover:text-gray-900 rounded-full cursor-pointer focus:outline-1 focus:outline-blue-500 outline-offset-2"
                        aria-label="Clear search"
                        type="button"
                        tabIndex={0}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </form>
            <div className="max-h-96 h-fit overflow-y-auto p-2 animate-fade-in flex flex-col gap-4">
                {searchLoading && <Spinner size="2" className="mx-auto my-4" />}
                {error && (
                    <p className="text-red-500 dark:text-red-400" role="alert">
                        Error: {error}
                    </p>
                )}
                {!searchLoading &&
                    !error &&
                    searchResults.length === 0 &&
                    searchQuery && (
                        <p className="text-gray-600 dark:text-gray-400">
                            No posts found for "{searchQuery}".
                        </p>
                    )}
                {!searchLoading &&
                    !error &&
                    searchResults.length > 0 &&
                    searchResults.map((post) => (
                        <PostCard
                            key={post.$id}
                            to={`/posts/${post.$id}`}
                            title={post.title}
                            onClick={handlePostCardClick}
                        />
                    ))}
            </div>
        </div>
    );
}
