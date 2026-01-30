"use client";

import { useState, useMemo } from "react";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import { Mode, RegisterPayload, ApiError, getErrorMessage } from "@/types";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEmployerRegister } from "@/api/auth";
import { useTranslations } from 'next-intl';
import GoogleButton from '@/components/ui/GoogleButton';

interface RegisterFormProps {
    setMode: (mode: Mode) => void;
}

export default function RegisterForm({ setMode }: RegisterFormProps) {
    const t = useTranslations('auth');
    const { mutate, isPending, isError, error, isSuccess } = useEmployerRegister();
    const router = useRouter();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });

    const [errors, setErrors] = useState<{
        fullName?: string;
        email?: string;
        phone?: string;
        password?: string;
        server?: string;
    }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
        setErrors((prev) => ({ ...prev, [id]: "" }));
    };

    const passwordCriteria = useMemo(() => {
        const p = form.password || "";
        return {
            length: p.length >= 8,
            uppercase: /[A-ZА-ЯЁ]/.test(p),
            digit: /\d/.test(p),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p),
        };
    }, [form.password]);

    const validate = () => {
        const newErrors: typeof errors = {};

        const parts = form.fullName.trim().split(/\s+/);
        if (parts.length < 2) {
            newErrors.fullName = "Enter your full name (first and last name).";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            newErrors.email = "Enter a valid email address.";
        }

        const phoneRegex = /^\+?\d{7,15}$/; // простой паттерн для международного формата
        if (!phoneRegex.test(form.phone)) {
            newErrors.phone = "Enter a valid phone number.";
        }

        if (
            !passwordCriteria.length ||
            !passwordCriteria.uppercase ||
            !passwordCriteria.digit ||
            !passwordCriteria.special
        ) {
            newErrors.password = "Password does not meet all requirements.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const [firstName, ...rest] = form.fullName.trim().split(/\s+/);
        const lastName = rest.join(" ");

        const payload: RegisterPayload = {
            firstName,
            lastName,
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
        };

        mutate(payload, {
            onSuccess: () => {
                router.push("/organizations");
            },
            onError: (err: Error) => {
                const message = getErrorMessage(err as ApiError);
                setErrors(prev => ({ ...prev, server: message }));
            },
        });
    };

    const Criterion = ({
                           ok,
                           children,
                       }: {
        ok: boolean;
        children: React.ReactNode;
    }) => (
        <div className="flex items-center gap-2 text-sm">
      <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${
              ok ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"
          }`}
          aria-hidden
      >
        {ok ? <Check width={13} strokeWidth={3} /> : "•"}
      </span>
            <span className="text-sm text-muted-foreground">{children}</span>
        </div>
    );

    return (
        <>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Fill out your details to register</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        {/* Full Name */}
                        <div className="grid gap-1">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                            />
                            {errors.fullName && (
                                <p className="text-sm text-red-500">{errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="grid gap-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="grid gap-1">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">{errors.phone}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="grid gap-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="mt-2 flex flex-col gap-1">
                                <Criterion ok={passwordCriteria.length}>
                                    At least 8 characters
                                </Criterion>
                                <Criterion ok={passwordCriteria.uppercase}>
                                    Contains an uppercase letter (A–Z)
                                </Criterion>
                                <Criterion ok={passwordCriteria.digit}>
                                    Contains a number (0–9)
                                </Criterion>
                                <Criterion ok={passwordCriteria.special}>
                                    Contains a character (!@#$...)
                                </Criterion>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Signing up..." : "Sign up"}
                        </Button>

                        <GoogleButton
                            text={t('registerWithGoogle')}
                        />

                        {isError && (
                            <p className="text-red-500">
                                {(error instanceof Error ? error : { message: "Unknown error" })?.message || "Registration failed"}
                            </p>
                        )}
                        {errors.server && (
                            <p className="text-red-500">{errors.server}</p>
                        )}
                        {isSuccess && (
                            <p className="text-green-500">Registration successful!</p>
                        )}
                    </div>

                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setMode("login")}
                            className="underline underline-offset-4"
                        >
                            Log in
                        </button>
                    </div>
                </form>
            </CardContent>
        </>
    );
}
