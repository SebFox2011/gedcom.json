import yaml from 'js-yaml';
import forEach from 'lodash/forEach';

import Statistics from '../models/Statistics';
import ParsingResult from '../models/ParsingResult';
import TagDefinition from '../../models/TagDefinition';
import { Process } from '../processing/processObject';

let stats = new Statistics();
const fs = require('fs');

export function ParseObject(obj?: Object, parsingOptions?: string): ParsingResult {
    if (!obj || !parsingOptions){
        return new ParsingResult([]);
    }

    let yamlOptions: string | object | undefined = {};
    try{
        yamlOptions = yaml.safeLoad(parsingOptions);
    }
    catch(e) {
        return new ParsingResult([]);
    }

    let defintions: TagDefinition[] = [];
    forEach((yamlOptions as any).Definition, def => {
        defintions.push(new TagDefinition(def));
    });

    return new ParsingResult(Process(defintions, obj));
}

/* istanbul ignore next */ // maybe later ;)
export function ParseFile(path: string, parsingOptions: string) {
    return ParseObject(JSON.parse(fs.readFileSync(path, 'utf8')), parsingOptions);
}