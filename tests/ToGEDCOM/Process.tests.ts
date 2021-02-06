import { expect } from 'chai';
import TagDefinition from '../../src/models/TagDefinition';
import { Process } from "../../src/ToGEDCOM/processing/processObject";

describe('Process JSON Object', () => {
    it('Simple Object', () => {
        let result = Process([
            new TagDefinition({ Tag: "HEAD", CollectAs: "Head"}),
            new TagDefinition({ Tag: "SOUR", CollectAs: "Source", Property: "Name"}),
            new TagDefinition({ Tag: "VERS", Property: "Version"})
        ], {
            "Head": {
                "Source": {
                    "Name": "GRAMPS",
                    "Version": "2.2.6-1"
                }
            }
        });

        expect(result).to.deep.equal([
            "0 HEAD",
            "1 SOUR GRAMPS",
            "2 VERS 2.2.6-1"
        ]);
    });

    it('Property of collection has same name as sub-property', () => {
        let result = Process([
            new TagDefinition({ Tag: "HEAD", CollectAs: "Head"}),
            new TagDefinition({ Tag: "SOUR", CollectAs: "Source", Property: "Name"}),
            new TagDefinition({ Tag: "VERS", Property: "Version"}),
            new TagDefinition({ Tag: "NAME", Property: "Name"})
        ], {
            "Head": {
                "Source": {
                    "Name": [
                        "GRAMPS-SourceName",
                        "GRAMPS-Name"
                    ],
                    "Version": "2.2.6-1"
                }
            }
        });

        expect(result).to.deep.equal([
            "0 HEAD",
            "1 SOUR GRAMPS-SourceName",
            "2 VERS 2.2.6-1",
            "2 NAME GRAMPS-Name"
        ]);
    });

    it('Deep definition', () => {
        let result = Process([
            new TagDefinition({ 
                Tag: "INDI", 
                CollectAs: "Individuals", 
                CollectAsArray: true, 
                Property: "Id",
                Properties: [
                    new TagDefinition({ 
                        Tag: "NAME", 
                        Property: "Fullname",
                        Properties: [
                            new TagDefinition({ Tag: "GIVN", Property: "Givenname" }),
                            new TagDefinition({ Tag: "SURN", Property: "Surname" })
                        ]
                    })
                ]
            }),
            new TagDefinition({ Tag: "NAME", Property: "Name"})
        ], {
            "Individuals": [
            {
                "Id": "@Abraham_Simpson@",
                "Fullname": {
                    "Value": "Abraham /Simpson/",
                    "Surname": "Simpson",
                    "Givenname": "Abraham"
                }
            }]
        });

        expect(result).to.deep.equal([
            "0 @Abraham_Simpson@ INDI",
            "1 NAME Abraham /Simpson/",
            "2 SURN Simpson",
            "2 GIVN Abraham"
        ]);
    });

    it('Deep definition and MergeWithLast', () => {
        let result = Process([
            new TagDefinition({ 
                Tag: "INDI", 
                CollectAs: "Individuals", 
                CollectAsArray: true, 
                Property: "Id",
                Properties: [
                    new TagDefinition({ 
                        Tag: "NAME", 
                        Property: "Fullname",
                        Properties: [
                            new TagDefinition({ Tag: "GIVN", Property: "Givenname", MergeWithLast: "INDI" }),
                            new TagDefinition({ Tag: "SURN", Property: "Surname", MergeWithLast: "INDI" })
                        ]
                    })
                ]
            }),
            new TagDefinition({ Tag: "NAME", Property: "Name"})
        ], {
            "Individuals": [
            {
                "Id": "@Abraham_Simpson@",
                "Fullname": "Abraham /Simpson/",
                "Surname": "Simpson",
                "Givenname": "Abraham"
            }]
        });

        expect(result).to.deep.equal([
            "0 @Abraham_Simpson@ INDI",
            "1 NAME Abraham /Simpson/",
            "2 SURN Simpson",
            "2 GIVN Abraham"
        ]);
    });

    it('Deep definition and MergeWithLast order dont matter', () => {
        let result = Process([
            new TagDefinition({ 
                Tag: "INDI", 
                CollectAs: "Individuals", 
                CollectAsArray: true, 
                Property: "Id",
                Properties: [
                    new TagDefinition({ 
                        Tag: "NAME", 
                        Property: "Fullname",
                        Properties: [
                            new TagDefinition({ Tag: "GIVN", Property: "Givenname", MergeWithLast: "INDI" }),
                            new TagDefinition({ Tag: "SURN", Property: "Surname", MergeWithLast: "INDI" })
                        ]
                    })
                ]
            }),
            new TagDefinition({ Tag: "NAME", Property: "Name"})
        ], {
            "Individuals": [
            {
                "Id": "@Abraham_Simpson@",
                "Surname": "Simpson",
                "Fullname": "Abraham /Simpson/",
                "Givenname": "Abraham"
            }]
        });

        expect(result).to.deep.equal([
            "0 @Abraham_Simpson@ INDI",
            "1 NAME Abraham /Simpson/",
            "2 SURN Simpson",
            "2 GIVN Abraham"
        ]);
    });

    it('Deep definition and MergeWithLast order dont matter second try', () => {
        let result = Process([
            new TagDefinition({ 
                Tag: "INDI", 
                CollectAs: "Individuals", 
                CollectAsArray: true, 
                Property: "Id",
                Properties: [
                    new TagDefinition({ 
                        Tag: "NAME", 
                        Property: "Fullname",
                        Properties: [
                            new TagDefinition({ Tag: "GIVN", Property: "Givenname", MergeWithLast: "INDI" }),
                            new TagDefinition({ Tag: "SURN", Property: "Surname", MergeWithLast: "INDI" })
                        ]
                    })
                ]
            }),
            new TagDefinition({ Tag: "NAME", Property: "Name"})
        ], {
            "Individuals": [
            {
                "Id": "@Abraham_Simpson@",
                "Surname": "Simpson",
                "Givenname": "Abraham",
                "Fullname": "Abraham /Simpson/"
            }]
        });

        expect(result).to.deep.equal([
            "0 @Abraham_Simpson@ INDI",
            "1 NAME Abraham /Simpson/",
            "2 SURN Simpson",
            "2 GIVN Abraham"
        ]);
    });

    // it('Object has date', () => {
    //     let result = Process([
    //         new TagDefinition({ Tag: "HEAD", CollectAs: "Head"}),
    //         new TagDefinition({ Tag: "SOUR", CollectAs: "Source", Property: "Name"}),
    //         new TagDefinition({ Tag: "VERS", Property: "Version"}),
    //         new TagDefinition({ Tag: "NAME", Property: "Name"}),
    //         new TagDefinition({ Tag: "DEST", Property: "Destination"}),
    //         new TagDefinition({ Tag: "CHAR", Property: "Characters"}),
    //         new TagDefinition({ Tag: "FILE", Property: "File"}),
    //         new TagDefinition({ Tag: "COPR", Property: "Copyright"}),
    //         new TagDefinition({ Tag: "GEDC", CollectAs: "Gedcom" }),
    //         new TagDefinition({ Tag: "FORM", Property: "Format" }),
    //         new TagDefinition({ Tag: "SUBM", Property: "Id", CollectAs: "Submitter" }),
    //         new TagDefinition({ Tag: "DATE", Property: "Date", Type: "Date" })
    //     ], {
    //         "Head": {
    //             "Source": {
    //                 "Name": [
    //                     "GRAMPS-SourceName",
    //                     "GRAMPS-Name"
    //                 ],
    //                 "Version": "2.2.6-1"
    //             },
    //             "Destination": "GEDCOM 5.5",
    //             "Date": {
    //              "Original": "9 MAR 2007",
    //              "HasYear": true,
    //              "HasMonth": true,
    //              "HasDay": true,
    //              "Value": "2007-03-08T23:00:00.000Z"
    //             },
    //             "Characters": "UTF-8",
    //             "Submitter": {
    //              "Id": "@SUBM@"
    //             },
    //             "File": "/home/bodon/dok/gramps_data/Untitled_1.ged",
    //             "Copyright": "Copyright (c) 2007 .",
    //             "Gedcom": {
    //              "Version": "5.5",
    //              "Format": "LINEAGE-LINKED"
    //             }
    //         }
    //     });

    //     expect(result).to.deep.equal([
    //         "0 HEAD",
    //         "1 SOUR GRAMPS-SourceName",
    //         "2 VERS 2.2.6-1",
    //         "2 NAME GRAMPS-Name",
    //         "1 DEST GEDCOM 5.5",
    //         "1 DATE 9 MAR 2007",
    //         "1 CHAR UTF-8",
    //         "1 SUBM @SUBM@",
    //         "1 FILE /home/bodon/dok/gramps_data/Untitled_1.ged",
    //         "1 COPR Copyright (c) 2007 .",
    //         "1 GEDC",
    //         "2 FORM LINEAGE-LINKED",
    //         "2 VERS 5.5"
    //     ]);
    // });
});