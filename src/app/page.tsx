import Link from "next/link";
import { Building2, Camera, CreditCard, MapPinned, Receipt, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, LogoSymbol } from "@/components/brand/logo";
import SearchForm from "@/app/components/landing/search-form";
import { BRAND_NAME, BRAND_TAGLINE, COMPANY_NAME } from "@/lib/brand";

const steps = [
    {
        icon: MapPinned,
        title: "Find a car near you",
        text: "Search by place and dates. You only see cars that are free for your whole trip.",
    },
    {
        icon: CreditCard,
        title: "Book and pay in the app",
        text: "Clear price before you pay. The deposit is only held on your card, not charged.",
    },
    {
        icon: Smartphone,
        title: "Pick it up with your phone",
        text: "Go to the pickup point, take a few photos of the car and drive away. No counter.",
    },
];

const reasons = [
    {
        icon: ShieldCheck,
        title: "Verified people",
        text: "Every driver, company and car is checked by our team before the first booking.",
    },
    {
        icon: Receipt,
        title: "No surprises",
        text: "Daily rate, extras, taxes and deposit, shown line by line before you confirm.",
    },
    {
        icon: Camera,
        title: "Documented handover",
        text: "Photos at pickup and return. Without incidents, your deposit is released automatically.",
    },
];

export default function Home() {
    return (
        <main>
            {/* Hero */}
            <section className="relative overflow-hidden bg-night text-white">
                <LogoSymbol
                    tone="onDark"
                    className="pointer-events-none absolute -right-16 -top-10 h-[420px] w-auto opacity-[0.07] sm:right-10"
                />
                <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 sm:px-6 sm:pt-24 md:pb-36">
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-mist">
                        <span className="size-2 rounded-full bg-coral" aria-hidden="true" />
                        Car rental at pickup points
                    </p>
                    <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                        {BRAND_TAGLINE}
                    </h1>
                    <p className="mt-5 max-w-xl text-lg text-mist/80">
                        Book a car from a rental company near you, pay in the app and pick it up with your phone.
                        No counters, no paperwork.
                    </p>
                </div>
            </section>

            {/* Search card overlapping the hero */}
            <section className="relative mx-auto -mt-20 max-w-6xl px-4 sm:px-6 md:-mt-24">
                <div className="rounded-2xl bg-card p-5 shadow-xl shadow-night/10 sm:p-6">
                    <h2 className="mb-4 font-display text-xl font-semibold">Where do you need a car?</h2>
                    <SearchForm />
                </div>
            </section>

            {/* How it works */}
            <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <h2 id="how-title" className="font-display text-3xl font-bold tracking-tight">
                    How it works
                </h2>
                <ol className="mt-10 grid gap-6 md:grid-cols-3">
                    {steps.map(({ icon: Icon, title, text }, i) => (
                        <li key={title} className="rounded-2xl bg-card p-6">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-night">
                                    <Icon className="size-5" aria-hidden="true" />
                                </span>
                                <span className="font-display text-sm font-semibold text-muted-foreground">
                                    Step {i + 1}
                                </span>
                            </div>
                            <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                            <p className="mt-2 text-muted-foreground">{text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Why */}
            <section aria-labelledby="why-title" className="bg-card">
                <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                    <h2 id="why-title" className="max-w-xl font-display text-3xl font-bold tracking-tight">
                        Renting a car should be this simple
                    </h2>
                    <ul className="mt-10 grid gap-10 md:grid-cols-3">
                        {reasons.map(({ icon: Icon, title, text }) => (
                            <li key={title}>
                                <Icon className="size-7 text-night" aria-hidden="true" />
                                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                                <p className="mt-2 text-muted-foreground">{text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Companies */}
            <section aria-labelledby="companies-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <div className="flex flex-col gap-6 rounded-3xl bg-mint p-8 text-night sm:p-12 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-xl">
                        <Building2 className="size-8" aria-hidden="true" />
                        <h2 id="companies-title" className="mt-4 font-display text-3xl font-bold tracking-tight">
                            Do you run a rental company?
                        </h2>
                        <p className="mt-3 text-night/80">
                            List your cars and pickup points on {BRAND_NAME}. We verify the drivers and handle
                            payments and deposits for you.
                        </p>
                    </div>
                    <Button asChild size="lg" variant="secondary" className="h-12 px-6 font-semibold">
                        <Link href="/company/register">Rent out your fleet</Link>
                    </Button>
                </div>
            </section>

            <footer className="border-t bg-card">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <Logo />
                    <p className="text-sm text-muted-foreground">
                        {BRAND_NAME} by {COMPANY_NAME} · © {new Date().getFullYear()} {COMPANY_NAME}
                    </p>
                </div>
            </footer>
        </main>
    );
}
