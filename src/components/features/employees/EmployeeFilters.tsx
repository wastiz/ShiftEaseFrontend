import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/shadcn/input"
import { Badge } from "@/components/ui/shadcn/badge"
import { Button } from "@/components/ui/shadcn/button"
import { Checkbox } from "@/components/ui/shadcn/checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover"
import { Group } from "@/types"

export interface EmployeeFiltersState {
    search: string
    groupIds: number[]
}

interface EmployeeFiltersProps {
    filters: EmployeeFiltersState
    onFiltersChange: (filters: EmployeeFiltersState) => void
    groups: Group[]
    totalCount: number
    filteredCount: number
}

export function EmployeeFilters({
    filters,
    onFiltersChange,
    groups,
    totalCount,
    filteredCount,
}: EmployeeFiltersProps) {
    const t = useTranslations('employer.employees')
    const hasActiveFilters = filters.search || filters.groupIds.length > 0

    const selectedGroups = useMemo(
        () => groups.filter((g) => filters.groupIds.includes(g.id)),
        [groups, filters.groupIds]
    )

    const updateSearch = (search: string) => {
        onFiltersChange({ ...filters, search })
    }

    const toggleGroup = (groupId: number) => {
        const newGroupIds = filters.groupIds.includes(groupId)
            ? filters.groupIds.filter((id) => id !== groupId)
            : [...filters.groupIds, groupId]
        onFiltersChange({ ...filters, groupIds: newGroupIds })
    }

    const removeGroup = (groupId: number) => {
        onFiltersChange({
            ...filters,
            groupIds: filters.groupIds.filter((id) => id !== groupId),
        })
    }

    const clearFilters = () => {
        onFiltersChange({ search: "", groupIds: [] })
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={filters.search}
                        onChange={(e) => updateSearch(e.target.value)}
                        className="pl-9"
                    />
                    {filters.search && (
                        <button
                            onClick={() => updateSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Groups filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            {t('groups')}
                            {filters.groupIds.length > 0 && (
                                <Badge variant="secondary" className="ml-1 px-1.5">
                                    {filters.groupIds.length}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{t('filterByGroup')}</p>
                            {groups.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t('noGroupsAvailable')}
                                </p>
                            ) : (
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {groups.map((group) => {
                                        const isSelected = filters.groupIds.includes(group.id)
                                        return (
                                            <div
                                                key={group.id}
                                                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent"
                                                onClick={() => toggleGroup(group.id)}
                                            >
                                                <Checkbox checked={isSelected} />
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: group.color }}
                                                />
                                                <span className="text-sm">{group.name}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        {t('clearAll')}
                    </Button>
                )}
            </div>

            {/* Active filters display */}
            {(selectedGroups.length > 0 || hasActiveFilters) && (
                <div className="flex flex-wrap items-center gap-2">
                    {selectedGroups.map((group) => (
                        <Badge
                            key={group.id}
                            variant="secondary"
                            className="gap-1 pr-1"
                            style={{
                                backgroundColor: `${group.color}20`,
                                borderColor: group.color,
                            }}
                        >
                            {group.name}
                            <button
                                onClick={() => removeGroup(group.id)}
                                className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}

                    {hasActiveFilters && (
                        <span className="text-sm text-muted-foreground ml-2">
                            {t('showingOfEmployees', { filtered: filteredCount, total: totalCount })}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export const emptyFilters: EmployeeFiltersState = {
    search: "",
    groupIds: [],
}
