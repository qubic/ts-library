import { RequestResponseHeader } from "./RequestResponseHeader";

export class ReceivedPackage {
    public ipAddress!: string;
    public header!: RequestResponseHeader;
    public payLoad!: Uint8Array;
}