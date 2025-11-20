import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import {Mode, Role} from "@/types";
import { useLogin } from "@/api/auth";
import { LoginPayload } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
    setMode: (mode: Mode) => void;
    role: Role
}

export default function LoginForm({ setMode, role }: LoginFormProps) {
    const router = useRouter();
    const [form, setForm] = useState<LoginPayload>({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { mutate, isPending, isSuccess } = useLogin(role)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        mutate(form, {
            onSuccess: (data) => {
                router.push(role === "employer" ? "/organizations" : "/dashboard");
            },
            onError: (err: any) => {
                const message = err?.response?.data || "Something went wrong";
                setErrorMessage(message);
            },
        });
    };


    return (
        <>
            <CardHeader>
                <CardTitle>
                    Login to your {role === "employer" ? "Employer" : "Employee"} account
                </CardTitle>
                <CardDescription>Enter your email below to login</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        {/* Email */}
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="grid gap-3">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <button
                                    type="button"
                                    className="ml-auto text-sm underline-offset-4 hover:underline"
                                    onClick={() => setMode("forgot")}
                                >
                                    Forgot your password?
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Logging in..." : "Login"}
                            </Button>
                            <Button variant="outline" className="w-full">
                                Login with Google
                            </Button>
                        </div>

                        {/* Error & Success */}
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        {isSuccess && (
                            <p className="text-green-500">Login successful!</p>
                        )}
                    </div>

                    {/* Switch to register */}
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setMode("register")}
                            className="underline underline-offset-4"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </CardContent>
        </>
    );
}
