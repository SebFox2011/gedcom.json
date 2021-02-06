import TagDefinition from "../../models/TagDefinition";
import { Line } from "../models/Line";

export function ConvertObjectToDate(value: Object, level: number, config: TagDefinition): Line[] {
    console.log(value);
    console.log(config);

    // !two lines needed if date has time!!!

    // own format -> use Original Property if defined
    // if NOT provided try to convert value (if date) to gedcom string format


    return [ new Line(level, config.Tag) ];
}