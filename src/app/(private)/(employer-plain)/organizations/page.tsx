"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetOrganizations, useDeleteOrganization } from "@/hooks/api"
import { Organization } from "@/types"
import { Button } from "@/components/ui/shadcn/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/shadcn/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/shadcn/dialog"
import toast from "react-hot-toast";
import Main from "@/components/ui/Main";

export default function Organizations() {
    const router = useRouter()
    const { data: organizations, isLoading, isError, refetch } = useGetOrganizations()
    const deleteOrganization = useDeleteOrganization()

    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const openDeleteDialog = (orgId: number) => {
        setDeleteId(orgId)
        setIsDialogOpen(true)
    }

    const handleDelete = () => {
        if (!deleteId) return
        deleteOrganization.mutate(deleteId, {
            onSuccess: () => {
                toast.success("Organization deleted successfully")
                setIsDialogOpen(false)
            },
            onError: () => {
                toast.error("Failed to delete organization")
            },
        })
    }

    const handleNavigate = (orgId: number) => {
        localStorage.setItem("orgId", String(orgId))
        router.push(`/dashboard`)
    }

    const handleEdit = (orgId: number) => {
        router.push(`organizations/${orgId}`)
    }

    const handleAdd = () => {
        router.push("organizations/create")
    }

    if (isLoading) return <p className="p-4">Loading...</p>
    if (isError) return <p className="p-4 text-red-500">Failed to load organizations</p>

    return (
        <>
            <header className={`w-full h-1/15 flex items-center justify-between shrink-0 border-b px-4 py-4`}>
                <div className={"flex gap-2 items-center"}>
                    <h1 className={"text-xl font-bold"}>Organizations</h1>
                </div>
            </header>
            <Main>
                {organizations && organizations.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organizations.map((org: Organization) => (
                                <Card key={org.id} className="flex flex-col justify-between">
                                    <CardHeader>
                                        {org.photoUrl ? (
                                            <img
                                                src={org.photoUrl}
                                                alt={org.name}
                                                className="w-full h-40 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-40 rounded-md bg-muted">
                                                <span className="text-muted-foreground text-sm">No Image</span>
                                            </div>
                                        )}
                                        <CardTitle className="mt-4">{org.name}</CardTitle>
                                        <CardDescription>{org.description || "No description"}</CardDescription>
                                    </CardHeader>

                                    <CardFooter className="flex justify-between">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="default" onClick={() => handleNavigate(org.id)}>
                                                Go to
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => handleEdit(org.id)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="destructive"
                                                    onClick={() => openDeleteDialog(org.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <Button onClick={handleAdd} className="fixed bottom-6 right-6 rounded-full w-14 h-14 text-2xl">
                            +
                        </Button>
                    </>
                ) : (
                    <div className="h-full text-center pt-40 space-y-4">
                        <p className="text-lg">You have no organizations yet</p>
                        <Button onClick={handleAdd}>Create your first organization</Button>
                    </div>
                )}

                {/* Delete Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Organization</DialogTitle>
                            <DialogDescription>
                                Are you sure? All groups, employees, shifts, and schedules associated
                                with this organization will be deleted. Maybe it’s easier to edit it?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    )
}
