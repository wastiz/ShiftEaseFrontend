"use client";

import {Button} from "@/components/ui/shadcn/button";
import {Badge} from "@/components/ui/shadcn/badge";
import Link from "next/link";
import {useTranslations} from 'next-intl';
import {ArrowRight} from "lucide-react";

export default function Home() {
    const t = useTranslations('landing');
    const tCommon = useTranslations('common');

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 md:py-32">
                <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                        {tCommon('appName')}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                        {t('hero.subtitle')}
                    </p>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                        {t('hero.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button asChild size="lg" className="text-base">
                            <Link href="/sign-in">
                                {t('hero.getStarted')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        {/*<Button asChild size="lg" variant="outline" className="text-base">*/}
                        {/*    <Link href="/sign-in">*/}
                        {/*        {t('hero.learnMore')}*/}
                        {/*    </Link>*/}
                        {/*</Button>*/}
                    </div>
                </div>
            </section>
        </div>
    )
}
