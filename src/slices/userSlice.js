import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../appwrite-services/auth";
import { databaseService } from "../appwrite-services/database";
import { setTheme } from "./uiSlice"; // Import setTheme to sync theme with uiSlice
import { logoutUser } from "./authSlice";

/**
 * Fetches the user's profile from Appwrite.
 * @returns {Promise<Object>} The user's profile data (e.g., { name, email }).
 */
export const fetchProfile = createAsyncThunk(
    "user/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const profile = await authService.getCurrentUser();
            return profile;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetches the user's preferences from Appwrite.
 * @returns {Promise<Object>} The user's preferences (e.g., { theme, notifications }).
 */
export const fetchPreferences = createAsyncThunk(
    "user/fetchPreferences",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const preferences = await authService.getPreferences();
            // Sync theme with uiSlice if preferences include a theme
            if (preferences.theme) {
                dispatch(setTheme(preferences.theme));
            }
            return preferences;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Updates the user's preferences in Appwrite.
 * @param {Object} preferencesData - The updated preferences (e.g., { theme, notifications }).
 * @returns {Promise<Object>} The updated preferences.
 */
export const updatePreferences = createAsyncThunk(
    "user/updatePreferences",
    async (preferencesData, { rejectWithValue, dispatch }) => {
        try {
            // Validation
            if (
                !preferencesData.theme ||
                typeof preferencesData.notifications !== "boolean"
            ) {
                throw new Error(
                    "Theme and notifications preference are required"
                );
            }
            const userData = await authService.updatePreferences(
                preferencesData
            );
            return userData.prefs;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Updates the user's name in Appwrite.
 * @param {string} nameToUpdate - The new name.
 * @returns {Promise<Object>} The updated user data.
 */
export const updateName = createAsyncThunk(
    "user/updateName",
    async (nameToUpdate, { rejectWithValue }) => {
        try {
            const userData = await authService.updateName(nameToUpdate);
            return userData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Updates the user's email in Appwrite.
 * @param {Object} payload - The email and current password.
 * @param {string} payload.email - The new email.
 * @param {string} payload.currentPassword - The current password.
 * @returns {Promise<Object>} The updated user data.
 */
export const updateEmail = createAsyncThunk(
    "user/updateEmail",
    async ({ emailToUpdate, currentPassword }, { rejectWithValue }) => {
        try {
            const userData = await authService.updateEmail(
                emailToUpdate,
                currentPassword
            );
            return userData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Updates the user's password in Appwrite.
 * @param {Object} payload - The new and current passwords.
 * @param {string} payload.newPassword - The new password.
 * @param {string} payload.currentPassword - The current password.
 * @returns {Promise<Object>} The updated user data.
 */
export const updatePassword = createAsyncThunk(
    "user/updatePassword",
    async ({ newPassword, currentPassword }, { rejectWithValue }) => {
        try {
            const userData = await authService.updatePassword(
                newPassword,
                currentPassword
            );
            return userData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetches the user's posts from Appwrite with pagination.
 * @param {string} userID - The ID of the user.
 * @returns {Promise<Array>} Array of the user's posts.
 */
export const fetchUserPosts = createAsyncThunk(
    "user/fetchUserPosts",
    async (userID, { rejectWithValue }) => {
        try {
            const userPosts = await databaseService.getUserPostsWithLimit(
                userID,
                {
                    limit: 10,
                    offset: 0,
                }
            );
            return userPosts.documents;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetches more user posts for infinite scrolling.
 * @param {string} userID - The ID of the user.
 * @returns {Promise<Array>} Array of additional user posts.
 */
export const fetchMoreUserPosts = createAsyncThunk(
    "user/fetchMoreUserPosts",
    async (userID, { getState, rejectWithValue }) => {
        const { offset } = getState().user;
        try {
            const userPosts = await databaseService.getUserPostsWithLimit(
                userID,
                {
                    limit: 10,
                    offset: offset + 10,
                }
            );
            return userPosts.documents;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Initial State for the user slice
 */
const initialState = {
    profile: null, // e.g., { name: "John Doe", email: "john@example.com" }
    preferences: null, // e.g., { theme: "dark", notifications: true }
    userPosts: [],
    loading: false, // global loading
    infiniteScrollLoading: false, // Separate loading for fetching more posts during infinite scroll
    userPostsLoading: false, // Separate loading for fetching user posts
    offset: 0, // Tracks the current offset for pagination
    hasMore: true, // Indicates if there are more posts to fetch
    error: null,
};

/**
 * Redux slice for managing user profile and preferences.
 */
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        /**
         * Sets the user's profile.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object} action.payload - The user's profile data.
         */
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        /**
         * Sets the user's preferences.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object} action.payload - The user's preferences.
         */
        setPreferences: (state, action) => {
            state.preferences = action.payload;
        },
        /**
         * Sets the loading state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The loading state.
         */
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        /**
         * Sets the infiniteScrollLoading state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The infiniteScrollLoading state.
         */
        setInfiniteScrollLoading: (state, action) => {
            state.infiniteScrollLoading = action.payload;
        },
        /**
         * Sets the userPostsLoading state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The userPostsLoading state.
         */
        setUserPostsLoading: (state, action) => {
            state.userPostsLoading = action.payload;
        },
        /**
         * Sets the offset state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {number} action.payload - The offset state.
         */
        setOffset: (state, action) => {
            state.offset = action.payload;
        },
        /**
         * Sets the hasMore state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The hasMore state.
         */
        setHasMore: (state, action) => {
            state.hasMore = action.payload;
        },
        /**
         * Sets an error message.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {string|null} action.payload - The error message or null.
         */
        setError: (state, action) => {
            state.error = action.payload;
        },
        /**
         * Clears all posts from userPosts state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         */
        clearUserPosts: (state, action) => {
            state.userPosts = [];
        },
        /**
         * Removes a post from userPosts by slug.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {string} action.payload - The slug of the post to remove.
         */
        removeUserPost: (state, action) => {
            const slug = action.payload;
            state.userPosts = state.userPosts.filter(
                (post) => post.$id !== slug
            );
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Preferences
            .addCase(fetchPreferences.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPreferences.fulfilled, (state, action) => {
                state.loading = false;
                state.preferences = action.payload;
            })
            .addCase(fetchPreferences.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Preferences
            .addCase(updatePreferences.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePreferences.fulfilled, (state, action) => {
                state.loading = false;
                state.preferences = action.payload;
            })
            .addCase(updatePreferences.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch User Posts
            .addCase(fetchUserPosts.pending, (state) => {
                state.userPostsLoading = true;
                state.error = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                state.userPostsLoading = false;
                state.userPosts = action.payload;
                state.offset = 0;
                state.hasMore = action.payload.length === 10;
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.userPostsLoading = false;
                state.error = action.payload;
            })
            // Fetch More User Posts (Infinite Scrolling)
            .addCase(fetchMoreUserPosts.pending, (state) => {
                state.infiniteScrollLoading = true;
                state.error = null;
            })
            .addCase(fetchMoreUserPosts.fulfilled, (state, action) => {
                state.infiniteScrollLoading = false;
                state.userPosts = [...state.userPosts, ...action.payload];
                state.offset = state.offset + 10;
                state.hasMore = action.payload.length === 10;
            })
            .addCase(fetchMoreUserPosts.rejected, (state, action) => {
                state.infiniteScrollLoading = false;
                state.error = action.payload;
            })
            // Update Name
            .addCase(updateName.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateName.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updateName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //Update Email
            .addCase(updateEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updateEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //Update Password
            .addCase(updatePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reset state on logout (from authSlice)
            .addCase(logoutUser.fulfilled, (state) => {
                state.profile = null;
                state.preferences = null;
                state.userPosts = [];
                state.loading = false;
                state.infiniteScrollLoading = false;
                state.userPostsLoading = false;
                state.offset = 0;
                state.hasMore = true;
                state.error = null;
            });
    },
});

export const {
    setProfile,
    setPreferences,
    setLoading,
    setError,
    clearUserPosts,
    removeUserPost,
    setInfiniteScrollLoading,
    setUserPostsLoading,
    setHasMore,
    setOffset,
} = userSlice.actions;

export default userSlice.reducer;
