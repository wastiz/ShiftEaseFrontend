import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/shadcn/card";
import {Label} from "@/components/ui/shadcn/label";
import {Input} from "@/components/ui/shadcn/input";
import {Button} from "@/components/ui/shadcn/button";
import {ForgotPasswordPayload, Mode, Role} from "@/types";
import {useForgotPassword} from "@/hooks/api/auth";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";

interface ForgotPasswordFormProps {
    setMode: (mode: Mode) => void;
    role: Role
}

export default function ForgotPasswordForm({setMode, role}: ForgotPasswordFormProps) {
    const router = useRouter();
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');

    const [form, setForm] = useState<ForgotPasswordPayload>({
        email: "",
    });

    const {mutate, error, isPending, isError, isSuccess} = useForgotPassword()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = event.target;
        setForm({...form, [id]: value});
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutate(form, {
            onSuccess: (data) => {
                router.push("/sign-in");
            },
        })
    }


    return (
        <>
            <CardHeader>
                <CardTitle>{t('forgotPasswordTitle')}</CardTitle>
                <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="email">{tCommon('email')}</Label>
                            <Input id="email" type="email" placeholder={t('emailPlaceholder')} onChange={handleChange} required />
                        </div>
                        <Button type="submit" className={isPending ? "w-full disabled" : "w-full"}>
                            {isPending ? t('sending') : t('sendResetLink')}
                        </Button>
                        {isError && <p className="text-red-500">{(error instanceof Error ? error : { message: t('unknownError') })?.message || t('unknownError')}</p>}
                        {isSuccess && <p className="text-green-500">{t('resetLinkSent')}</p>}
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setMode("login")}
                        >
                            {t('backToLogin')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </>
    )
}
