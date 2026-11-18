"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/components/authentication";
import Loginbar from "@/app/components/loginbar";

export default function Navbar() {
    const pathname = usePathname();
    const {user} = useAuth();

    const navLinks = [
        {href: "/", label: "Home"},
        {href: "/users", label: "Users", roles: ["ROLE_USER"]}
    ];

    return (
        <nav className="bg-card border-b">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
                <Link href="/" aria-label="Home" className="shrink-0">
                    <Logo />
                </Link>

                <div className="hidden sm:flex gap-4">
                    {navLinks
                        .filter(({roles}) =>
                            !roles || user?.authorities?.some(
                                userAuth => roles.includes(userAuth.authority)))
                        .map(({href, label}) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={
                                        active
                                            ? "text-foreground font-medium border-b-2 border-primary pb-1"
                                            : "text-muted-foreground hover:text-foreground transition"
                                    }
                                >
                                    {label}
                                </Link>
                            );
                        })}
                </div>

                <div className="ml-auto">
                    <Loginbar/>
                </div>

            </div>
        </nav>
    );
}
