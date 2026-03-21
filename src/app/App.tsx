import { Suspense, useEffect, useState } from "react";
import { AppRouter } from "./providers/router";
import { PageLoader } from "@/widgets/PageLoader";
import { GlobalStyles } from "./styles/globalStyles";
import { UserActions, getAccessToken, getUserData } from "@/entities/User";
import { useAppDispatch } from "@/shared/lib/hooks";

const App = () => {
	const dispatch = useAppDispatch();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		const token = getAccessToken();
		const user = getUserData();

		if (token && user) {
			dispatch(UserActions.setAuthData(user));
		} else {
			dispatch(UserActions.clearAuthData());
		}
		
		setIsInitializing(false);
	}, [dispatch]);

	if (isInitializing) {
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
