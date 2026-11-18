import { Resource } from "halfred";
import { idFromUri } from "@/lib/hal";

// Mirrors pickcar-API domain/User.java
export type Role = "DRIVER" | "COMPANY_STAFF" | "ADMIN";
export type UserStatus = "PENDING_EMAIL" | "ACTIVE";
// Not returned by the backend yet (pickcar-API #171)
export type CompanyRole = "OWNER" | "FLEET_MANAGER" | "AGENT" | "ACCOUNTANT";

export interface UserEntity {
    uri?: string;
    email: string;
    /** Write-only: sent on registration or password change, never returned */
    password?: string;
    fullName?: string | null;
    phone?: string | null;
    /** Read-only, assigned by the backend */
    role?: Role;
    /** Read-only, assigned by the backend */
    status?: UserStatus;
    emailVerifiedAt?: string | null;
    created?: string;
    companyRole?: CompanyRole | null;
}

export type User = UserEntity & Resource;

/** Fields accepted by POST /users */
export type NewUser = Pick<UserEntity, "email" | "password" | "fullName" | "phone">;

/** Numeric id used in /users/{id}, taken from the resource URI */
export function getUserId(user: Pick<UserEntity, "uri"> | null | undefined): string | null {
    return idFromUri(user?.uri);
}

/** Name to show in the UI: full name if set, otherwise the email */
export function displayName(user: Pick<UserEntity, "fullName" | "email">): string {
    return user.fullName?.trim() || user.email;
}
