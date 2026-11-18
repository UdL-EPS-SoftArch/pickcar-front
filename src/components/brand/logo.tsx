import { cn } from "@/lib/utils";
import { BRAND_NAME, BRAND_WORDMARK } from "@/lib/brand";

type Tone = "default" | "onDark" | "onMint";

const symbolColors: Record<Tone, { pin: string; wheel: string }> = {
    default: { pin: "var(--color-night)", wheel: "var(--color-mint)" },
    onDark: { pin: "var(--color-mint)", wheel: "var(--color-night)" },
    onMint: { pin: "var(--color-night)", wheel: "#FFFFFF" },
};

/** Map pin with a steering wheel inside: the car and where to pick it up. */
export function LogoSymbol({ tone = "default", className }: { tone?: Tone; className?: string }) {
    const { pin, wheel } = symbolColors[tone];
    return (
        <svg viewBox="0 0 48 64" className={className} aria-hidden="true" focusable="false">
            <path d="M24 0C10.75 0 0 10.6 0 23.7 0 38.4 24 64 24 64s24-25.6 24-40.3C48 10.6 37.25 0 24 0Z" fill={pin} />
            <circle cx="24" cy="23.5" r="11" fill="none" stroke={wheel} strokeWidth="4" />
            <path d="M13 23.5h22M24 23.5v11" stroke={wheel} strokeWidth="4" />
            <circle cx="24" cy="23.5" r="4.5" fill="var(--color-coral)" />
        </svg>
    );
}

export function Logo({ tone = "default", className }: { tone?: Tone; className?: string }) {
    const text = tone === "onDark" ? "text-white" : "text-night";
    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <LogoSymbol tone={tone} className="h-8 w-auto" />
            <span aria-hidden="true" className={cn("font-display text-2xl font-bold tracking-tight", text)}>{BRAND_WORDMARK}</span>
            <span className="sr-only">{BRAND_NAME}</span>
        </span>
    );
}
