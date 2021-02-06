import { expect } from 'chai';
import { ParseObject } from "../../src/ToGEDCOM/parsing/parsing";

describe('Parsing Object', () => {
    it('No Object', () => {
        let result = ParseObject();
        expect(result.Lines).to.deep.equal([]);
    });

    it('No Config', () => {
        let result = ParseObject({});
        expect(result.Lines).to.deep.equal([]);
    });

    it('Empty Config', () => {
        let result = ParseObject({}, "");
        expect(result.Lines).to.deep.equal([]);
    });

    it('Incorret Config', () => {
        let result = ParseObject({}, "@T: A");
        expect(result.Lines).to.deep.equal([]);
    });

    it('Simple Defintion', () => {
        let result = ParseObject({
            "Head": {
                "Source": {
                    "Name": "GRAMPS",
                    "Version": "2.2.6-1"
                }
            }
        }, `
        Definition:
        - Tag: HEAD
          CollectAs: Head
        - Tag: SOUR
          Property: Name
          CollectAs: Source
        - Tag: VERS
          Property: Version
        `);
        expect(result.Lines).to.deep.equal([
            "0 HEAD",
            "1 SOUR GRAMPS",
            "2 VERS 2.2.6-1"
        ]);
    });
});