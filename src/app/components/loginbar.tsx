"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clientAuthProvider } from "@/lib/authProvider";
import { UsersService } from "@/api/userApi";
import { deleteCookie } from "cookies-next";
import { useAuth } from "@/app/components/authentication";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function Loginbar() {
    const router = useRouter();

    function logout() {
        deleteCookie("MYAPP_AUTH");
        setUser(null);
        router.push("/");
    }

    const {user, setUser} = useAuth();

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const service = new UsersService(clientAuthProvider());
                const user = await service.getCurrentUser();
                setUser(user ?? null);
            } catch {
                if (mounted) setUser(null);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    if (user) {
        return (
            <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-2">
                    <Avatar className="rounded-lg flex items-center justify-center bg-muted">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4"/>
                    </Avatar>
                    <Link href={`/users/${user.username}`}
                          className="hidden sm:inline text-foreground text-md font-medium hover:underline"> {user.username ?? "User"} </Link>
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
