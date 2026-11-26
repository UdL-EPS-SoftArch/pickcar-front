"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { UsersService } from "@/api/userApi";
import { RecordService } from "@/api/recordApi";
import { clientAuthProvider } from "@/lib/authProvider";
import { Record, RecordStatus } from "@/types/record";
import { User } from "@/types/user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = {
    name: string;
    description: string;
    status: RecordStatus;
};

export default function UserDetailPage() {
    const params = useParams();
    const userId = params?.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [records, setRecords] = useState<Record[]>([]);
    const [page, setPage] = useState(0);
    const [reloadCount, setReloadCount] = useState(0);
    const [pagination, setPagination] = useState({totalPages: 1, hasPrevious: false, hasNext: false});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>({ defaultValues: { status: "PRIVATE" } });

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            setError(null);
            try {
                const userService = new UsersService(clientAuthProvider());
                setUser(await userService.getUserById(userId));
            } catch (err) {
                console.error(err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [userId]);

    useEffect(() => {
        if (!user) return;
        const owner = user;
        async function fetchRecords() {
            try {
                const recordService = new RecordService(clientAuthProvider());
                const data = await recordService.getRecordsByOwnedBy(owner, page);
                setRecords(data.records);
                setPagination({
                    totalPages: data.totalPages,
                    hasPrevious: data.hasPrevious,
                    hasNext: data.hasNext,
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load records.");
            }
        }
        fetchRecords();
    }, [user, page, reloadCount]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const authProvider = clientAuthProvider();
            const recordService = new RecordService(authProvider);
            await recordService.createRecord({
                name: data.name,
                description: data.description || undefined,
                status: data.status,
            } as Record);
            setPage(0);
            setReloadCount((count) => count + 1);
            reset();
        } catch (err) {
            console.error(err);
            setError("Failed to create record.");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
                <p>User not found.</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main
                className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
                    <div className="space-y-4 w-full">
                        <h1 className="text-2xl font-semibold">{displayName(user)}</h1>

                        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                            <dt className="font-medium">Email</dt>
                            <dd>{user.email}</dd>
                            {user.phone && (<><dt className="font-medium">Phone</dt><dd>{user.phone}</dd></>)}
                            <dt className="font-medium">Role</dt>
                            <dd>{user.role}</dd>
                            <dt className="font-medium">Status</dt>
                            <dd>{user.status}</dd>
                        </dl>

                        {/* New Record Form */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Add New Record</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            {...register("name", { required: "Name is required" })}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            {...register("description")}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            {...register("status")}
                                            className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        >
                                            <option value="PRIVATE">Private</option>
                                            <option value="PUBLIC">Public</option>
                                        </select>
                                    </div>

                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Creating..." : "Add Record"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <h2 className="text-xl font-semibold mt-8">Records</h2>

                        {records.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No records created by the user yet.</p>
                        ) : (
                            <div className="space-y-3 w-full">
                                {records.map((record) => (
                                    <Card key={record.uri} className="w-full">
                                        <CardHeader>
                                            <CardTitle>
                                                <Link href={record.uri} className="hover:underline">
                                                    {record.name}
                                                </Link>
                                            </CardTitle>
                                            {record.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                    {record.description}
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Status: {record.status}
                                            </p>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {pagination.hasPrevious && (
                                <Button type="button" variant="outline" size="sm"
                                        onClick={() => setPage((current) => current - 1)}>
                                    Previous
                                </Button>
                            )}
                            <span className="text-sm text-muted-foreground">
                                Page {page + 1} of {pagination.totalPages}
                            </span>
                            {pagination.hasNext && (
                                <Button type="button" variant="outline" size="sm"
                                        onClick={() => setPage((current) => current + 1)}>
                                    Next
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
