import { lazy } from "react";

export const LazySystemSettingsPage = lazy(async () => await import("./SystemSettingsPage"));
