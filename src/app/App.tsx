import { Suspense, useEffect, useState } from "react";
import { AppRouter } from "./providers/router";
import { PageLoader } from "@/widgets/PageLoader";
import { GlobalStyles } from "./styles/globalStyles";
import { UserActions, getAccessToken, getUserData } from "@/entities/User";
import { useAppDispatch } from "@/shared/lib/hooks";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const App = () => {
	const dispatch = useAppDispatch();
	const [isInitializing, setIsInitializing] = useState(true);
	const location = useLocation();
	const { i18n } = useTranslation();

	// Синхронизируем язык i18n с :lang сегментом URL
	useEffect(() => {
		const langFromUrl = location.pathname.split('/')[1];
		if ((langFromUrl === 'ru' || langFromUrl === 'en') && langFromUrl !== i18n.language) {
			i18n.changeLanguage(langFromUrl);
		}
	}, [location.pathname, i18n]);

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

