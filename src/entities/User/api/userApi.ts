import { rtkApi } from "@/shared/api/rtkApi";
import { SignInDto } from "../model/types/dto/SignInDto";
import { User } from "../model/types/User";
import { UserRoles } from "../model/consts/UserRoles";

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

export interface AccessLog {
	id: number;
	user_id: number;
	timestamp: string;
	signature_base64: string;
	result: string;
	reason: string;
	scanner_id: number;
}

interface CreateAdminUserDto {
	login: string;
	password: string;
	full_name: string;
}

const userApi = rtkApi.injectEndpoints({
	endpoints: (build) => ({
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

		freezeAdminUser: build.mutation<AdminUser, number>({
			query: (userId) => ({
				url: `/api/v1/admin/users/${userId}/freeze`,
				method: "PATCH",
			}),
			invalidatesTags: ["AdminUsers"],
		}),

		unfreezeAdminUser: build.mutation<AdminUser, number>({
			query: (userId) => ({
				url: `/api/v1/admin/users/${userId}/unfreeze`,
				method: "PATCH",
			}),
			invalidatesTags: ["AdminUsers"],
		}),

		getAccessLogs: build.query<AccessLog[], void>({
			query: () => "/api/v1/admin/logs",
			providesTags: ["AccessLogs"],
		}),

		adminLogout: build.mutation<void, void>({
			query: () => ({
				url: "/api/v1/admin/logout",
				method: "POST",
			}),
		}),
	}),
});

export const {
	useAdminSignInMutation,
	useGetAdminUsersQuery,
	useCreateAdminUserMutation,
	useDeleteAdminUserMutation,
	useFreezeAdminUserMutation,
	useUnfreezeAdminUserMutation,
	useGetAccessLogsQuery,
	useAdminLogoutMutation,
} = userApi;
