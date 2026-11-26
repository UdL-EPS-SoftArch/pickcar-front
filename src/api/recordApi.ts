import { getHal, mergeHal, mergeHalArray, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { Record } from "@/types/record";
import {User} from "@/types/user";

export type RecordPage = {
    records: Record[];
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
};

export class RecordService {
    constructor(private authProvider: AuthProvider) {
    }

    private async fetchRecordPage(path: string): Promise<RecordPage> {
        const resource = await getHal(path, this.authProvider);
        const metadata = resource.original().page ?? {};
        return {
            records: mergeHalArray<Record>(resource.embeddedArray('records') || []),
            totalPages: metadata.totalPages ?? 1,
            hasPrevious: !!resource.link('prev'),
            hasNext: !!resource.link('next'),
        };
    }

    async getRecords(page: number = 0, size: number = 5): Promise<RecordPage> {
        return this.fetchRecordPage(`/records?page=${page}&size=${size}`);
    }

    async getRecordById(id: string): Promise<Record> {
        const resource = await getHal(`/records/${id}`, this.authProvider);
        return mergeHal<Record>(resource);
    }

    async getRecordsByOwnedBy(owner: User, page: number = 0, size: number = 5): Promise<RecordPage> {
        return this.fetchRecordPage(
            `/records/search/findByOwnedBy?user=${owner.uri}&page=${page}&size=${size}&sort=id,desc`);
    }

    async createRecord(record: Record): Promise<Record> {
        const resource = await postHal('/records', record, this.authProvider);
        return mergeHal<Record>(resource);
    }

    async getRecordRelation<T>(record: Record, relation: string): Promise<T> {
        const resource = await getHal(record.link(relation).href, this.authProvider);
        return mergeHal<T>(resource);
    }
}
