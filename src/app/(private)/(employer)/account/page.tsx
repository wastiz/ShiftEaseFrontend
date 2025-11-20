'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/shadcn/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { Badge } from '@/components/ui/shadcn/badge';
import IcoTitle from '@/components/ui/molecules/IcoTitle';
import {
    AlertTriangle,
    Edit2,
    Save,
    X,
    Dot,
    Mail,
    CreditCard,
    Shield,
    Trash2,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Layers,
    CirclePlus,
    Lock,
    LockKeyhole,
    CircleQuestionMark,
    User,
    CircleAlert,
    SquarePen,
    KeyRound,
    Sparkles,
} from 'lucide-react';
import { deleteUser } from '@/api/auth';
import { useMutation } from '@tanstack/react-query';
import { DeleteUserPayload } from '@/types';
import toast from 'react-hot-toast';

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
}

interface BillingInfo {
    currentPlan: string;
    creditBalance: number;
    nextBillingDate: string;
}

interface SecurityInfo {
    lastPasswordChange: string;
    twoFactorEnabled: boolean;
}

interface PasswordStrength {
    score: number;
    feedback: string[];
    color: string;
}

const AccountPage: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'user_123456',
        fullName: 'John Smith',
        email: 'john.smith@example.com',
    });

    const [billingInfo] = useState<BillingInfo>({
        currentPlan: 'Free',
        creditBalance: 150.75,
        nextBillingDate: '2024-09-15',
    });

    const [securityInfo] = useState<SecurityInfo>({
        lastPasswordChange: '2024-06-20',
        twoFactorEnabled: true,
    });

    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(userProfile.fullName);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        newEmail: '',
        company: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        feedback: [],
        color: 'bg-gray-200',
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const router = useRouter();

    // Password strength calculation
    const calculatePasswordStrength = (password: string): PasswordStrength => {
        let score = 0;
        const feedback: string[] = [];

        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Uppercase letter');

        if (/\d/.test(password)) score += 1;
        else feedback.push('Number');

        if (/[^a-zA-Z\d]/.test(password)) score += 1;
        else feedback.push('Special character');

        let color = 'bg-red-500';
        if (score >= 4) color = 'bg-green-500';
        else if (score >= 3) color = 'bg-yellow-500';
        else if (score >= 2) color = 'bg-orange-500';

        return { score, feedback, color };
    };

    useEffect(() => {
        if (formData.newPassword) {
            setPasswordStrength(
                calculatePasswordStrength(formData.newPassword)
            );
        }
    }, [formData.newPassword]);

    const handleNameSave = () => {
        if (editedName.trim()) {
            setUserProfile((prev) => ({
                ...prev,
                fullName: editedName.trim(),
            }));
            setIsEditingName(false);
        }
    };

    const handleNameCancel = () => {
        setEditedName(userProfile.fullName);
        setIsEditingName(false);
    };

    const handleEmailChange = () => {
        if (formData.newEmail && formData.newEmail !== userProfile.email) {
            // this would call an API
            console.log('Email change requested:', formData.newEmail);
            setIsEmailDialogOpen(false);
            setFormData({
                ...formData,
                newEmail: '',
            });
        }
    };

    const handlePasswordChange = () => {
        if (
            formData.currentPassword &&
            formData.newPassword &&
            formData.confirmPassword
        ) {
            if (formData.newPassword === formData.confirmPassword) {
                if (passwordStrength.score >= 3) {
                    // this would call an API
                    console.log('Password change requested');
                    setChangePasswordMode(false);
                    setFormData({
                        ...formData,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    });
                }
            }
        }
    };

    // DeleteUser Api
    const {
        mutate: deleteUserMutate,
        error,
        isPending,
        isError,
        isSuccess,
    } = useMutation({
        mutationFn: (payload: DeleteUserPayload) => deleteUser(payload),
        onSuccess: () => {
            toast.success('User deleted successfully.');
            router.push('/sign-in');
        },
        onError: (err: any) => {
            switch (err?.status) {
                case 401:
                    toast.error('Incorrect email or password');
                    break;
                case 403:
                    toast.error('Incorrect password');
                    break;
                default:
                    console.error(err);
                    toast.error('Some error occured. Try again later');
            }
        },
    });

    const handleSubmitDeleteUser = () => {
        if (!deletePassword) {
            toast.error('Please enter your password to confirm deletion.');
            return;
        }
        deleteUserMutate({ password: deletePassword });
        setDeletePassword('');
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="space-y-8 flex flex-col mx-80">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="mt-2 text-textSecondary">
                    Manage your account preferences and security settings
                </p>
            </div>

            {/* Profile Information Card */}
            <Card className="glassAccount pt-0">
                <CardHeader
                    className="rounded-t-xl py-5 top-0 bg-gradient-to-r from-transparent to-primary/20 border-b-1">
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <User className="size-7 text-primary"/>
                            Profile Information
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CircleAlert className="size-3"/>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-sm text-black">
                                        Verification code can only be sent{' '}
                                        <u className="font-medium">
                                            3 times
                                        </u>{' '}
                                        per hour
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="border"
                            onClick={() => setIsEditingName(true)}
                            className="p-4 text-primary hover:bg-primary/80"
                        >
                            <Edit2 className="size-4"/> Edit
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="fullName">Full Name</Label>
                        {isEditingName ? (
                            <div className="flex gap-2">
                                <Input
                                    id="fullName"
                                    value={editedName}
                                    onChange={(e) =>
                                        setEditedName(e.target.value)
                                    }
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter')
                                            handleNameSave();
                                        else if (e.key === 'Escape')
                                            handleNameCancel();
                                    }}
                                    autoFocus
                                />
                                <Button
                                    size="lg"
                                    onClick={handleNameSave}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Save className="size-4"/>
                                    Save
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleNameCancel}
                                >
                                    <p>Cancel</p>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center p-3 bg-textSecondary/20 rounded-md font-medium">
                                {userProfile.fullName}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email Address</Label>
                        <div
                            className="flex items-center p-3 bg-textSecondary/20 rounded-md font-medium justify-between">
                            <span>{userProfile.email}</span>
                        </div>
                        {/* Dialog 1/3 */}
                        <Dialog
                            open={isEmailDialogOpen}
                            onOpenChange={setIsEmailDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="text-blue-600 hover:text-blue-700 h-auto"
                                >
                                    <SquarePen className="size-4"/> Change
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Change Email Address
                                    </DialogTitle>
                                    <DialogDescription>
                                        A verification code will be sent to
                                        confirm the change.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="newEmail"
                                            className="block text-sm font-medium text-textSecondary"
                                        >
                                            New Email Address
                                        </Label>
                                        <Input
                                            id="newEmail"
                                            type="email"
                                            value={formData.newEmail}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newEmail:
                                                    e.target.value,
                                                })
                                            }
                                            placeholder="Enter your new email"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-textSecondary"
                                        >
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={formData.currentPassword}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    currentPassword:
                                                    e.target.value,
                                                })
                                            }
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setIsEmailDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleEmailChange}
                                        disabled={
                                            !formData.newEmail ||
                                            formData.newEmail ===
                                            userProfile.email
                                        }
                                    >
                                        Send Verification Code
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            {/* Billing & Subscription Card */}
            <Card className="glassAccount pt-0">
                <CardHeader
                    className="rounded-t-xl py-5 top-0 bg-gradient-to-r from-transparent to-primary/20 border-b-1">
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <div className="flex items-center justify-center">
                                <CreditCard className="size-7 text-primary"/>
                            </div>
                            Billing & Subscription
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="border"
                            className="p-4 text-primary hover:bg-primary/80"
                        >
                            <Sparkles className="size-4"/>
                            Upgrade
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-10 justify-between">
                        <div className="grid content-between w-full">
                            <div>
                                <div className="flex items-center mb-3">
                                    <IcoTitle
                                        icon={Layers}
                                        title="Current Plan"
                                    />
                                </div>
                                <div
                                    className="p-4 rounded-lg border border-primary/60 flex flex-col md:flex-row justify-between ">
                                    <div className="mb-2">
                                        <Badge
                                            variant="secondary"
                                            className="bg-amber-100 text-amber-600 text-md"
                                        >
                                            {billingInfo.currentPlan}
                                        </Badge>
                                        <p className="text-sm text-textSecondary">
                                            Perfect for trying out our
                                            services with basic features
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ms-3 items-center flex-row md:max-[850px]:flex-col">
                                        <Button size="sm" variant="outline">
                                            Manage
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-textPrimary hover:bg-primary/80"
                                        >
                                            Upgrade
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center mb-3">
                                    <IcoTitle
                                        icon={CirclePlus}
                                        title="Credit Balance"
                                        color="green"
                                    />
                                </div>
                                <div className="p-4 rounded-lg border border-green-200/60">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {billingInfo.creditBalance}{' '}
                                                credits
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="bg-green-600 text-green-100"
                                        >
                                            • Available
                                        </Badge>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-sm text-textSecondary mb-2">
                                            Use credits for API requests and
                                            validations
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Next billing date */}

                            {/* <div className="text-sm text-textSecondary">
                                    Next billing date:{' '}
                                    {new Date(
                                        billingInfo.nextBillingDate
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div> */}
                        </div>
                        <div>
                            <div>
                                <IcoTitle
                                    icon={CreditCard}
                                    title="Purchase Credits"
                                    className="mb-3"
                                />
                            </div>
                            <div className="w-80 rounded-lg border border-primary/60 flex flex-col justify-between">
                                <div
                                    className="relative rounded-t-lg overflow-hidden bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400 px-4 py-3">
                                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                                        <div
                                            className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white"></div>
                                        <div
                                            className="absolute bottom-0 -left-12 w-32 h-32 rounded-full bg-amber-300"></div>
                                        <div
                                            className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-amber-400 -translate-y-1/2 transform"></div>
                                    </div>
                                    <div className="relative flex items-center gap-2">
                                        <Sparkles className="size-6 text-white"/>
                                        <h2 className="font-bold text-lg text-white">
                                            Unlock Full Potential
                                        </h2>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col">
                                    <p className="text-sm mb-4">
                                        Get access to advanced features,
                                        higher monthly credits, and priority
                                        support with our premium plans.
                                    </p>
                                    <ul className="text-sm mb-6 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-green-500"/>
                                            Verify up to 50K emails per
                                            month
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-green-500"/>
                                            Priority validation queue
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-green-500"/>
                                            Advanced analytics & reporting
                                        </li>
                                    </ul>
                                    <Button
                                        size="sm"
                                        className="text-textPrimary hover:bg-primary/80"
                                    >
                                        Purchase Credits
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="glassAccount pt-0">
                <CardHeader
                    className="rounded-t-xl py-5 top-0 bg-gradient-to-r from-transparent to-primary/20 border-b-1">
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <div className="flex items-center justify-center">
                                <Lock className="size-7 text-primary"/>
                            </div>
                            Security
                        </CardTitle>

                        <Button
                            size="sm"
                            variant="border"
                            onClick={() => setChangePasswordMode(true)}
                            className="p-4 text-primary"
                        >
                            <Shield className="size-4"/>
                            Change Password
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="font-medium">
                        <div className="flex items-center space-x-2">
                            <LockKeyhole className="size-5"/>
                            <p>Password</p>
                        </div>

                        <div className="py-2 text-xs text-textSecondary ps-4">
                            <p className="">
                                • Last changed on{' '}
                                {new Date(
                                    securityInfo.lastPasswordChange
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {/* Dialog 2/3 */}
                    <Dialog
                        open={changePasswordMode}
                        onOpenChange={setChangePasswordMode}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                            </DialogHeader>

                            <div className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">
                                        Current Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={
                                                showPasswords.current
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={formData.currentPassword}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    currentPassword:
                                                    e.target.value,
                                                }))
                                            }
                                            placeholder="Enter current password"
                                        />
                                        <Button
                                            size="sm"
                                            variant="link"
                                            className="text-white absolute right-0 top-0 h-full"
                                            onClick={() =>
                                                togglePasswordVisibility(
                                                    'current'
                                                )
                                            }
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="size-4"/>
                                            ) : (
                                                <Eye className="size-4"/>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={
                                                showPasswords.new
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={formData.newPassword}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    newPassword:
                                                    e.target.value,
                                                }))
                                            }
                                            placeholder="Enter new password"
                                        />
                                        <Button
                                            size="sm"
                                            variant="link"
                                            className="text-white absolute right-0 top-0 h-full"
                                            onClick={() =>
                                                togglePasswordVisibility(
                                                    'new'
                                                )
                                            }
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="size-4"/>
                                            ) : (
                                                <Eye className="size-4"/>
                                            )}
                                        </Button>
                                    </div>

                                    {formData.newPassword && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200/60 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                        style={{
                                                            width: `${
                                                                (passwordStrength.score /
                                                                    5) *
                                                                100
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">
                                                        {passwordStrength.score <
                                                        2
                                                            ? 'Weak'
                                                            : passwordStrength.score <
                                                            4
                                                                ? 'Medium'
                                                                : 'Strong'}
                                                    </span>
                                            </div>
                                            {passwordStrength.feedback
                                                .length > 0 && (
                                                <div className="text-sm text-textSecondary/60">
                                                    Missing:{' '}
                                                    {passwordStrength.feedback.join(
                                                        ', '
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={
                                                showPasswords.confirm
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={formData.confirmPassword}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    confirmPassword:
                                                    e.target.value,
                                                }))
                                            }
                                            placeholder="Confirm new password"
                                        />
                                        <Button
                                            size="sm"
                                            variant="link"
                                            className="text-white absolute right-0 top-0 h-full"
                                            onClick={() =>
                                                togglePasswordVisibility(
                                                    'confirm'
                                                )
                                            }
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="size-4"/>
                                            ) : (
                                                <Eye className="size-4"/>
                                            )}
                                        </Button>
                                    </div>

                                    {formData.confirmPassword !== '' &&
                                        formData.newPassword !==
                                        formData.confirmPassword && (
                                            <div className="flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="size-4"/>
                                                Passwords do not match
                                            </div>
                                        )}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setChangePasswordMode(false);
                                        setFormData((prev) => ({
                                            ...prev,
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: '',
                                        }));
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={
                                        !formData.currentPassword ||
                                        !formData.newPassword ||
                                        !formData.confirmPassword ||
                                        formData.newPassword !==
                                        formData.confirmPassword ||
                                        passwordStrength.score < 3
                                    }
                                >
                                    <Check className="size-4"/>
                                    Update Password
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="pt-2">
                        <div className="flex text-xs items-center space-x-2">
                            <CircleQuestionMark className="size-4"/>
                            <p>Can't remember your current password?</p>
                        </div>
                        <Button
                            variant="link"
                            className="text-blue-600 hover:text-blue-700 h-auto"
                        >
                            <KeyRound/> Reset password via email
                        </Button>
                    </div>

                    {/* 2FA */}
                    {/* <div className="p-3 bg-green-300/50 rounded-md">
                                <div className="flex items-center gap-2">
                                    <Check className="size-4" />
                                    <span className="font-medium">
                                        Two-factor authentication enabled
                                    </span>
                                </div>
                            </div> */}
                </CardContent>
            </Card>

            {/* Danger Zone Card */}
            <Card className="glassAccount pt-0">
                <CardHeader className="rounded-t-xl py-5 top-0 bg-gradient-to-r from-red-950 to-transparent border-b-1">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <AlertTriangle className="size-7 text-red-500"/>
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="p-4 bg-red-950 rounded-lg border border-red-900">
                        <h3 className="font-semibold text-textPrimary mb-2">
                            Delete Account
                        </h3>
                        <p className="text-sm text-textSecondary mb-4">
                            Permanently remove your account and all
                            associated data. This action is irreversible,
                            and all your files, settings, and account
                            information will be lost.
                        </p>

                        {/* Dialog 3/3 */}
                        <Dialog
                            open={isDeleteDialogOpen}
                            onOpenChange={setIsDeleteDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="size-4 mr-2"/>
                                    Delete Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-textPrimary">
                                        <Trash2 className="size-5"/>
                                        Delete Account
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="p-3 bg-red-950 rounded-md border border-red-900">
                                        <h4 className="text-textPrimary mb-2">
                                            Warning: This action cannot be
                                            undone!
                                        </h4>
                                        <h4 className="text-textPrimary mb-2">
                                            Deleting your account will
                                            permanently remove all your
                                            data, including:
                                        </h4>
                                        <ul className="text-sm text-textPrimary space-y-1">
                                            <li>
                                                • All your validated phone
                                                lists
                                            </li>
                                            <li>• Custom lists and data</li>
                                            <li>
                                                • Account settings and
                                                preferences
                                            </li>
                                            <li>
                                                • Usage history and credits
                                                balance
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deletePassword">
                                            Enter your password to confirm
                                        </Label>
                                        <Input
                                            id="deletePassword"
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) =>
                                                setDeletePassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>

                                {isError && (
                                    <p className="text-red-500">
                                        Incorrect password
                                    </p>
                                )}
                                {isSuccess && (
                                    <p className="text-green-500">
                                        Account deleted successfully.
                                    </p>
                                )}
                                <DialogFooter className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsDeleteDialogOpen(false);
                                            setDeletePassword('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleSubmitDeleteUser}
                                        disabled={isPending}
                                    >
                                        {isPending
                                            ? 'Deleting...'
                                            : 'Delete Account'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountPage;
