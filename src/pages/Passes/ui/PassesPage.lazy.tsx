import { lazy } from "react";

export const LazyPassesPage = lazy(async () => await import("./PassesPage"));
