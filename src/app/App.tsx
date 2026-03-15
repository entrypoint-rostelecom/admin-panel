import { Suspense, useEffect } from "react";
import { AppRouter } from "./providers/router";
import { PageLoader } from "@/widgets/PageLoader";
import { GlobalStyles } from "./styles/globalStyles";
import { useGetMeQuery } from "@/entities/User/api/userApi";
import { UserActions, getAccessToken } from "@/entities/User";
import { useAppDispatch } from "@/shared/lib/hooks";

const App = () => {
	const dispatch = useAppDispatch();
	const hasToken = Boolean(getAccessToken());
	const { data: user, isLoading } = useGetMeQuery(undefined, {
		skip: !hasToken,
	});

	useEffect(() => {
		if (user) {
			dispatch(UserActions.setAuthData(user));
			return;
		}

		if (!hasToken) {
			dispatch(UserActions.clearAuthData());
		}
	}, [user, hasToken, dispatch]);

	if (isLoading) {
		return <PageLoader />;
	}

	return (
		<div>
			<GlobalStyles />
			<Suspense fallback={<PageLoader />}>
				{/* <Navbar /> */}
				<div className="content-page">
					{/* <Sidebar /> */}
					<AppRouter />
				</div>
			</Suspense>
		</div>
	);
};

export default App;
