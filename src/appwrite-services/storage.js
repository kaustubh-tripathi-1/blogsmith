import appwriteConfig from "../conf/appwriteConfig";
import { Client, Storage, ID, AppwriteException } from "appwrite";

/**
 * Custom error class for storage-related errors.
 */
class StorageError extends Error {
    /**
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = "StorageError";
    }
}

/**
 * Service for handling file storage operations with Appwrite.
 */
export class StorageService {
    #client;
    #storage;

    /**
     * Initializes the Appwrite client and Storage service.
     * @throws {StorageError} If the Appwrite client fails to initialize.
     */
    constructor() {
        this.#client = new Client();

        try {
            this.#client
                .setEndpoint(appwriteConfig.appwriteEndpoint)
                .setProject(appwriteConfig.appwriteProjectID);

            this.#storage = new Storage(this.#client);
        } catch (error) {
            throw new StorageError("Failed to initialize Appwrite client");
        }
    }

    /**
     * Uploads a file to the Appwrite storage bucket.
     * @param {File} file - The file to upload (must be a File object).
     * @returns {Promise<object>} Returns a promise that resolves to the created file object (e.g., { $id: "file-id", name: "filename", ... }).
     * @throws {StorageError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async uploadFile(file) {
        if (!file) {
            throw new StorageError(`No file provided for upload`);
        }

        if (!(file instanceof File)) {
            throw new StorageError("File must be a valid File object");
        }

        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            throw new StorageError(
                "File size exceeds the maximum allowed limit of 10MB"
            );
        }

        return this.#storage.createFile(
            appwriteConfig.appwriteBucketID,
            ID.unique(),
            file
        );
    }

    /**
     * Generates a preview URL for a file in the Appwrite storage bucket with tranformation. (Available in paid plan of Appwrite)
     * @param {string} fileID - The ID of the file to generate a preview for.
     * @returns {string} Returns the URL (object) for the file preview with the href property being the actual url.
     * @throws {StorageError} If validation fails.
     */
    getFilePreview(fileID) {
        if (!fileID || typeof fileID !== `string`) {
            throw new StorageError(`File ID must be a non-empty string`);
        }

        return this.#storage.getFilePreview(
            appwriteConfig.appwriteBucketID,
            fileID
        );
    }

    /**
     * Generates a preview URL for a file in the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to generate a preview for.
     * @returns {object} Returns the raw file data without tranformations.
     * @throws {StorageError} If validation fails.
     */
    getFileView(fileID) {
        if (!fileID || typeof fileID !== "string") {
            throw new StorageError("File ID must be a non-empty string");
        }
        return this.#storage.getFileView(
            appwriteConfig.appwriteBucketID,
            fileID
        );
    }

    /**
     * Retrieves metadata for a file in the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to retrieve.
     * @returns {Promise<object>} Returns a promise that resolves to the file metadata object (e.g., { $id: "file-id", name: "filename", ... }).
     * @throws {StorageError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getFileData(fileID) {
        if (!fileID || typeof fileID !== "string") {
            throw new StorageError("File ID must be a non-empty string");
        }

        return this.#storage.getFile(appwriteConfig.appwriteBucketID, fileID);
    }

    /**
     * Downloads a file from the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to download.
     * @returns {Promise<Blob>} Returns a promise that resolves to the file content as a Blob.
     * @throws {StorageError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async downloadFile(fileID) {
        if (!fileID || typeof fileID !== "string") {
            throw new StorageError("File ID must be a non-empty string");
        }

        return this.#storage.getFileDownload(
            appwriteConfig.appwriteBucketID,
            fileID
        );
    }

    /**
     * Deletes a file from the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to delete.
     * @returns {Promise<void>} Returns a promise that resolves when the file is deleted.
     * @throws {StorageError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async deleteFile(fileID) {
        if (!fileID || typeof fileID !== `string`) {
            throw new StorageError(`File ID must be a non-empty string`);
        }

        return this.#storage.deleteFile(
            appwriteConfig.appwriteBucketID,
            fileID
        );
    }
}

export const storageService = new StorageService();
