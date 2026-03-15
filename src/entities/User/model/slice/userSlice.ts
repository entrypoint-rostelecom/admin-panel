import { PayloadAction } from "@reduxjs/toolkit";
import { User, UserSchema } from "../types/User";
import { buildSlice } from "@/shared/lib/store/buildSlice";

const initialState: UserSchema = {
	authData: undefined,
	_inited: false,
};

const userSlice = buildSlice({
	name: "user",
	initialState,
	reducers: {
		setAuthData: (state, action: PayloadAction<User>) => {
			state.authData = action.payload;
			state._inited = true;
		},
		clearAuthData: (state) => {
			state.authData = undefined;
			state._inited = true;
		},
	},
});

export const { reducer: UserReducer, actions: UserActions, useActions: useUserActions } = userSlice;
