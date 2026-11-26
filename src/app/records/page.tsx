import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecordService } from "@/api/recordApi";
import { serverAuthProvider } from "@/lib/authProvider";

export default async function RecordsPage(props: { searchParams: Promise<{ page?: string }> }) {
    const service = new RecordService(serverAuthProvider);
    let currentPage = Math.max(0, Math.floor(Number((await props.searchParams).page) || 0));
    let pageData = await service.getRecords(currentPage);
    if (pageData.totalPages > 0 && currentPage >= pageData.totalPages) {
        currentPage = pageData.totalPages - 1;
        pageData = await service.getRecords(currentPage);
    }
    const {records, totalPages, hasPrevious, hasNext} = pageData;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
                    <div className="space-y-4 w-full">
                        <h1 className="text-2xl font-semibold">Records</h1>

                        {records.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No records available.</p>
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
                                                <CardDescription>{record.description}</CardDescription>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                Status: {record.status}
                                            </p>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {hasPrevious && (
                                <Link href={`/records?page=${currentPage - 1}`} className="text-blue-600 hover:underline">
                                    Previous
                                </Link>
                            )}
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            {hasNext && (
                                <Link href={`/records?page=${currentPage + 1}`} className="text-blue-600 hover:underline">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
