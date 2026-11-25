"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NewUser } from "@/types/user";
import {UsersService} from "@/api/userApi";
import {clientAuthProvider} from "@/lib/authProvider";
import { isApiError } from "@/api/halClient";

type FormValues = Required<Pick<NewUser, "email" | "password">> & { fullName: string };

const FORM_FIELDS: (keyof FormValues)[] = ["fullName", "email", "password"];

function isFormField(property: string): property is keyof FormValues {
    return (FORM_FIELDS as string[]).includes(property);
}

export default function RegistrationPage() {
    const service = new UsersService(clientAuthProvider())
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();
    const [formError, setFormError] = useState<string | null>(null);

    const router = useRouter();

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setFormError(null);
        try {
            await service.createUser(data);
            router.push("/login");
        } catch (error) {
            if (!isApiError(error)) {
                setFormError("Could not reach the server. Try again later.");
                return;
            }
            if (error.status === 409) {
                // The only unique field on POST /users is the email
                setError("email", { message: "An account with this email already exists" });
                return;
            }
            let shownInField = false;
            for (const [property, message] of Object.entries(error.fieldErrors ?? {})) {
                if (isFormField(property)) {
                    setError(property, { message });
                    shownInField = true;
                }
            }
            if (!shownInField) {
                setFormError(error.message);
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Register</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                                <div>
                                    <Label htmlFor="fullName">Full name</Label>
                                    <Input
                                        id="fullName"
                                        autoComplete="name"
                                        {...register("fullName")}
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Invalid email address",
                                            },
                                        })}
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
                                            required: "Password is required",
                                            minLength: { value: 8, message: "Minimum 8 characters" },
                                            maxLength: { value: 256, message: "Maximum 256 characters" }
                                        })}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                {formError && (
                                    <p role="alert" className="text-sm text-red-600">{formError}</p>
                                )}

                                <Button type="submit" className="mt-2" disabled={isSubmitting}>
                                    {isSubmitting ? "Registering..." : "Register"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
