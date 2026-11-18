"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/app/components/authentication";
import { deleteCookie, setCookie } from "cookies-next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UsersService } from "@/api/userApi";
import { clientAuthProvider } from "@/lib/authProvider";
import { getUserId, User } from "@/types/user";

type FormValues = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);

    async function login(email: string, password: string): Promise<User> {
        setErrorMessage(null);
        const authorization = `Basic ${btoa(`${email}:${password}`)}`;
        setCookie("MYAPP_AUTH", authorization, {
            path: "/",
            secure: true,
            sameSite: "strict",
            httpOnly: false,
        });
        const service = new UsersService(clientAuthProvider());
        const user = await service.getCurrentUser();
        if (!user) throw new Error("Not authenticated");
        setUser(user);
        return user;
    }

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        // Redirect by role comes in #16; for now go to the user's own page
        login(data.email, data.password).then((user) => {
            router.push(`/users/${getUserId(user)}`);
        }).catch(() => {
            deleteCookie("MYAPP_AUTH");
            setErrorMessage("Login failed");
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>login</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                                {errorMessage && ( // Display error message if present
                                    <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                                )}
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="username"
                                        {...register("email", { required: "Email is required" })}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register("password", {
                                            required: "Password is required"
                                        })}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="mt-2" disabled={isSubmitting}>
                                    {isSubmitting ? "logging in..." : "login"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
