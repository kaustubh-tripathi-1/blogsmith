import appwriteConfig from "../conf/appwriteConfig";
import { Client, Account, ID, AppwriteException } from "appwrite";

/**
 * -`AuthError` class
 *
 * The class `AuthError` is a custom error class for authentication-related errors that extends the built-in `Error` class
 */
class AuthError extends Error {
    /**
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}

/**
 * -`AuthService` class
 *
 * Service for handling user authentication with Appwrite.
 */
export default class AuthService {
    #client;
    #account;

    constructor() {
        this.#client = new Client();
        try {
            this.#client
                .setEndpoint(appwriteConfig.appwriteEndpoint)
                .setProject(appwriteConfig.appwriteProjectID);

            this.#account = new Account(this.#client);
        } catch (error) {
            throw new AuthError("Failed to initialize Appwrite client");
        }
    }

    /**
     * -`validateCredentials` - Private method
     *
     * Validates email and optionally name and password.
     * @param {string} email - User's email address.
     * @param {string} password - User's password (optional if only validating email).
     * @param {string|null} [name=null] - User's name (optional, for signup).
     * @throws {AuthError} If validation fails.
     */
    #validateCredentials(email, password = null, name = null) {
        if (
            !email ||
            (password !== null && !password) ||
            (name !== null && !name)
        ) {
            throw new AuthError(
                name !== null
                    ? "Email, password, and name are required"
                    : password !== null
                    ? "Email and password are required"
                    : "Email is required"
            );
        }
        if (
            typeof email !== "string" ||
            (password !== null && typeof password !== "string") ||
            (name !== null && typeof name !== "string")
        ) {
            throw new AuthError(
                name !== null
                    ? "Email, password, and name must be strings"
                    : password !== null
                    ? "Email and password must be strings"
                    : "Email must be a string"
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new AuthError("Invalid email format");
        }
    }

    /**
     * -`signup`
     *
     * Signs up a new user and automatically logs them in.
     * @param {string} email - User's email address.
     * @param {string} password - User's password (minimum 8 characters).
     * @param {string} name - User's name.
     * @returns {Promise<object>} The created user object.
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async signUp(email, password, name) {
        email = email.trim();
        name = name.trim();
        this.#validateCredentials(email, password, name);
        if (password.length < 8 || password.length > 256) {
            throw new AuthError(`Password must be between 8 to 256 characters`);
        }
        if (name.length > 127) {
            throw new AuthError("Name must be less than 128 characters");
        }

        const user = await this.#account.create(
            ID.unique(),
            email.toLowerCase(),
            password,
            name
        );

        // Disable auto login after signup to verify email
        /* try {
            await this.login(email, password);
        } catch (error) {
            throw new AuthError(
                "User created but login failed. Please try logging in manually.",
                error.code,
                error.message
            );
        } */

        return user;
    }

    /**
     * -`login`
     *
     * Logs in a user with email and password.
     * @param {string} email - User's email address.
     * @param {string} password - User's password.
     * @returns {Promise<object>} The session object.
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async login(email, password) {
        email = email.trim();
        this.#validateCredentials(email, password);

        return this.#account.createEmailPasswordSession(
            email.toLowerCase(),
            password
        );
    }

    /**
     * -`logout`
     *
     * Logs out the current user.
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async logout() {
        return this.#account.deleteSession("current");
    }

    /**
     * -`createSession`
     *
     * Creates a user session
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async createSession(email, password) {
        email = email.trim();
        this.#validateCredentials(email, password);
        await this.#account.createEmailPasswordSession(
            email.toLowerCase(),
            password
        );
    }

    /**
     * -`deleteSession`
     *
     * Deletes the current user session
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async deleteSession() {
        await this.#account.deleteSession("current");
    }

    /**
     * -`getCurrentUser`
     *
     * Gets the current logged-in user.
     * @returns {Promise<object>} The user object.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getCurrentUser() {
        return this.#account.get();
    }

    /**
     * -`requestPasswordReset`
     *
     * Asynchronously requests a password reset by creating a
     * recovery for the provided email address.
     * @param {string} email - The user's email address.
     * @param {string} [resetURL] - The URL to redirect the user to for resetting their password. By default, if no `resetUrl` is
     * provided, it will use the current window's origin followed by `/reset-password`.
     * @returns {Promise<void>}
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async requestPasswordReset(
        email,
        resetURL = `${window.location.origin}/reset-password`
    ) {
        email = email.trim();
        this.#validateCredentials(email); // Reuse validation for email
        return this.#account.createRecovery(email.toLowerCase(), resetURL);
    }

    /**
     * -`completePasswordReset`
     * Completes the process of password reset after user enters a new one
     * @param {string} userID - The current logged in user's userID which will be added to url query string
     * @param {string} secretKey - The secret key received by the user in their email, also added to url query string
     * @param {string} newPassword - The new password to be updated
     * @returns {Promise<void>}
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async completePasswordReset(userID, secretKey, newPassword) {
        if (!userID || !secretKey || !newPassword) {
            throw new AuthError(
                `User ID, secret key and new password are required to complete the password reset process`
            );
        }

        if (typeof userID !== "string") {
            throw new AuthError(`UserID must be string`);
        }

        if (typeof secretKey !== "string") {
            throw new AuthError(`Secret Key must be string`);
        }

        if (typeof newPassword !== "string") {
            throw new AuthError(`New Password must be string`);
        }

        if (newPassword.length < 8 || newPassword.length > 256) {
            throw new AuthError("Password must be between 8 to 256 characters");
        }

        return this.#account.updateRecovery(userID, secretKey, newPassword);
    }

    /**
     * -`requestEmailVerification`
     *
     * Requests an email verification link for the current user.
     * @param {string} [verifyURL] - The URL to redirect the user to for verifying their email (defaults to "/verify-email").
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async requestEmailVerification(
        verifyURL = `${window.location.origin}/verify-email`
    ) {
        return this.#account.createVerification(verifyURL);
    }

    /**
     * -`completeEmailVerification`
     *
     * Completes the email verification process.
     * @param {string} userID - The user ID from the verification email.
     * @param {string} secretKey - The secret key from the verification email.
     * @returns {Promise<void>}
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async completeEmailVerification(userID, secretKey) {
        if (!userID || !secretKey) {
            throw new AuthError(
                "User ID and secret key are required to complete email verification"
            );
        }
        if (typeof userID !== "string") {
            throw new AuthError("User ID must be a string");
        }
        if (typeof secretKey !== "string") {
            throw new AuthError("Secret key must be a string");
        }
        return this.#account.updateVerification(userID, secretKey);
    }

    /**
     * -`updateEmail`
     *
     * Updates the email of the current user.
     * @param {string} email - The new email address for the user.
     * @param {string} currentPassword - The user's current password (required for security).
     * @returns {Promise<object>} - The updated user object
     * @throws {AuthError} If validation fails or current password is missing.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updateEmail(email, currentPassword) {
        email = email.trim();
        this.#validateCredentials(email);
        if (!currentPassword || typeof currentPassword !== "string") {
            throw new AuthError(
                `Current password is required to update the email and must be string`
            );
        }
        return this.#account.updateEmail(email.toLowerCase(), currentPassword);
    }

    /**
     * -`updateName`
     *
     * Updates the name of the current user
     * @param {string} nameToUpdate - The name to be updated for the user
     * @returns {Promise<object>} - The updated user object
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updateName(nameToUpdate) {
        nameToUpdate = nameToUpdate.trim();

        if (!nameToUpdate || typeof nameToUpdate !== "string") {
            throw new AuthError(
                `Name is required to update name and must be string`
            );
        }

        if (nameToUpdate.length > 127) {
            throw new AuthError("Name must be less than 128 characters");
        }

        return this.#account.updateName(nameToUpdate);
    }

    /**
     * -`updatePassword`
     *
     * Updates the password of the current user
     * @param {string} newPassword - The password to be updated for the user
     * @param {string} currentPassword - The current password of the user
     * @returns {Promise<object>} - The updated user object
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updatePassword(newPassword, currentPassword) {
        if (!newPassword || typeof newPassword !== `string`) {
            throw new AuthError(`New Password is required to update password`);
        }
        if (!currentPassword || typeof currentPassword !== `string`) {
            throw new AuthError(
                `Current Password is required to update password`
            );
        }

        if (newPassword.length < 8 || newPassword.length > 256) {
            throw new AuthError("Password must be between 8 to 256 characters");
        }

        return this.#account.updatePassword(newPassword, currentPassword);
    }

    /**
     * -`checkSession`
     *
     * Checks if the current session is valid.
     * @returns {Promise<boolean>} True if the session is valid, false otherwise.
     */
    async checkSession() {
        try {
            await this.#account.getSession("current");
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * -`refreshSession`
     *
     * Refreshes the current session to extend its lifetime.
     * @returns {Promise<object>} The updated session object.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async refreshSession() {
        return this.#account.updateSession("current");
    }

    /**
     * -`updatePreferences`
     *
     * Updates the preferences of the current user.
     * @param {Object} preferences - The preferences to update (e.g., { theme: "dark", notifications: true }).
     * @returns {Promise<object>} The updated preferences object.
     * @throws {AuthError} If preferences are invalid.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updatePreferences(preferences) {
        if (!preferences || typeof preferences !== "object") {
            throw new AuthError("Preferences must be a non-empty object");
        }
        return this.#account.updatePrefs(preferences);
    }

    /**
     * -`getPreferences`
     *
     * Gets the preferences of the current user.
     * @returns {Promise<object>} The user's preferences object.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getPreferences() {
        return this.#account.getPrefs();
    }
}

export const authService = new AuthService();
