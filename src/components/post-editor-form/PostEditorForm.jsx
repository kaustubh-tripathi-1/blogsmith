import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import {
    createPost,
    updatePost,
    setTitle,
    setContent,
    setStatus,
    setFeatureImage,
    setIsEditing,
    resetEditor,
    setError,
} from "../../slices/postEditorSlice";
import {
    clearUploadedFiles,
    uploadFeatureImage,
} from "../../slices/storageSlice";
import { fetchPostBySlug, setCurrentPost } from "../../slices/postsSlice";
import { Spinner, BlogEditor } from "../componentsIndex";
import { storageService } from "../../appwrite-services/storage";
import { addNotification, openModal } from "../../slices/uiSlice";

/**
 * Form for creating or editing blog posts with Appwrite.
 * @returns {JSX.Element} The post editor form.
 */
export default function PostEditorForm() {
    const { userData } = useSelector((state) => state.auth);
    const {
        slug: initialSlug,
        title,
        content,
        featureImage,
        status,
        isEditing,
        loading,
        error,
    } = useSelector((state) => state.postEditor);
    const { uploading } = useSelector((state) => state.storage);
    const { preferences } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { slug } = useParams(); // For editing mode
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        trigger,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            slug: isEditing ? initialSlug : "",
            title: "",
            content: "",
            featureImage: "",
            status: "active",
        },
    });

    useEffect(() => {
        if (slug) {
            // Editing mode
            dispatch(setIsEditing(true));
            dispatch(fetchPostBySlug(slug)).then((action) => {
                if (action.meta.requestStatus === "fulfilled") {
                    const fetchedPost = action.payload;
                    // Update Redux
                    dispatch(setTitle(fetchedPost.title));
                    dispatch(setContent(fetchedPost.content));
                    dispatch(setFeatureImage(fetchedPost.featureImage || ""));
                    dispatch(setStatus(fetchedPost.status));
                    // Update Form states
                    setValue("title", fetchedPost.title, {
                        shouldValidate: true,
                    });
                    setValue("slug", fetchedPost.$id, { shouldValidate: true });
                    setValue("featureImage", fetchedPost.featureImage, {
                        shouldValidate: true,
                    });
                    setValue("content", fetchedPost.content, {
                        shouldValidate: true,
                    });
                    setValue("status", fetchedPost.status, {
                        shouldValidate: true,
                    });
                    // Trigger validation
                    trigger();
                }
                dispatch(setCurrentPost(null));
            });
        } else {
            // Create mode
            dispatch(setIsEditing(false));
            dispatch(resetEditor());
        }

        return () => {
            dispatch(resetEditor());
        };
    }, [slug, dispatch, navigate, setValue]);

    /**
     * Handles post creation or update on form submission.
     * @param {Object} data - The post data.
     */
    async function createPostOnSubmit(data) {
        try {
            const postData = {
                title: data.title,
                slug: data.slug,
                content: data.content,
                featureImage: data.featureImage || featureImage,
                status: data.status,
                userID: userData.$id,
                authorName: userData.name,
            };

            dispatch(setTitle(data.title));
            dispatch(setContent(data.content));
            dispatch(setFeatureImage(postData.featureImage));
            dispatch(setStatus(data.status));

            if (isEditing) {
                await dispatch(updatePost(postData)).unwrap();
            } else {
                await dispatch(createPost(postData)).unwrap();
            }
            dispatch(clearUploadedFiles());

            if (preferences?.notifications) {
                dispatch(
                    addNotification({
                        message: `${
                            isEditing
                                ? "Post updated successfully"
                                : "Post created successfully"
                        }`,
                        type: "success",
                    })
                );
            }

            navigate(`/posts/${data.slug}`); // Redirect to post detail page
        } catch (error) {
            dispatch(setError(error || "Failed to save post"));
            if (preferences?.notifications) {
                dispatch(
                    addNotification({
                        message: error || "Failed to save post",
                        type: "error",
                    })
                );
            }
            console.error(error);
        }
    }

    /**
     * Handles file upload for featured image.
     * @param {Event} event - The file input change event.
     */
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                const fileData = await dispatch(
                    uploadFeatureImage(file)
                ).unwrap();
                dispatch(setFeatureImage(fileData));
                setValue("featureImage", fileData.$id, {
                    shouldValidate: true,
                });
                if (preferences?.notifications) {
                    dispatch(
                        addNotification({
                            message: "Featured Image uploaded successfully",
                            type: "success",
                        })
                    );
                }
            } catch (error) {
                console.error("File upload error:", error);
                dispatch(setError(error || "Failed to upload image"));
                if (preferences?.notifications) {
                    dispatch(
                        addNotification({
                            message: error || "Failed to upload image",
                            type: "error",
                        })
                    );
                }
            }
        }
    }

    /**
     * Opens Delete Post Modal
     */
    function openDeletePostModal() {
        setIsDeleting(true);
        try {
            dispatch(
                openModal({
                    type: "delete-post",
                    data: { postID: slug, featureImage, shouldNavigate: true },
                })
            );
        } finally {
            setIsDeleting(false);
        }
    }

    function navigateBackToPostDetail() {
        navigate(`/posts/${slug}`);
    }

    let imageData = null;
    if (typeof featureImage === `string`) {
        imageData = featureImage
            ? storageService.getFileView(featureImage)
            : null;
    } else {
        imageData = featureImage
            ? storageService.getFileView(featureImage.$id)
            : null;
    }

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    {isEditing ? "Edit Post" : "Create a New Post"}
                </h1>
                <form
                    onSubmit={handleSubmit(createPostOnSubmit)}
                    className="space-y-6"
                >
                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                        >
                            Title{" "}
                            <sup
                                className="text-red-600"
                                title="required field"
                            >
                                *
                            </sup>
                        </label>
                        <input
                            id="title"
                            type="text"
                            {...register("title", {
                                required: "Title is required",
                                maxLength: {
                                    value: 36,
                                    message:
                                        "Title must be less than 37 characters",
                                },
                                onChange: (event) => {
                                    const titleValue =
                                        event.target.value.trim();
                                    dispatch(setTitle(titleValue));
                                    const slugValue = titleValue
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, "-")
                                        .trim()
                                        .replace(/-+/g, "-")
                                        .trim("-");
                                    setValue("slug", slugValue, {
                                        shouldValidate: true,
                                    });
                                    trigger("slug");
                                },
                            })}
                            className={`w-full px-3 py-2 border ${
                                errors.title
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Slug */}
                    <div>
                        <label
                            htmlFor="slug"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                        >
                            Slug (non-editable, generated from Title){" "}
                            <sup
                                className="text-red-600"
                                title="required field"
                            >
                                *
                            </sup>
                        </label>
                        <input
                            id="slug"
                            type="text"
                            value={watch("slug") || ""} // Bind to form state
                            {...register("slug", {
                                required: "Slug is required",
                                pattern: {
                                    value: /^[a-z0-9-]+$/,
                                    message:
                                        "Slug must be lowercase letters, numbers, or hyphens",
                                },
                                maxLength: {
                                    value: 36,
                                    message:
                                        "Slug must be less than 37 characters",
                                },
                            })}
                            className={`w-full px-3 py-2 border ${
                                errors.slug
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed transition-all duration-300`}
                            readOnly
                        />
                        {errors.slug && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.slug.message}
                            </p>
                        )}
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label
                            htmlFor="featureImage"
                            className="block w-2/6 text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                        >
                            Featured Image{" "}
                            <sup
                                className="text-red-600"
                                title="required field"
                            >
                                *
                            </sup>
                        </label>
                        <input
                            id="featureImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="w-fit px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 cursor-pointer file:mr-[20%] file:rounded-lg file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-800 hover:file:bg-gray-300 dark:file:bg-gray-800 dark:file:text-violet-100 dark:hover:file:bg-gray-500 transition-all duration-300"
                            disabled={loading}
                        />
                        {uploading && (
                            <span className="w-3/24 flex flex-col md:flex-row justify-between items-center mt-1">
                                <p className=" text-sm text-gray-600 dark:text-gray-400">
                                    Uploading...
                                </p>
                                <Spinner size="1" />
                            </span>
                        )}
                        {featureImage && featureImage.name ? (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Uploaded: {featureImage.name}
                            </p>
                        ) : null}
                        {imageData && (
                            <div className="my-6">
                                <p>Current Feature Image</p>
                                <img
                                    src={imageData?.href}
                                    alt={
                                        title ||
                                        featureImage ||
                                        "Error in fetching image"
                                    }
                                    className="w-2/6 h-fit object-contain rounded-md mt-2 mb-6"
                                />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Content{" "}
                            <sup
                                className="text-red-600"
                                title="required field"
                            >
                                *
                            </sup>
                        </label>
                        <BlogEditor
                            {...register("content", {
                                required: "Content is required",
                            })}
                            initialValue={content}
                            control={control}
                        />
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.content.message}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                        >
                            Status{" "}
                            <sup
                                className="text-red-600"
                                title="required field"
                            >
                                *
                            </sup>
                        </label>
                        <select
                            id="status"
                            {...register("status", {
                                required: "Status is required",
                            })}
                            onChange={(e) =>
                                dispatch(setStatus(e.target.value))
                            }
                            className={`w-full px-3 py-2 border ${
                                errors.status
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } shadow-sm hover:shadow-lg dark:shadow-cyan-800/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300`}
                            disabled={loading}
                        >
                            <option value="active">Published</option>
                            <option value="inactive">Draft</option>
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.status.message}
                            </p>
                        )}
                    </div>

                    {/* Delete Button (Edit Mode) */}
                    {isEditing && (
                        <button
                            type="button"
                            onClick={openDeletePostModal}
                            disabled={isDeleting || loading}
                            className="w-full bg-red-500 hover:bg-red-700 text-white py-3 rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {isDeleting ? (
                                <>
                                    Deleting...
                                    <Spinner size="1" className="ml-2" />
                                </>
                            ) : (
                                "Delete Post"
                            )}
                        </button>
                    )}

                    {/* Cancel Button when Editing */}
                    {isEditing && (
                        <button
                            type="button"
                            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center"
                            onClick={navigateBackToPostDetail}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                {isEditing ? "Updating..." : "Creating..."}
                                <Spinner size="1" className="ml-2" />{" "}
                            </>
                        ) : isEditing ? (
                            "Update Post"
                        ) : (
                            "Create Post"
                        )}
                    </button>
                    {/* Redux Error Display */}
                    {error && (
                        <p
                            className="text-center text-red-500 dark:text-red-400"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}
