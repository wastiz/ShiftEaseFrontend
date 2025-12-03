import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {Organization, OrganizationDashboardData, OrganizationFormValues} from "@/types/organizations";

export function useCheckEntities() {
    return useQuery({
        queryKey: ['entities'],
        queryFn: async () => {
            const { data } = await api.get('/organizations/check-entities');
            return data
        },
    })
}


export function useGetOrganizations() {
    return useQuery({
        queryKey: ["organizations"],
        queryFn: async () => {
            const res = await api.get<Organization[]>("/organizations");
            return res.data;
        },
    });
}

export function useGetOrganization(id: string, p0: { enabled: boolean; }) {
    return useQuery({
        queryKey: ["organization", id],
        queryFn: async () => {
            const res = await api.get<Organization>(`/organizations/${id}`);
            return res.data;
        },
        enabled: !!id && id !== "create",
    });
}

export function useGetOrganizationData( id: string, p0: { enabled: boolean; }) {
    return useQuery({
        queryKey: ["organizationDashboardData", id],
        queryFn: async () => {
            const res = await api.get<OrganizationDashboardData>(`/organizations/data/${id}`);
            return res.data;
        }
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
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
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
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            queryClient.invalidateQueries({ queryKey: ["organization", variables.id] });
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
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: any) => {
            console.error("Failed to delete organization:", error);
        },
    });
}
