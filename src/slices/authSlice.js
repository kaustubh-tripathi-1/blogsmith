import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../appwrite-services/auth";
import { addNotification } from "./uiSlice"; // Import to dispatch notifications

/**
 * Logs in a user using Appwrite AuthService.
 * @param {Object} credentials - The user's login credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<Object>} The logged-in user's data.
 */
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            // Validation
            if (!credentials.email || !credentials.password) {
                throw new Error("Email and password are required");
            }
            await authService.login(credentials.email, credentials.password);

            // Get user data as login method returns session data
            const userData = await authService.getCurrentUser();

            if (userData?.prefs?.notifications && userData?.emailVerification) {
                dispatch(
                    addNotification({
                        message: "Logged in successfully",
                        type: "success",
                    })
                );
            }
            return userData;
        } catch (error) {
            if (error.code === 429) {
                return rejectWithValue(
                    `Too many login attempts. Please try again after some time`
                );
            }
            if (error.code === 400 || error.code === 401) {
                return rejectWithValue("Invalid email or password");
            }
            dispatch(
                addNotification({
                    message: error.message || "Login failed",
                    type: "error",
                })
            );
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Logs out the current user using Appwrite AuthService.
 * @returns {Promise<void>}
 */
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { getState, dispatch, rejectWithValue }) => {
        const notifications = getState().user.preferences?.notifications;
        try {
            await authService.logout();
            if (notifications) {
                dispatch(
                    addNotification({
                        message: "Logged out successfully",
                        type: "success",
                    })
                );
            }
            return;
        } catch (error) {
            if (error.code === 401) {
                // Session already gone, treat as success
                if (notifications) {
                    dispatch(
                        addNotification({
                            message: "Logged out successfully",
                            type: "success",
                        })
                    );
                }
                return;
            }
            if (notifications) {
                dispatch(
                    addNotification({
                        message:
                            error.message || "Logout failed, please try again",
                        type: "error",
                    })
                );
            }
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Checks the current authentication status and fetches the current user.
 * @returns {Promise<Object|null>} The current user's data, or null if not logged in.
 */
export const checkAuthStatus = createAsyncThunk(
    "auth/checkAuthStatus",
    async (_, { rejectWithValue }) => {
        try {
            const userData = await authService.getCurrentUser();
            return userData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Sign ups the user.
 * @param {Object} userData - Email, password, and name.
 * @returns {Promise<Object>} User data.
 */
export const signupUser = createAsyncThunk(
    "auth/signupUser",
    async ({ email, password, name }, { rejectWithValue }) => {
        try {
            const user = await authService.signUp(email, password, name);
            return user;
        } catch (error) {
            if (error.type === `user_already_exists`) {
                return rejectWithValue(
                    "A user already exists with the same email! Please login."
                );
            }

            return rejectWithValue(error.message);
        }
    }
);

/**
 * Creates a temporary session.
 * @param {Object} credentials - Email and password.
 * @returns {Promise<boolean>} Success status.
 */
export const createTempSession = createAsyncThunk(
    "auth/createTempSession",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            await authService.createSession(email, password);
            return true;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create session");
        }
    }
);

/**
 * Deletes the current session.
 * @returns {Promise<boolean>} Success status.
 */
export const deleteSession = createAsyncThunk(
    "auth/deleteSession",
    async (_, { rejectWithValue }) => {
        try {
            await authService.deleteSession();
            return true;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete session");
        }
    }
);

/**
 * Requests a password reset email.
 * @param {string} email - User's email.
 * @returns {Promise<boolean>} Success status.
 */
export const requestPasswordReset = createAsyncThunk(
    "auth/requestPasswordReset",
    async (email, { rejectWithValue }) => {
        try {
            await authService.requestPasswordReset(
                email,
                `${window.location.origin}/reset-password`
            );
            return true;
        } catch (error) {
            return rejectWithValue(
                error.message || "Failed to send reset email"
            );
        }
    }
);

/**
 * Completes password reset process.
 * @param {Object} data - userId, secret, and newPassword.
 * @returns {Promise<boolean>} Success status.
 */
export const completePasswordReset = createAsyncThunk(
    "auth/completePasswordReset",
    async ({ userID, secret, newPassword }, { rejectWithValue }) => {
        try {
            await authService.completePasswordReset(
                userID,
                secret,
                newPassword
            );
            return true;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to reset password");
        }
    }
);

/**
 * Requests an email verification link.
 * @returns {Promise<boolean>} Success status.
 */
export const requestEmailVerification = createAsyncThunk(
    "auth/requestEmailVerification",
    async (_, { rejectWithValue }) => {
        try {
            await authService.requestEmailVerification(
                `${window.location.origin}/verify-email`
            );
            return true;
        } catch (error) {
            return rejectWithValue(
                error.message || "Failed to send verification email"
            );
        }
    }
);

/**
 * Completes email verification.
 * @param {Object} data - userId and secret.
 * @returns {Promise<boolean>} Success status.
 */
export const completeEmailVerification = createAsyncThunk(
    "auth/completeEmailVerification",
    async ({ userID, secret }, { rejectWithValue }) => {
        try {
            await authService.completeEmailVerification(userID, secret);
            return true;
        } catch (error) {
            // return rejectWithValue(error.message || "Failed to verify email");
            return rejectWithValue(error || "Failed to verify email");
        }
    }
);

/**
 * Initial State for the auth slice
 * @typedef {Object} AuthState
 * @property {boolean} authStatus - Indicates if the user is authenticated.
 * @property {Object|null} userData - The authenticated user's data (e.g., { $id, email, name }).
 * @property {boolean} loading - Indicates if an auth operation is in progress.
 * @property {string|null} error - Stores error messages from auth operations.
 */
const initialState = {
    authStatus: false,
    userData: null,
    loading: false,
    initialLoading: false, // For initial auth check
    error: null,
};

/**
 * Redux slice for managing authentication state.
 */
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        /**
         * Sets the user as logged in and stores their data.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object} action.payload - The user's data.
         */
        login: (state, action) => {
            state.authStatus = true;
            state.userData = action.payload;
            state.loading = false;
            state.error = null;
        },
        /**
         * Logs out the user and clears their data.
         * @param {AuthState} state - The current state.
         */
        logout: (state) => {
            state.authStatus = false;
            state.userData = null;
            state.loading = false;
            state.error = null;
        },
        /**
         * Sets the loading state.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The loading state.
         */
        setLoading: (state, action) => {
            state.loading = action.payload;
            state.error = null;
        },
        setInitialLoading: (state, action) => {
            state.initialLoading = action.payload;
            state.error = null;
        },
        /**
         * Sets an error message.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {string|null} action.payload - The error message or null.
         */
        setError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login User
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.authStatus = true;
                state.userData = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout User
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.authStatus = false;
                state.userData = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Auth Status
            .addCase(checkAuthStatus.pending, (state) => {
                state.initialLoading = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.initialLoading = false;
                if (action.payload) {
                    state.authStatus = true;
                    state.userData = action.payload;
                } else {
                    state.authStatus = false;
                    state.userData = null;
                }
            })
            .addCase(checkAuthStatus.rejected, (state, action) => {
                state.initialLoading = false;
                state.authStatus = false;
                state.userData = null;
                state.error = action.payload;
            })
            // Signup
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Temporary Session
            .addCase(createTempSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTempSession.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createTempSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Session
            .addCase(deleteSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSession.fulfilled, (state) => {
                state.loading = false;
                state.authStatus = false;
                state.userData = null;
            })
            .addCase(deleteSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Request Password Reset
            .addCase(requestPasswordReset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestPasswordReset.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(requestPasswordReset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Complete Password Reset
            .addCase(completePasswordReset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completePasswordReset.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(completePasswordReset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Request Email Verification
            .addCase(requestEmailVerification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestEmailVerification.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(requestEmailVerification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Complete Email Verification
            .addCase(completeEmailVerification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeEmailVerification.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(completeEmailVerification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            });
    },
});

export const { login, logout, setLoading, setInitialLoading, setError } =
    authSlice.actions;
export default authSlice.reducer;
