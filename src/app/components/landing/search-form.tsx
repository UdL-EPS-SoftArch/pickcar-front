"use client";

import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchValues = {
    location: string;
    pickup: string; // "YYYY-MM-DDTHH:mm" in the user's local time (datetime-local)
    dropoff: string;
};

// Messages reused by tests/e2e/landing.feature
export const SEARCH_ERRORS = {
    locationRequired: "Location is required",
    pickupRequired: "Pickup date is required",
    returnRequired: "Return date is required",
    pickupInPast: "Pickup cannot be in the past",
    returnBeforePickup: "Return must be after pickup",
} as const;

// Runs only on submit, so reading the clock here is fine
function isNotInPast(localDateTime: string): boolean {
    return new Date(localDateTime).getTime() >= Date.now();
}

export default function SearchForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SearchValues>({ mode: "onSubmit" });

    const onSubmit: SubmitHandler<SearchValues> = ({ location, pickup, dropoff }) => {
        const params = new URLSearchParams({
            location: location.trim(),
            start: new Date(pickup).toISOString(),
            end: new Date(dropoff).toISOString(),
        });
        router.push(`/search?${params.toString()}`);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Search vehicles"
            className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-start"
        >
            <Field id="location" label="Where" icon={<MapPin />} error={errors.location?.message}>
                <Input
                    id="location"
                    placeholder="City or address"
                    autoComplete="address-level2"
                    aria-invalid={!!errors.location}
                    aria-describedby={errors.location ? "location-error" : undefined}
                    className="h-11 pl-9"
                    {...register("location", {
                        validate: (v) => v.trim() !== "" || SEARCH_ERRORS.locationRequired,
                    })}
                />
            </Field>

            <Field id="pickup" label="Pickup" error={errors.pickup?.message}>
                <Input
                    id="pickup"
                    type="datetime-local"
                    aria-invalid={!!errors.pickup}
                    aria-describedby={errors.pickup ? "pickup-error" : undefined}
                    className="h-11"
                    {...register("pickup", {
                        required: SEARCH_ERRORS.pickupRequired,
                        validate: (v) => isNotInPast(v) || SEARCH_ERRORS.pickupInPast,
                    })}
                />
            </Field>

            <Field id="dropoff" label="Return" error={errors.dropoff?.message}>
                <Input
                    id="dropoff"
                    type="datetime-local"
                    aria-invalid={!!errors.dropoff}
                    aria-describedby={errors.dropoff ? "dropoff-error" : undefined}
                    className="h-11"
                    {...register("dropoff", {
                        required: SEARCH_ERRORS.returnRequired,
                        validate: (v, all) =>
                            !all.pickup ||
                            new Date(v).getTime() > new Date(all.pickup).getTime() ||
                            SEARCH_ERRORS.returnBeforePickup,
                    })}
                />
            </Field>

            <Button type="submit" size="lg" disabled={isSubmitting} className="h-11 md:mt-6 font-semibold">
                <Search aria-hidden="true" />
                Search
            </Button>
        </form>
    );
}

function Field({
    id,
    label,
    icon,
    error,
    children,
}: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4" aria-hidden="true">
                        {icon}
                    </span>
                )}
                {children}
            </div>
            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
