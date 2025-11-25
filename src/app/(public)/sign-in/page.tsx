"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card } from "@/components/ui/shadcn/card"
import SignInRightBlock from "@/modules/page-modules/sign-in/SignInRightBlock";
import LoginForm from "@/modules/page-modules/sign-in/LoginForm";
import RegisterForm from "@/modules/page-modules/sign-in/RegisterForm";
import ForgotPasswordForm from "@/modules/page-modules/sign-in/ForgotPasswordForm";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/shadcn/tabs";
import {Mode} from "@/types";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "@/components/LanguageSwitcher";

const variants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
}


export default function SignIn() {
    const [mode, setMode] = useState<Mode>("login")
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-between items-center gap-2">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <img src="/images/logo.svg" alt="Logo" />
                        {tCommon('appName')}
                    </a>
                    <LanguageSwitcher />
                </div>
                <div className="flex flex-1 items-center justify-center relative min-h-[400px] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.35 }}
                            className="absolute w-full max-w-xs"
                        >
                            <Tabs defaultValue="employer" className="w-[400px]">
                                <TabsList>
                                    <TabsTrigger value="employee">{t('employee')}</TabsTrigger>
                                    <TabsTrigger value="employer">{t('employer')}</TabsTrigger>
                                </TabsList>
                                <TabsContent value="employee">
                                    <Card className="bg-glassBorder">
                                        {mode === "login" && (
                                            <LoginForm setMode={setMode} role={"employee"}></LoginForm>
                                        )}

                                        {mode === "register" && (
                                            <div className={"p-4"}>
                                                <p>{t('employeeCannotRegister')}</p>
                                            </div>
                                        )}

                                        {mode === "forgot" && (
                                            <ForgotPasswordForm setMode={setMode} role={"employee"}></ForgotPasswordForm>
                                        )}
                                    </Card>
                                </TabsContent>
                                <TabsContent value="employer">
                                    <Card className="bg-glassBorder">
                                        {mode === "login" && (
                                            <LoginForm setMode={setMode} role={"employer"}></LoginForm>
                                        )}

                                        {mode === "register" && (
                                            <RegisterForm setMode={setMode}></RegisterForm>
                                        )}

                                        {mode === "forgot" && (
                                            <ForgotPasswordForm setMode={setMode} role={"employer"}></ForgotPasswordForm>
                                        )}
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="relative w-full h-full flex flex-col justify-center bg-secondary rounded-lg">
                <SignInRightBlock></SignInRightBlock>
            </div>

        </div>
    )
}
