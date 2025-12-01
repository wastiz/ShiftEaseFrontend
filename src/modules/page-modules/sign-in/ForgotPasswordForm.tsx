import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/shadcn/card";
import {Label} from "@/components/ui/shadcn/label";
import {Input} from "@/components/ui/shadcn/input";
import {Button} from "@/components/ui/shadcn/button";
import {ForgotPasswordPayload, Mode, Role} from "@/types";
import {useForgotPassword} from "@/api/auth";
import {useState} from "react";
import {useRouter} from "next/navigation";

interface ForgotPasswordFormProps {
    setMode: (mode: Mode) => void;
    role: Role
}

export default function ForgotPasswordForm({setMode, role}: ForgotPasswordFormProps) {
    const router = useRouter();

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
                <CardTitle>Forgot your password?</CardTitle>
                <CardDescription>Enter your email to receive a reset link</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" onChange={handleChange} required />
                        </div>
                        <Button type="submit" className={isPending ? "w-full disabled" : "w-full"}>
                            {isPending ? "Sending..." : "Send reset link"}
                        </Button>
                        {isError && <p className="text-red-500">{(error as any)?.message || "Failed to send reset link"}</p>}
                        {isSuccess && <p className="text-green-500">Reset link was sent</p>}
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setMode("login")}
                        >
                            Back to login
                        </Button>
                    </div>
                </form>
            </CardContent>
        </>
    )
}
