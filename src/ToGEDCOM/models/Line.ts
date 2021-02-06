export class Line {
    constructor(level: number, tag: string, value?:string, refId?:string, levelAdjustment?:number) {
        this.Level = level;
        this.Tag = tag;
        this.Value = value;
        this.ReferenceId = refId;
        this.LevelAdjustment = levelAdjustment;
    }

    Tag: string;
    Value: string | undefined;
    ReferenceId: string | undefined;
    Level: number;
    LevelAdjustment: number | undefined;
}