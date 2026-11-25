import { getHal, mergeHal, mergeHalArray, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { NewUser, User } from "@/types/user";

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
}
