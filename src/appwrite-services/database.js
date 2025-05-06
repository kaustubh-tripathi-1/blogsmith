import appwriteConfig from "../conf/appwriteConfig";
import { Client, AppwriteException, Databases, Query } from "appwrite";

/**
 * -`DatabaseError` class
 *
 * The class `DatabaseError` is a custom error class for database-related errors that extends the built-in `Error` class
 */
class DatabaseError extends Error {
    /**
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = "DatabaseError";
    }
}

/**
 * -`DatabaseService` class
 *
 * Service for handling databases with Appwrite.
 */
export class DatabaseService {
    #client;
    #databases;

    /**
     * Initializes the Appwrite client and Databases service.
     * @throws {DatabaseError} If the Appwrite client fails to initialize.
     */
    constructor() {
        this.#client = new Client();

        try {
            this.#client
                .setEndpoint(appwriteConfig.appwriteEndpoint)
                .setProject(appwriteConfig.appwriteProjectID);

            this.#databases = new Databases(this.#client);
        } catch (error) {
            throw new DatabaseError("Failed to initialize Appwrite client");
        }
    }

    /**
     * Private method to validate a string
     * @param {string} string - The string to validate
     * @returns {boolean} Returns a boolean value, true if the string failed validation and false otherwise
     */
    #validateString(string) {
        if (!string || typeof string !== "string") {
            return true;
        }

        return false;
    }

    /**
     * Creates a new post document in the database.
     * @param {Object} postData - The post data to create.
     * @param {string} postData.title - The title of the post.
     * @param {string} postData.slug - The unique slug for the post (used as document ID).
     * @param {string} postData.content - The content of the post.
     * @param {string} postData.featureImage - The ID of the featured image.
     * @param {string} postData.status - The status of the post (e.g., "active", "inactive").
     * @param {string} postData.userID - The ID of the user who created the post.
     * @returns {Promise<object>} Returns a promise that resolves to the created document object.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async createPost({
        title,
        slug,
        content,
        featureImage,
        status,
        userID,
        authorName,
    }) {
        //$ Validations
        if (this.#validateString(slug) || slug.length > 36) {
            throw new DatabaseError(
                "Slug must be a non-empty string and lest than 36 characters as per Appwrite docs"
            );
        }
        if (this.#validateString(title)) {
            throw new DatabaseError("Title must be a non-empty string");
        }
        if (this.#validateString(content)) {
            throw new DatabaseError("Content must be a non-empty string");
        }
        if (this.#validateString(status)) {
            throw new DatabaseError("Status must be a non-empty string");
        }
        if (this.#validateString(userID)) {
            throw new DatabaseError("User ID must be a non-empty string");
        }
        if (this.#validateString(featureImage)) {
            throw new DatabaseError(
                "Feature image must be a string if provided"
            );
        }
        if (this.#validateString(authorName)) {
            throw new DatabaseError(
                "Author name image must be a string if provided"
            );
        }

        return this.#databases.createDocument(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            slug, // slug instead of ID.unique()
            {
                title,
                content,
                featureImage,
                status,
                userID,
                authorName,
            }
        );
    }

    /**
     * Updates an existing post document in the database.
     * @param {string} slug - The slug (document ID) of the post to update.
     * @param {Object} postData - The post data to update.
     * @param {string} postData.title - The updated title of the post.
     * @param {string} postData.content - The updated content of the post.
     * @param {string} postData.featureImage - The updated ID of the featured image.
     * @param {string} postData.status - The updated status of the post.
     * @param {string} postData.userID - The ID of the user who created the post (not updated).
     * @returns {Promise<object>} Returns a promise that resolves to the updated document object.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updatePost(slug, { title, content, featureImage, status }) {
        //$ Validations
        if (this.#validateString(slug)) {
            throw new DatabaseError(
                "Document ID/slug must be a non-empty string"
            );
        }
        if (slug.length > 36) {
            throw new DatabaseError(
                "Document ID/slug must be a less than 37 characters"
            );
        }
        if (this.#validateString(title)) {
            throw new DatabaseError("Title must be a string if provided");
        }
        if (this.#validateString(content)) {
            throw new DatabaseError("Content must be a string if provided");
        }
        if (this.#validateString(featureImage)) {
            throw new DatabaseError(
                "Feature image must be a string if provided"
            );
        }
        if (this.#validateString(status)) {
            throw new DatabaseError("Status must be a string if provided");
        }

        return this.#databases.updateDocument(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            slug,
            {
                title,
                content,
                featureImage,
                status,
            }
        );
    }

    /**
     * Retrieves a list of all posts from the database.
     * @returns {Promise<object>} Returns a promise that resolves to an object containing a list of documents (e.g., { documents: [...] }).
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getAllPosts() {
        return this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID
        );
    }

    /**
     * Retrieves a single post by its slug.
     * @param {string} slug - The slug (document ID) of the post to retrieve.
     * @returns {Promise<object>} Returns a promise that resolves to the document object.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getPost(slug) {
        if (this.#validateString(slug)) {
            throw new DatabaseError(
                `Document ID/slug provided must be a non-empty string`
            );
        }

        return this.#databases.getDocument(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            slug
        );
    }

    /**
     * Deletes a post by its slug.
     * @param {string} slug - The slug (document ID) of the post to delete.
     * @returns {Promise<void>} Returns a promise that resolves when the document is deleted.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async deletePost(slug) {
        if (this.#validateString(slug)) {
            throw new DatabaseError(
                "Document ID/slug must be a non-empty string"
            );
        }

        return this.#databases.deleteDocument(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            slug
        );
    }

    /**
     * Retrieves a list of active posts from the database.
     * @returns {Promise<object>} Returns a promise that resolves to an object containing a list of active documents (e.g., { documents: [...] }).
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getActivePosts() {
        return this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            [Query.equal("status", "active")]
        );
    }

    /**
     * Retrieves a list of posts of a user from the database.
     * @returns {Promise<object>} Returns a promise that resolves to an object containing a list of user documents (e.g., { documents: [...] }).
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getUserPosts(userID) {
        return this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            [Query.equal("userID", userID)]
        );
    }

    /**
     * Searches for posts matching the query in title or content, only returning active posts.
     * @param {string} query - The search query.
     * @returns {Promise<object[]>} Array of matching post documents.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async searchPosts(query) {
        if (this.#validateString(query)) {
            throw new DatabaseError("Search query must be a non-empty string");
        }

        try {
            // Search by title (requires fulltext index)
            const titleResponse = await this.#databases.listDocuments(
                appwriteConfig.appwriteDatabaseID,
                appwriteConfig.appwriteCollectionID,
                [Query.search("title", query), Query.equal("status", "active")]
            );

            // Search by content (requires fulltext index)
            const contentResponse = await this.#databases.listDocuments(
                appwriteConfig.appwriteDatabaseID,
                appwriteConfig.appwriteCollectionID,
                [
                    Query.search("content", query),
                    Query.equal("status", "active"),
                ]
            );

            // Combine and deduplicate results
            const combinedResults = [
                ...titleResponse.documents,
                ...contentResponse.documents.filter(
                    (doc) =>
                        !titleResponse.documents.some(
                            (titleDoc) => titleDoc.$id === doc.$id
                        )
                ),
            ];

            return combinedResults;
        } catch (error) {
            throw new AppwriteException(
                `Failed to search posts: ${error.message}`
            );
        }
    }

    /**
     * Retrieves a paginated list of active posts from the database with limit and offset.
     * @param {Object} options - Pagination options.
     * @param {number} [options.limit=10] - Number of posts to fetch per page.
     * @param {number} [options.offset=0] - Offset for pagination.
     * @returns {Promise<object>} Returns a promise that resolves to an object containing a list of active documents (e.g., { documents: [...] }).
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getActivePostsWithLimit({ limit = 10, offset = 0 } = {}) {
        return this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            [
                Query.equal("status", "active"),
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc("$createdAt"),
            ]
        );
    }

    /**
     * Retrieves a paginated list of posts for a specific user from the database with limit and offset.
     * @param {string} userID - The ID of the user whose posts to retrieve.
     * @param {Object} options - Pagination options.
     * @param {number} [options.limit=10] - Number of posts to fetch per page.
     * @param {number} [options.offset=0] - Offset for pagination.
     * @returns {Promise<object>} Returns a promise that resolves to an object containing a list of user documents (e.g., { documents: [...] }).
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getUserPostsWithLimit(userID, { limit = 10, offset = 0 } = {}) {
        if (this.#validateString(userID)) {
            throw new DatabaseError("User ID must be a non-empty string");
        }

        return this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteCollectionID,
            [
                Query.equal("userID", userID),
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc("$createdAt"),
            ]
        );
    }
}

export const databaseService = new DatabaseService();
