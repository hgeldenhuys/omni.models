import {expect} from "chai";
import "mocha";
import Fact from "../omni/model/fact";
import Aggregate from "../omni/model/aggregate";

describe(`Expected facts`, () => {
    it(`must be derived`, async () => {
        const fact = new Fact({
            dataType: "string",
            rule: {
                name: "LastName",
                statedAs: `const d=[];d.forEach(function(dd) {console.log(dd + PickingUpThisVar);
            });console.log(VarAsArg);console.log(Parameter1Var + Parameter2Var); 
            UndefinedVarAssignment = 888; const x = 123;let xx = 123;
            VarOfObject.Name + ' ' + VarOfObject.LastName.length + ';' + VarConstant + oop();
            function s (x) {const a = x;VarInFunction=44}theResultIs(1234);`
            }
        });
        expect(fact.rule && fact.rule.expectedFacts().toString()).to.equal(
            `Parameter1Var,Parameter2Var,PickingUpThisVar,UndefinedVarAssignment,VarAsArg,VarConstant,VarInFunction,VarOfObject,oop`);


        const sit = new Aggregate(undefined, {
            "id": 1001961417934,
            "name": "Names",
            "version": {major: 1, minor: 0, patch: 0},
            "facts": [
                {
                    dataType: "string",
                    "path": "Person.FullName",
                    "rule": {
                        "id": 1001258227052,
                        "name": "FullName",
                        "description": "Full name of a person",
                        "title": "Full name",
                        "statedAs": "FirstName + \" \" + LastName"
                    }
                },
                {
                    dataType: "string",
                    "path": "Mirror.FullName",
                    "rule": {
                        "id": 1001661904664,
                        "name": "FullNameReverse",
                        "description": "Full Name Reversed",
                        "title": "Reverse Fullname",
                        "statedAs": "LastName + \" \" + FirstName"
                    }
                }
            ],
            "description": "Names collection"
        });
    });
});

describe(`When a fact has a definition`, () => {
    it(`isn't expected`, () => {
        const fact = new Fact({
            dataType: "string",
            rule: {
                name: "LastName",
                statedAs: `123`
            }});
        // expect(fact.expected).to.equal(false);
        expect(fact.rule && fact.rule.expectedFacts().length).to.equal(0);
    });
});

describe(`When a fact requires a fact in the definition`, () => {
    it(`is expected to have 1 fact`, () => {
        const fact = new Fact({
            dataType: "string",
            rule:{
                name: "AgeTitle",
                statedAs: `Age + "years old"`
            }});
        // expect(fact.expected).to.equal(true);
        expect(fact.rule && fact.rule.expectedFacts().length).to.equal(1);
        expect(fact.rule && fact.rule.expectedFacts()[0]).to.equal("Age");
    });
});

describe(`The generated rule`, () => {
    it(`should return the result`, () => {
        const fact = new Fact({
            dataType: "string",
            rule:{
                name: "Person.Name",
                statedAs: `"Hermanus"`
            }});
        expect(fact.rule && fact.rule.getRule()).to.equal(`theResultIs("Hermanus");`);
    });
});

describe(`Guess a data type`, () => {
    it(`should return a number`, () => {
        const fact = new Fact({
            sampleValue: 10
        });
        expect(fact.dataType).to.equal("number");
    });
});

describe(`Guess a data type`, () => {
    it(`should return a string`, () => {
        const fact = new Fact({
            sampleValue: "Hello"
        });
        expect(fact.dataType).to.equal("string");
    });
});

describe(`Guess a data type`, () => {
    it(`should return a string`, () => {
        const fact = new Fact({
            sampleValue: false
        });
        expect(fact.dataType).to.equal("boolean");
    });
});

describe(`Guess a data type`, () => {
    it(`should return a date`, () => {
        const fact = new Fact({
            sampleValue: new Date()
        });
        expect(fact.dataType).to.equal("date");
    });
});

describe(`Fact with path of "Person.Name" without name`, () => {
    it(`should create name of PersonName`, () => {
        const fact = new Fact({
            path: "Person.Name"
        });
        expect(fact.name).to.equal("PersonName");
    });
});

describe(`Fact with name of "PersonName" without path`, () => {
    it(`should create path of Person.Name`, () => {
        const fact = new Fact({
            path: "Person.Name"
        });
        expect(fact.path).to.equal("Person.Name");
    });
});

describe(`Fact without name or path should get path from rule with name of "PersonName"`, () => {
    it(`should create path of Person.Name and name of PersonName`, () => {
        const fact = new Fact({
            rule: {
                name: "PersonName"
            }
        });
        expect(fact.path).to.equal("PersonName");
        expect(fact.name).to.equal("PersonName");
    });
});
