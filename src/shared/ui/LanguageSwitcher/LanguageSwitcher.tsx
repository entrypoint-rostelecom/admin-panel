import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import classes from "./LanguageSwitcher.module.css";

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const toggleLanguage = () => {
        const currentLang = i18n.language || "ru";
        const newLang = currentLang === "ru" ? "en" : "ru";
        
        i18n.changeLanguage(newLang);
        
        let newPath = location.pathname.replace(new RegExp(`^/${currentLang}`), `/${newLang}`);
        if (!newPath.startsWith(`/${newLang}`)) {
            newPath = `/${newLang}${newPath}`;
        }
        navigate(newPath, { replace: true });
    };

    return (
        <button className={classes.switcher} onClick={toggleLanguage} type="button">
            {i18n.language === "ru" ? "EN" : "RU"}
        </button>
    );
};
