import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/api/auth';
import { useMutation } from '@tanstack/react-query';
import {
    SettingsIcon,
    LogOutIcon,
    User,
    CreditCard,
    ChartNoAxesColumnIncreasing,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

const AnimatedLink = memo(function AnimatedLink({
    to,
    children,
    className,
    icon,
    onClick,
}: {
    to: string;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'group flex w-full items-center gap-3 rounded-lg p-3 text-sm transition-all duration-200 select-none hover:bg-white/10 text-white/90 hover:text-white',
                className
            )}
        >
            <div className="transition-all duration-200 group-hover:scale-105 group-hover:text-orange-300 text-orange-400">
                {icon}
            </div>
            <span className="font-medium">{children}</span>
        </button>
    );
});

const AnimatedButton = memo(function AnimatedButton({
    children,
    className,
    icon,
    onClick,
    variant = 'default',
}: {
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'danger';
}) {
    const isDestructive = variant === 'danger';

    return (
        <button
            className={cn(
                'group flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left text-sm transition-all duration-200 select-none font-medium',
                isDestructive
                    ? 'hover:bg-red-500/10 hover:text-red-400 text-red-400'
                    : 'hover:bg-white/10 hover:text-white text-white/90',
                className
            )}
            onClick={onClick}
        >
            <div className="transition-transform duration-200 group-hover:scale-105">
                {icon}
            </div>
            <span>{children}</span>
        </button>
    );
});

interface ProfileWindowProps {
    user: {
        firstName: string;
        lastName: string;
        avatar?: string;
        plan: string;
    };
    className?: string;
    onClose?: () => void;
}

export default function ProfileWindow({
    user,
    className,
    onClose,
}: ProfileWindowProps) {
    const router = useRouter();
    const t = useTranslations('profile');

    const getInitials = (first: string, last: string) => {
        return `${first[0]}${last[0]}`.toUpperCase();
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        onClose?.();
    };

    const { mutate: logoutMutate, isPending } = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            toast.success(t('loggedOutSuccess'));
            router.push('/sign-in');
            onClose?.();
        },
        onError: (err: unknown) => {
            console.error(err);
            toast.error(t('logoutFailed'));
        },
    });

    const handleLogout = () => {
        logoutMutate();
    };

    return (
        <div
            className={cn(
                'animate-in fade-in-0 zoom-in-95 w-64 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-xl p-0 duration-200',
                className
            )}
        >
            <div className="space-y-1 p-2">
                <AnimatedLink
                    to="/account"
                    icon={<User className="h-4 w-4" />}
                    onClick={() => handleNavigation('/account')}
                >
                    {t('accountSettings')}
                </AnimatedLink>

                <AnimatedLink
                    to="/subscription"
                    icon={<CreditCard className="h-4 w-4" />}
                    onClick={() => handleNavigation('/subscription')}
                >
                    {t('subscription')}
                </AnimatedLink>

                <AnimatedLink
                    to="/usage"
                    icon={<ChartNoAxesColumnIncreasing className="h-4 w-4" />}
                    onClick={() => handleNavigation('/usage')}
                >
                    {t('usageAnalytics')}
                </AnimatedLink>
            </div>
            <div className="mx-2 mb-2">
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm font-medium">
                            {t('storageUsed')}
                        </span>
                        <span className="text-orange-300 text-sm">40%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full w-[40%] rounded-full transition-all duration-300" />
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                        <span>4 {t('gbUsed')}</span>
                        <span>10 {t('gbTotal')}</span>
                    </div>
                    <button
                        onClick={() => handleNavigation('/upgrade')}
                        className="mt-3 w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {t('upgradePlan')}
                    </button>
                </div>
            </div>{' '}
            <div className="border-t border-white/10 p-2">
                <AnimatedButton
                    icon={<LogOutIcon className="h-4 w-4" />}
                    variant="danger"
                    onClick={handleLogout}
                >
                    {isPending ? t('loggingOut') : t('signOut')}
                </AnimatedButton>
            </div>
        </div>
    );
}
