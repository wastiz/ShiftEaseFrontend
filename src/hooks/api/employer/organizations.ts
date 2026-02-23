import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {Organization, OrganizationDashboardData, OrganizationFormValues} from "@/types/organizations";
import {CheckEntitiesResult} from "@/types";
import {organizationKeys} from "@/lib/api-keys";

export function useCheckEntities() {
    return useQuery<CheckEntitiesResult>({
        queryKey: organizationKeys.entities(),
        queryFn: async () => {
            const { data } = await api.get<CheckEntitiesResult>('/organizations/check-entities');
            return data
        },
    })
}

export function useGetOrganizations() {
    return useQuery({
        queryKey: organizationKeys.all,
        queryFn: async () => {
            const res = await api.get<Organization[]>("/organizations");
            return res.data;
        },
    });
}

export function useGetOrganization(id: string, p0: { enabled: boolean; }) {
    return useQuery({
        queryKey: organizationKeys.detail(id),
        queryFn: async () => {
            const res = await api.get<Organization>(`/organizations/${id}`);
            return res.data;
        },
        enabled: !!id && id !== "create",
    });
}

export function useGetOrganizationData( id?: string ) {
    return useQuery({
        queryKey: organizationKeys.dashboardData(id!),
        queryFn: async () => {
            const res = await api.get<OrganizationDashboardData>(`/organizations/data/${id}`);
            return res.data;
        },
        enabled: !!id
    });
}

export function useAddOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: OrganizationFormValues) => {
            const res = await api.post('/organizations', dto);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.all });
        },
    });
}
export function useUpdateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: OrganizationFormValues & { id: string }) => {
            const { id, ...data } = dto;
            const res = await api.put(`/organizations/${id}`, data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.all });
            queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.id) });
        },
    });
}

export function useDeleteOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string | number) => {
            const res = await api.delete(`/organizations/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.all });
        },
        onError: (error: unknown) => {
            console.error("Failed to delete organization:", error);
        },
    });
}
