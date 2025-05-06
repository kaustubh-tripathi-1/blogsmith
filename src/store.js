import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import postsReducer from "./slices/postsSlice";
import postEditorReducer from "./slices/postEditorSlice";
import storageReducer from "./slices/storageSlice";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
        postEditor: postEditorReducer,
        storage: storageReducer,
        ui: uiReducer,
        user: userReducer,
    },
});
