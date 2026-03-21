import { rtkApi } from "@/shared/api/rtkApi";
import { SignInDto } from "../model/types/dto/SignInDto";
import { User } from "../model/types/User";
import { UserRoles } from "../model/consts/UserRoles";

interface AuthLoginResponse {
	success: boolean;
	user: {
		id: number;
		login: string;
		full_name: string;
		is_active: boolean;
		is_deleted: boolean;
		is_inside: boolean;
		created_at: string;
	};
	accessToken: string;
}

interface AdminLoginResponse {
	success: boolean;
	admin: {
		login: string;
	};
	accessToken: string;
}

export interface AdminUser {
	id: number;
	login: string;
	full_name: string;
	is_active: boolean;
	is_deleted: boolean;
	is_inside: boolean;
	created_at: string;
}

interface CreateAdminUserDto {
	login: string;
	password: string;
	full_name: string;
}

const userApi = rtkApi.injectEndpoints({
	endpoints: (build) => ({
		getMe: build.query<User, undefined>({
			query: () => "/user",
		}),

		register: build.mutation<User & { accessToken: string }, SignInDto>({
			query: (authData) => ({
				url: "/user/register",
				body: authData,
				method: "POST",
			}),
		}),

		signIn: build.mutation<User & { accessToken: string }, SignInDto>({
			query: (authData) => ({
				url: "/api/v1/auth/login",
				body: authData,
				method: "POST",
			}),
			transformResponse: (response: AuthLoginResponse): User & { accessToken: string } => ({
				id: String(response.user.id),
				username: response.user.login,
				roles: [UserRoles.USER],
				accessToken: response.accessToken,
			}),
		}),

		adminSignIn: build.mutation<User & { accessToken: string }, SignInDto>({
			query: (authData) => ({
				url: "/api/v1/admin/login",
				body: authData,
				method: "POST",
			}),
			transformResponse: (response: AdminLoginResponse): User & { accessToken: string } => ({
				id: response.admin.login,
				username: response.admin.login,
				roles: [UserRoles.ADMIN],
				accessToken: response.accessToken,
			}),
		}),

		getAdminUsers: build.query<AdminUser[], void>({
			query: () => "/api/v1/admin/users",
			providesTags: ["AdminUsers"],
		}),

		createAdminUser: build.mutation<AdminUser, CreateAdminUserDto>({
			query: (body) => ({
				url: "/api/v1/admin/users",
				method: "POST",
				body,
			}),
			invalidatesTags: ["AdminUsers"],
		}),

		deleteAdminUser: build.mutation<void, number>({
			query: (userId) => ({
				url: `/api/v1/admin/users/${userId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["AdminUsers"],
		}),

		signOut: build.mutation({
			query: () => ({
				url: "/user/signOut",
				method: "POST",
			}),
		}),
	}),
});

export const {
	useRegisterMutation,
	useSignInMutation,
	useAdminSignInMutation,
	useGetAdminUsersQuery,
	useCreateAdminUserMutation,
	useDeleteAdminUserMutation,
	useSignOutMutation,
	useGetMeQuery,
} = userApi;
