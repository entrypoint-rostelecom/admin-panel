import { rtkApi } from "@/shared/api/rtkApi";
import { SignInDto } from "../model/types/dto/SignInDto";
import { User } from "../model/types/User";
import { USER_ACCESS_TOKEN } from "@/shared/consts/localStorage";

const userApi = rtkApi.injectEndpoints({
	endpoints: (build) => ({
		// Заглушка вместо реального бэкенда: всё работает внутри фронта
		getMe: build.query<User, undefined>({
			// читаем токен из localStorage и, если он "FAKE_TOKEN", возвращаем фейкового пользователя
			queryFn: async () => {
				if (localStorage.getItem(USER_ACCESS_TOKEN) === "FAKE_TOKEN") {
					const user: User = {
						id: "1",
						username: "admin",
						roles: [],
					};
					return { data: user };
				}

				return {
					error: {
						status: 401,
						data: { message: "Not authenticated" },
					} as any,
				};
			},
		}),

		register: build.mutation<User & { accessToken: string }, SignInDto>({
			// простая заглушка: "успешная" регистрация любого пользователя
			queryFn: async (authData) => {
				const user: User & { accessToken: string } = {
					id: "2",
					username: authData.email,
					roles: [],
					accessToken: "FAKE_TOKEN",
				};
				return { data: user };
			},
		}),

		signIn: build.mutation<User & { accessToken: string }, SignInDto>({
			// заглушка логина: пускаем только admin/admin
			queryFn: async (authData) => {
				if (authData.email === "admin" && authData.password === "admin") {
					const user: User & { accessToken: string } = {
						id: "1",
						username: "admin",
						roles: [],
						accessToken: "FAKE_TOKEN",
					};
					return { data: user };
				}

				return {
					error: {
						status: 401,
						data: { message: "Неверный логин или пароль" },
					} as any,
				};
			},
		}),

		signOut: build.mutation({
			// заглушка выхода
			queryFn: async () => ({ data: true }),
		}),
	}),
});

export const { useRegisterMutation, useSignInMutation, useSignOutMutation, useGetMeQuery } = userApi;
