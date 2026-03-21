import { lazy } from "react";

export const LazyUsersPage = lazy(async () => await import("./UsersPage"));
