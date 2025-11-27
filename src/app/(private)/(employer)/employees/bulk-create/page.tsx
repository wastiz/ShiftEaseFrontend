'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Trash2,
    Copy,
    Upload,
    Download,
    Users,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/shadcn/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Badge } from '@/components/ui/shadcn/badge';
import { Separator } from '@/components/ui/shadcn/separator';
import { toast } from 'sonner';
import Header from '@/modules/Header';
import Main from '@/modules/Main';
import { useBulkCreateEmployees, useGetGroups } from '@/api';

const employeeSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    position: z.string().min(1, 'Position is required'),
    groupId: z.number().min(1, 'Group is required'),
    hourlyRate: z.coerce.number().min(0, 'Hourly rate must be positive'),
    priority: z.enum(['low', 'medium', 'high'], { required_error: 'Priority is required' }),
});

const formSchema = z.object({
    employees: z.array(employeeSchema).min(1, 'Add at least one employee'),
});

type FormValues = z.infer<typeof formSchema>;

const emptyEmployee = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    groupId: 0,
    hourlyRate: 0,
    priority: 'medium' as const,
};

export default function BulkAddEmployees() {
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<any>(null);

    const { data: groups } = useGetGroups();
    const bulkCreate = useBulkCreateEmployees();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employees: [emptyEmployee],
        },
    });

    const { fields, append, remove, insert } = useFieldArray({
        control: form.control,
        name: 'employees',
    });

    const addEmployee = () => {
        append(emptyEmployee);
    };

    const duplicateEmployee = (index: number) => {
        const employee = form.getValues(`employees.${index}`);
        insert(index + 1, { ...employee, email: '', phone: '' });
    };

    const applyTemplate = (template: 'junior' | 'senior' | 'partTime') => {
        const templates = {
            junior: { hourlyRate: 15, priority: 'low' as const, position: 'Junior Employee' },
            senior: { hourlyRate: 40, priority: 'high' as const, position: 'Senior Employee' },
            partTime: { hourlyRate: 12, priority: 'medium' as const, position: 'Part-Time Employee' },
        };

        const currentEmployees = form.getValues('employees');
        const updated = currentEmployees.map(emp => ({
            ...emp,
            ...templates[template],
        }));
        form.setValue('employees', updated);
        toast.success('Template applied to all employees');
    };

    const exportTemplate = () => {
        const csv = [
            'First Name,Last Name,Email,Phone,Position,Group ID,Hourly Rate,Priority',
            'John,Doe,john.doe@example.com,+1234567890,Manager,1,25,high',
            'Jane,Smith,jane.smith@example.com,+0987654321,Cashier,1,18,medium',
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'employee_template.csv';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').slice(1);

            const imported = lines
                .filter(line => line.trim())
                .map(line => {
                    const [firstName, lastName, email, phone, position, groupId, hourlyRate, priority] =
                        line.split(',').map(s => s.trim());

                    return {
                        firstName,
                        lastName,
                        email,
                        phone,
                        position,
                        groupId: parseInt(groupId) || 0,
                        hourlyRate: parseFloat(hourlyRate) || 0,
                        priority: (priority?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high',
                    };
                });

            form.setValue('employees', imported);
            toast.success(`Imported ${imported.length} employees`);
        };
        reader.readAsText(file);
    };

    const onSubmit = async (data: FormValues) => {
        bulkCreate.mutate(data.employees, {
            onSuccess: (response) => {
                console.log(response);
                setResults(response);
                setShowResults(true);

                if (response.successCount > 0) {
                    toast.success(`Successfully created ${response.successCount} employee(s)`);
                }
                if (response.failedCount > 0) {
                    toast.error(`Failed to create ${response.failedCount} employee(s)`);
                }
            },
            onError: () => {
                toast.error('Failed to create employees');
            },
        });
    };

    if (showResults && results) {
        return (
            <>
                <Header title="Bulk Add Results" />
                <Main>
                    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Import Results</CardTitle>
                                <CardDescription>
                                    {results.successCount} successful, {results.failedCount} failed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {results.successfulEmployees && results.successfulEmployees.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-green-600 flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Successfully Created ({results.successCount})
                                        </h3>
                                        <div className="space-y-2">
                                            {results.successfulEmployees.map((emp: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                                    <Badge variant="outline" className="bg-green-50">
                                                        {emp.firstName} {emp.lastName}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">{emp.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.failedEmployees && results.failedEmployees.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-red-600 flex items-center gap-2">
                                            <XCircle className="h-5 w-5" />
                                            Failed to Create ({results.failedCount})
                                        </h3>
                                        <div className="space-y-2">
                                            {results.failedEmployees.map((emp: any, idx: number) => (
                                                <Alert key={idx} variant="destructive">
                                                    <AlertDescription>
                                                        <strong>{emp.firstName} {emp.lastName}</strong> ({emp.email})
                                                        <br />
                                                        <span className="text-sm">{emp.errorMessage}</span>
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button onClick={() => setShowResults(false)}>
                                        Add More Employees
                                    </Button>
                                    <Button variant="outline" onClick={() => window.location.href = '/employees'}>
                                        Go to Employees
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Main>
            </>
        );
    }

    return (
        <>
            <Header title="Bulk Add Employees">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <label>
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={importFromCSV}
                            />
                        </label>
                    </Button>
                </div>
            </Header>
            <Main>
                <div className="container max-w-6xl mx-auto p-4 md:p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Add Multiple Employees</CardTitle>
                                            <CardDescription>
                                                Fill in employee details below. Use templates or import from CSV.
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">
                                            <Users className="mr-1 h-3 w-3" />
                                            {fields.length} employees
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('junior')}>
                                            Apply Junior Template
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('senior')}>
                                            Apply Senior Template
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('partTime')}>
                                            Apply Part-Time Template
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <Card key={field.id} className="relative">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-base">
                                                            Employee #{index + 1}
                                                        </CardTitle>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => duplicateEmployee(index)}
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            {fields.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.firstName`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>First Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="John" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.lastName`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Last Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Doe" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.email`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} type="email" placeholder="john@example.com" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.phone`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Phone</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="+1234567890" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.position`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Position</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Manager" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.groupId`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Group</FormLabel>
                                                                    <Select
                                                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                                                        value={field.value?.toString()}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select group" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {groups?.map((group) => (
                                                                                <SelectItem key={group.id} value={group.id.toString()}>
                                                                                    {group.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.hourlyRate`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Hourly Rate</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} type="number" step="0.01" placeholder="25.00" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`employees.${index}.priority`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Priority</FormLabel>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select priority" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="low">Low</SelectItem>
                                                                            <SelectItem value="medium">Medium</SelectItem>
                                                                            <SelectItem value="high">High</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={addEmployee}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Another Employee
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={bulkCreate.isPending}>
                                    {bulkCreate.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Users className="mr-2 h-4 w-4" />
                                            Create {fields.length} Employee{fields.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </Main>
        </>
    );
}
