import { useMemo, useState } from "react"
import { Employee } from "@/types"
import { EmployeeFiltersState, emptyFilters } from "./EmployeeFilters"

export function useEmployeeFilters(employees: Employee[]) {
    const [filters, setFilters] = useState<EmployeeFiltersState>(emptyFilters)

    const filteredEmployees = useMemo(() => {
        return employees.filter((employee) => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
                const matchesSearch =
                    fullName.includes(searchLower) ||
                    employee.email.toLowerCase().includes(searchLower)

                if (!matchesSearch) return false
            }

            // Groups filter
            if (filters.groupIds.length > 0) {
                const employeeGroupIds = employee.groupIds ?? []
                const hasMatchingGroup = filters.groupIds.some((groupId) =>
                    employeeGroupIds.includes(groupId)
                )
                if (!hasMatchingGroup) return false
            }

            return true
        })
    }, [employees, filters])

    return {
        filters,
        setFilters,
        filteredEmployees,
        totalCount: employees.length,
        filteredCount: filteredEmployees.length,
    }
}
