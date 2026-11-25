import { deleteHal, getHal, mergeHal, mergeHalArray, patchHal, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { NewUser, User, UserProfileChanges } from "@/types/user";

/** Header the backend requires to change a password (UserEventHandler.CURRENT_PASSWORD_HEADER) */
export const CURRENT_PASSWORD_HEADER = "X-Current-Password";

export class UsersService {
    constructor(private authProvider: AuthProvider) {
    }

    async getUsers(): Promise<User[]> {
        const resource = await getHal('/users', this.authProvider);
        const embedded = resource.embeddedArray('users') || [];
        return mergeHalArray<User>(embedded);
    }

    /** @param id numeric user id (see getUserId) */
    async getUserById(id: string): Promise<User> {
        const resource = await getHal(`/users/${encodeURIComponent(id)}`, this.authProvider);
        return mergeHal<User>(resource);
    }

    /** The logged-in user, or null when there are no credentials */
    async getCurrentUser(): Promise<User | null> {
        if (!await this.authProvider.getAuth()) {
            return null;
        }
        const resource = await getHal('/identity', this.authProvider);
        return mergeHal<User>(resource);
    }

    async createUser(user: NewUser): Promise<User> {
        const resource = await postHal("/users", user, this.authProvider);
        return mergeHal<User>(resource);
    }

    /** Updates only the given profile fields */
    async updateUser(id: string, changes: UserProfileChanges): Promise<User> {
        const resource = await patchHal(`/users/${encodeURIComponent(id)}`, changes, this.authProvider);
        return mergeHal<User>(resource);
    }

    /**
     * The backend rejects the change with 403 unless the current password matches
     * (admins are exempt). After success the stored credentials are stale: log in again.
     */
    async changePassword(id: string, currentPassword: string, newPassword: string): Promise<User> {
        const resource = await patchHal(`/users/${encodeURIComponent(id)}`, { password: newPassword }, this.authProvider, {
            headers: { [CURRENT_PASSWORD_HEADER]: currentPassword },
        });
        return mergeHal<User>(resource);
    }

    async deleteUser(id: string): Promise<void> {
        await deleteHal(`/users/${encodeURIComponent(id)}`, this.authProvider);
    }
}
