export interface IQubicBuildPackage {
    getPackageSize(): number;
    getPackageData(): Uint8Array;
}