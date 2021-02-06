import { expect } from 'chai';
import TagDefinition from '../../src/models/TagDefinition';

describe('Properties in Defintion', () => {
    it('Properties have multiple subproperties deep', () => {
        let def = new TagDefinition({
            Tag: "INDI", 
            CollectAs: "Individuals", 
            CollectAsArray: true, 
            Property: "Id",
            Properties: [
                { 
                    Tag: "NAME", 
                    Property: "Fullname",
                    Properties: [
                        { Tag: "GIVN", Property: "Givenname" },
                        { Tag: "SURN", Property: "Surname" }
                    ]
                }
            ]
        });

        expect(def.Tag).to.be.equal("INDI");
        expect(def.CollectAs).to.be.equal("Individuals");
        expect(def.CollectAsArray).to.be.true;
        expect(def.Property).to.be.equal("Id");

        expect(def.Properties).to.have.lengthOf(1);
        expect(def.Properties[0].Tag).to.be.equal("NAME");
        expect(def.Properties[0].Property).to.be.equal("Fullname");
        
        expect(def.Properties[0].Properties).to.have.lengthOf(2);
        expect(def.Properties[0].Properties[0].Tag).to.be.equal("GIVN");
        expect(def.Properties[0].Properties[0].Property).to.be.equal("Givenname");
        expect(def.Properties[0].Properties[1].Tag).to.be.equal("SURN");
        expect(def.Properties[0].Properties[1].Property).to.be.equal("Surname");
    });
});