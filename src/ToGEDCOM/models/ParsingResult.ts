import Statistics from "./Statistics";

export default class ParsingResult {
    constructor(obj: string[], stats?: Statistics) {
        this.Lines = obj;
        
        /* istanbul ignore next */ 
        this.Statistics = stats ?? new Statistics();
    }

    Lines: string[];
    Statistics: Statistics;
}