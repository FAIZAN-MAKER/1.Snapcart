import { createSlice } from "@reduxjs/toolkit";

// userSlice is deprecated for authentication.
// Authentication is now handled by NextAuth session (useSession).
// This slice is kept for potential future non-auth user state if needed.

interface IUserSlice {
  // Deprecated: Do not use for authentication
  userData: null;
}

const initialState: IUserSlice = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // setUserData is deprecated - authentication now uses NextAuth session
    setUserData: (state, action) => {
      console.warn("userSlice.setUserData is deprecated. Use NextAuth session instead.");
      state.userData = action.payload;
    }
  }

});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
