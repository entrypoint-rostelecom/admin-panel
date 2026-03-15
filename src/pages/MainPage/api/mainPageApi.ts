import { rtkApi } from "@/shared/api/rtkApi";
import { MainPageData } from "../model/types/MainPageData";

const mainPageApi = rtkApi.injectEndpoints({
	endpoints: (build) => ({
		getMainData: build.query<MainPageData, void>({
			query: () => "/main",
		}),
	}),
});

export const { useGetMainDataQuery } = mainPageApi;
