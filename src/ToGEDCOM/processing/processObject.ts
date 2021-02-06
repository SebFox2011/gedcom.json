import find from 'lodash/find';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isNumber from 'lodash/isNumber';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import forEach from 'lodash/forEach';
import forEachRight from 'lodash/forEachRight';
import keys from 'lodash/keys';
import includes from 'lodash/includes';
import first from 'lodash/first';
import remove from 'lodash/remove';
import last from 'lodash/last';

import TagDefinition from "../../models/TagDefinition";
import objectPath from 'object-path';
import fclone from 'fclone';
import { Line } from '../models/Line';
import { ConvertObjectToDate } from './objectToDate';

const eachDeep = require('deepdash/eachDeep');

export function Process(configs: TagDefinition[], obj: Object) : string[] {
    let result = ProcessObject(configs, undefined, obj, 0, []);
    let newResult: Line[] = [];
    
    // correct level if needed
    let lastLevel = 0;
    let lineSave: any[] = [];
    forEach(result, r => {
        if (r.Level !== lastLevel && (r.Level + 1) !== lastLevel && (r.Level - 1) !== lastLevel){
            // line jump, save until the parent level is added
            if (r.LevelAdjustment && r.LevelAdjustment !== 0) {
                lineSave.push({
                    ParentLevel: r.Level - r.LevelAdjustment,
                    Line: r
                });
            }

            return;
        }
        
        newResult.push(r);
        lastLevel = r.Level;

        // run through saved lines, if level is the parent level -> add line
        let removeLinesFromSavedLine: any[] = [];
        forEach(lineSave, savedLine => {
            if (r.Level === savedLine.ParentLevel) {
                newResult.push(savedLine.Line);
                removeLinesFromSavedLine.push(savedLine);
            }
        });

        forEach(removeLinesFromSavedLine, line => {
            remove(lineSave, l => l === line);
        });        
    });

    let lines: string[] = [];
    forEach(newResult, r => {
        if (r.ReferenceId) {
            lines.push(`${r.Level} ${r.ReferenceId} ${r.Tag}`);
            return;
        }

        if (r.Value) {
            lines.push(`${r.Level} ${r.Tag} ${r.Value}`);
            return;
        }

        lines.push(`${r.Level} ${r.Tag}`);
    });

    return lines;
}

export function FindConfig(configs: TagDefinition[], property?: string, collectionName?: string) {
    return find(configs, x => 
        // if collection is defined ignore config with this collection name
        // because the collection object can have the same property name than an other "main" definition 
        // eg Collection Source has property named "name", but the tag "NAME" has even the property "name"
        (collectionName ? x.CollectAs !== collectionName : true) 
        // key is property or collection name
        && x.Property === property || x.CollectAs === property);
}

export function SearchDefinition(configs: TagDefinition[], path: string[], collectionName?: string): any {
    let property = first(path);
    remove(path, x => x === property);
    let config = FindConfig(configs, property, collectionName);

    if (!config) {
        return undefined;
    }

    // no path, return first level result
    if (path.length === 0) {
        return {
            value: config,
            adjustLevel: 0
        };
    }

    let lastProperty = last(path);
    let deepConfig = SearchDefinitionDeep(config, path);

    if (deepConfig) {
        return {
            value: deepConfig,
            adjustLevel: 0
        };
    }

    // search for MergeWithLast
    eachDeep(configs, (val:any, key:string, parent:any, context:any) => {
        if (key === "Property" && val === lastProperty) {
            // TODO: MergeWithLast = true???
            if (parent.MergeWithLast === config?.Tag) {
                deepConfig = parent;
                context.break();
            }
        }
    });

    if (deepConfig) {
        return {
            value: deepConfig,
            adjustLevel: 1
        };
    }

    // not found deep, search first level
    return {
        value: FindConfig(configs, lastProperty, collectionName),
        adjustLevel: 0
    };
}

export function SearchDefinitionDeep(config: TagDefinition, path: string[]) : TagDefinition | undefined {
    if (!config) {
        return undefined;
    }

    let property = first(path);
    remove(path, x => x === property);
    
    let foundConfig = find(config.Properties, p => p.Property === property);

    if (!foundConfig) {
        return undefined;
    }

    if (path.length > 0) {
        return SearchDefinitionDeep(foundConfig, path);
    }

    return foundConfig;
}

export function ProcessObject(
    configs: TagDefinition[], 
    key: string | undefined, 
    value: Object, 
    level: number, 
    result: Line[], 
    collectionName?: string,
    path: string[] = []) : Line[] {
    
    if (!key && !value) {
        return result;
    }

    // start object
    if (!key && value) {
        let valueKeys = keys(value);

        forEach(valueKeys, k => {
            result = ProcessObject(configs, k, objectPath.get(value, k), level, result);
        });

        return result;
    }

    if (!key) {
        return result;
    }

    let searchResult = SearchDefinition(configs, path.concat([ key ]), collectionName);

    if (!searchResult) {
        return result;
    }

    let config = searchResult.value;
    if (!config) {
        return result;
    }

    if (config.Type) {
        
        switch(config.Type) {
            case "Date":
                let convertedLine = ConvertObjectToDate(value, level, config);

                forEach(convertedLine, l => {
                    result.push(l);
                });

                break;
        }

        return result;
    }

    level += searchResult.adjustLevel;

    if (isString(value)) {
        // reference id
        if (value.match(/^(@.*@)/) && level === 0) {
            result.push(new Line(level, config.Tag, undefined, value, searchResult.adjustLevel));
        }
        else {
            result.push(new Line(level, config.Tag, value, undefined, searchResult.adjustLevel));
        }

        return result;
    }

    if (isNumber(value)) {

        console.log("isNumber");
        // TODO: Value is number

        return result;
    }

    if (isBoolean(value)) {

        console.log("isBoolean");
        // TODO: Value is boolean

        return result;
    }
    
    if (isDate(value)) {

        console.log("isDate");
        // TODO: Value is date

        return result;
    }

    if (isArray(value)) {
        if (value.length === 0) {
            return result;
        }

        forEach(value, subValue => {
            result = ProcessObject(configs, key, subValue, level, result, collectionName, fclone(path));
        });

        return result;
    }

    // collections
    if (config.CollectAs) {
        
        path.push(key);

        let clonedValue = fclone(value);
        let valueKeys = keys(clonedValue);

        if (valueKeys.length > 0 && !config.Property) {
            result.push(new Line(level, config.Tag));
        }

        // if object is collect, but has value property
        if (config.Property && includes(valueKeys, config.Property)) {
            let configValue = objectPath.get(clonedValue, config.Property);
            
            // get value and remove from object
            if (isString(configValue)) {
                objectPath.del(clonedValue, config.Property);
            }
            // get first object and remove from array
            else if (isArray(configValue)) {
                let firstValue = first(configValue);
                remove(configValue, x => x === firstValue);
                configValue = firstValue;
            }

            result = ProcessObject(configs, config.Property, configValue, level, result, collectionName, fclone(path));
        }

        forEachRight(valueKeys, k => {
            result = ProcessObject(configs, k, objectPath.get(clonedValue, k), level + 1, result, config?.CollectAs, fclone(path));
        });

        return result;
    }
    
    let clonedValue = fclone(value);

    // if object property has "Value" Property, its possibly just a merged object 
    // the original value was written in "Value", because the object has subproperties now insted of a single value
    let valueProperty = objectPath.get(clonedValue, "Value");
    if (valueProperty) {
        objectPath.del(clonedValue, "Value");
        result = ProcessObject(configs, config.Property, valueProperty, level, result, collectionName, fclone(path));
    }

    let valueKeys = keys(clonedValue);
    forEach(valueKeys, k => {
        let newPath = fclone(path);
        newPath.push(key);
        result = ProcessObject(configs, k, objectPath.get(value, k), level + 1, result, collectionName, newPath);
    });

    return result;
}