import { projectsApi } from "../../store";
import type {
  BranchDetailed,
  Branch,
  BranchHistoryDto,
  GetBranchesDto,
  BranchComparison,
} from "@/types/branches";

type IdWithOdata = {
  id: string;
  odata?: string;
};

export const projectApi = projectsApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjectBranches: builder.query<GetBranchesDto, string>({
      query: (id) => `/${id}/branches`,
      providesTags: ["Branches"],
    }),
    reprocessBranch: builder.mutation<void, { projectId: string; id: string }>({
      query: (dto) => ({
        url: `/${dto.projectId}/branches/${dto.id}/process`,
        method: "POST",
      }),
      invalidatesTags: ["Projects", "Branches"],
    }),
    processBranchHistory: builder.mutation<Branch[], string>({
      query: (id) => ({ url: `/${id}/branches/history`, method: "POST" }),
      invalidatesTags: ["BranchHistory"],
    }),
    getBranchHistory: builder.query<BranchHistoryDto, string>({
      query: (id) => ({ url: `/${id}/branches/history`, method: "GET" }),
      providesTags: ["BranchHistory"],
    }),
    getProjectBranchesDetailed: builder.query<BranchDetailed[], IdWithOdata>({
      query: ({ id, odata }) =>
        `/${id}/branches/detailed${odata ? `?${odata}` : ""}`,
      providesTags: ["Branches"],
    }),
    getProjectBranchesDetailedExport: builder.query<Blob, IdWithOdata>({
      query: ({ id, odata }) => ({
        responseHandler: (response) => response.blob(),
        url: `/${id}/branches/detailed?$export=true${odata ? `&${odata}` : ""}`,
      }),
    }),
    getBranchComparison: builder.query<
      BranchComparison,
      { branchId: string; compareToBranchId: string }
    >({
      query: ({ branchId, compareToBranchId }) => ({
        url: `/${branchId}/compare/${compareToBranchId}`,
      }),
    }),
  }),
});

export const {
  useLazyGetBranchComparisonQuery,
  useReprocessBranchMutation,
  useGetBranchHistoryQuery,
  useProcessBranchHistoryMutation,
  useGetProjectBranchesDetailedQuery,
  useGetProjectBranchesQuery,
  useLazyGetProjectBranchesDetailedExportQuery,
} = projectApi;
