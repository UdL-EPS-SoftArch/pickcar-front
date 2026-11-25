"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { useAuth } from "@/app/components/authentication";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { displayName, getUserId } from "@/types/user";

export default function Loginbar() {
    const router = useRouter();
    // The session is loaded once by AuthProvider
    const { user, setUser, isLoading } = useAuth();

    function logout() {
        deleteCookie("MYAPP_AUTH");
        setUser(null);
        router.push("/");
    }

    if (isLoading) {
        return <div className="h-8 w-32" aria-hidden="true" />;
    }

    if (user) {
        return (
            <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-2">
                    <Avatar className="rounded-lg flex items-center justify-center bg-muted">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4"/>
                    </Avatar>
                    <Link href={`/users/${getUserId(user)}`}
                          data-testid="current-user"
                          className="hidden sm:inline text-foreground text-md font-medium hover:underline">
                        {displayName(user)}
                    </Link>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
                <Link href="/users/register">Register</Link>
            </Button>
        </div>
    )

}
