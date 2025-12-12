'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Badge } from '@/components/ui/shadcn/badge';
import { Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

type EmployeeData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    groupIds: number[];
    hourlyRate: number;
    priority: 'low' | 'medium' | 'high';
};

type CSVImporterProps = {
    onImport: (employees: EmployeeData[]) => void;
};

// Маппинг различных вариантов названий колонок
const FIELD_MAPPINGS = {
    firstName: ['firstname', 'first name', 'first_name', 'fname', 'givenname', 'given name'],
    lastName: ['lastname', 'last name', 'last_name', 'lname', 'surname', 'familyname', 'family name'],
    fullName: ['name', 'fullname', 'full name', 'full_name', 'employee name', 'employeename'],
    email: ['email', 'e-mail', 'mail', 'email address', 'emailaddress', 'e_mail'],
    phone: ['phone', 'telephone', 'mobile', 'phonenumber', 'phone number', 'phone_number', 'tel', 'contact'],
    position: ['position', 'role', 'title', 'job', 'jobtitle', 'job title', 'job_title'],
    groupIds: ['group', 'groups', 'groupid', 'group id', 'group_id', 'groupids', 'group ids', 'group_ids', 'team', 'teams'],
    hourlyRate: ['hourly rate', 'hourlyrate', 'hourly_rate', 'rate', 'wage', 'salary', 'pay', 'payrate', 'pay rate'],
    priority: ['priority', 'importance', 'level', 'rank'],
};

const normalizePriority = (value: string): 'low' | 'medium' | 'high' => {
    const normalized = value.toLowerCase().trim();
    if (['high', 'h', '3', 'important', 'urgent'].includes(normalized)) return 'high';
    if (['low', 'l', '1', 'minor'].includes(normalized)) return 'low';
    return 'medium';
};

const parseGroupIds = (value: string): number[] => {
    if (!value || value.trim() === '') return [];
    return value
        .split(/[,;|]/)
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
};

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };

    // Первая часть - имя, остальное - фамилия
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
};

const findColumnIndex = (headers: string[], fieldMappings: string[]): number => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    for (const mapping of fieldMappings) {
        const index = normalizedHeaders.indexOf(mapping.toLowerCase());
        if (index !== -1) return index;
    }
    return -1;
};

export default function CSVImporter({ onImport }: CSVImporterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [previewData, setPreviewData] = useState<EmployeeData[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);

    const parseCSV = (text: string): { data: EmployeeData[]; warnings: string[] } => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            return { data: [], warnings: ['CSV file is empty or has no data rows'] };
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const warnings: string[] = [];

        // Определяем индексы колонок
        const indices = {
            firstName: findColumnIndex(headers, FIELD_MAPPINGS.firstName),
            lastName: findColumnIndex(headers, FIELD_MAPPINGS.lastName),
            fullName: findColumnIndex(headers, FIELD_MAPPINGS.fullName),
            email: findColumnIndex(headers, FIELD_MAPPINGS.email),
            phone: findColumnIndex(headers, FIELD_MAPPINGS.phone),
            position: findColumnIndex(headers, FIELD_MAPPINGS.position),
            groupIds: findColumnIndex(headers, FIELD_MAPPINGS.groupIds),
            hourlyRate: findColumnIndex(headers, FIELD_MAPPINGS.hourlyRate),
            priority: findColumnIndex(headers, FIELD_MAPPINGS.priority),
        };

        // Проверяем обязательные поля
        if (indices.email === -1) {
            warnings.push('⚠️ Email column not found - this is required');
        }

        const data: EmployeeData[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            // Более сложный парсинг CSV с учетом кавычек
            const cells: string[] = [];
            let currentCell = '';
            let insideQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];

                if (char === '"') {
                    insideQuotes = !insideQuotes;
                } else if (char === ',' && !insideQuotes) {
                    cells.push(currentCell.trim().replace(/^"|"$/g, ''));
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
            cells.push(currentCell.trim().replace(/^"|"$/g, ''));

            let firstName = '';
            let lastName = '';

            // Обработка имени
            if (indices.firstName !== -1 && indices.lastName !== -1) {
                firstName = cells[indices.firstName] || '';
                lastName = cells[indices.lastName] || '';
            } else if (indices.fullName !== -1) {
                const fullName = cells[indices.fullName] || '';
                const nameParts = splitFullName(fullName);
                firstName = nameParts.firstName;
                lastName = nameParts.lastName;
            } else {
                warnings.push(`⚠️ Row ${i}: Could not determine first/last name`);
            }

            const email = indices.email !== -1 ? cells[indices.email] || '' : '';
            const phone = indices.phone !== -1 ? cells[indices.phone] || '' : '';
            const position = indices.position !== -1 ? cells[indices.position] || '' : '';
            const groupIds = indices.groupIds !== -1 ? parseGroupIds(cells[indices.groupIds] || '') : [];
            const hourlyRate = indices.hourlyRate !== -1 ? parseFloat(cells[indices.hourlyRate] || '0') : 0;
            const priority = indices.priority !== -1
                ? normalizePriority(cells[indices.priority] || 'medium')
                : 'medium';

            if (!email) {
                warnings.push(`⚠️ Row ${i + 1}: Missing email - skipping`);
                continue;
            }

            data.push({
                firstName,
                lastName,
                email,
                phone,
                position,
                groupIds,
                hourlyRate,
                priority,
            });
        }

        return { data, warnings };
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const { data, warnings } = parseCSV(text);

            if (data.length === 0) {
                toast.error('No valid data found in CSV file');
                return;
            }

            setPreviewData(data);
            setWarnings(warnings);
            setIsOpen(true);
        };
        reader.readAsText(file);

        // Сбросить input для возможности выбрать тот же файл
        e.target.value = '';
    };

    const handleConfirmImport = () => {
        onImport(previewData);
        setIsOpen(false);
        setPreviewData([]);
        setWarnings([]);
        toast.success(`Imported ${previewData.length} employees`);
    };

    const handleCancel = () => {
        setIsOpen(false);
        setPreviewData([]);
        setWarnings([]);
    };

    return (
        <>
            <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Preview Import Data
                        </DialogTitle>
                        <DialogDescription>
                            Review the parsed data before importing. Found {previewData.length} employees.
                        </DialogDescription>
                    </DialogHeader>

                    {warnings.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    {warnings.slice(0, 5).map((warning, idx) => (
                                        <div key={idx} className="text-sm">{warning}</div>
                                    ))}
                                    {warnings.length > 5 && (
                                        <div className="text-sm font-semibold">
                                            ...and {warnings.length - 5} more warnings
                                        </div>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-96">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>First Name</TableHead>
                                        <TableHead>Last Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Groups</TableHead>
                                        <TableHead>Rate</TableHead>
                                        <TableHead>Priority</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.slice(0, 10).map((emp, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                                            <TableCell>{emp.firstName || <span className="text-red-500">Missing</span>}</TableCell>
                                            <TableCell>{emp.lastName || <span className="text-red-500">Missing</span>}</TableCell>
                                            <TableCell>{emp.email}</TableCell>
                                            <TableCell>{emp.phone || '-'}</TableCell>
                                            <TableCell>{emp.position || '-'}</TableCell>
                                            <TableCell>
                                                {emp.groupIds.length > 0 ? (
                                                    <Badge variant="secondary">{emp.groupIds.length} group(s)</Badge>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>${emp.hourlyRate.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    emp.priority === 'high' ? 'destructive' :
                                                    emp.priority === 'low' ? 'secondary' : 'default'
                                                }>
                                                    {emp.priority}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {previewData.length > 10 && (
                            <div className="p-3 bg-muted text-sm text-center">
                                Showing 10 of {previewData.length} employees
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmImport}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Import {previewData.length} Employees
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
