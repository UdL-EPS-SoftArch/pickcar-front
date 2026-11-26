import { Resource } from "halfred";

export type RecordStatus = "PUBLIC" | "PRIVATE";

export interface RecordEntity {
    uri: string;
    name: string;
    description?: string;
    status: RecordStatus;
    created?: Date;
    modified?: Date;
}

export type Record = RecordEntity & Resource;
