'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Header from "@/components/ui/Header";
import Main from "@/components/ui/Main";

const AccountPage: React.FC = () => {
    const t = useTranslations('account');

    return (
        <>
            <Header title={t('title')} />
            <Main>
                <div className="container mx-auto p-4 md:p-6">
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
            </Main>
        </>
    );
};

export default AccountPage;
