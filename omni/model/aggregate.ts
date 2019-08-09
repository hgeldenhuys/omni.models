import Fact from "./fact";
import {Rule} from "./rule";
import {AggregateInterface, ExpectedFactInterface, FactInterface, RuleStructureInterface} from "omni.interfaces";
import {DecisionObjectType} from "omni.interfaces/types";
import {VersionInterface} from "omni.interfaces/interfaces/version";
import {addValueToJsonPath, extractUndeclaredVarsFromCode, sampleValue} from "../utils";

const md5Hex = require('md5-hex');

export const ROOT_NAME = "bom";

function getRuleStructure(fact: Fact, rule: Rule, ruleIsArray: boolean) {
    let code = rule.getRule();
    const vars = extractUndeclaredVarsFromCode(code);
    vars.forEach((name) => {
        const factName = new RegExp(name + "(?=([^\"]*\"[^\"]*\")*[^\"]*$)", "gi"); // Don't escape names between double quotes
        code = code.replace(factName, `${ROOT_NAME}.${fact.getPath(name)}`);
    });
    return {
        name: (fact.path || rule.name) + (ruleIsArray ? "[]" : ""),
        code: code,
        ruleCode: rule.name,
        behaviour: rule.behaviour,
        absolute: undefined,
        variables: rule.expectedFacts(),
        enumerations: fact.enumerations
    };
}

export default class Aggregate implements AggregateInterface {
    public id: number | undefined;
    public decisionObjectType?: DecisionObjectType;
    public facts: Fact[];
    public name: string;
    public description: string | undefined;
    public version?: VersionInterface;
    public type: "Aggregate" = "Aggregate";
    constructor(parent: Aggregate | undefined, aggregate: AggregateInterface) {
        this.id = aggregate.id;
        this.name = aggregate.name;
        this.description = aggregate.description;
        this.version = aggregate.version;
        this.facts = [];
        aggregate.facts && aggregate.facts.forEach((fact: FactInterface) => {
            this.facts.push(new Fact(fact));
        });
    }

    getOutputs() {
        return this.facts.filter(fact => fact.rule || fact.rules);
    }

    getRules() {
        const outputs = this.getOutputs()
            .filter(fact => fact.rule || fact.rules),
            rules: RuleStructureInterface[] = [];
        outputs
            .forEach((fact): void => {
                if (fact.rule) {
                    rules.push(getRuleStructure(fact, fact.rule, false));
                } else if (fact.rules) {
                    fact.rules.forEach(rule => rules.push(getRuleStructure(fact, rule, true)));
                }
            });
        return rules;
    }

    schemaVersion() {
        const data = this.facts.map(fact => fact.path + "." + (fact.rule && fact.rule.dataType)).join("|");
        return md5Hex(data);
    }

    public missingExpectedFacts(): ExpectedFactInterface[] {
        let missing: ExpectedFactInterface[] = [];
        this.facts.forEach((fact) => {
            const expectedFacts = fact.expectedFacts.map(name => fact.getPath(name));
            if (expectedFacts !== undefined) {
                expectedFacts.forEach((expected) => {
                    let missingEntry = missing.find(entry => entry.name === expected);
                    if (missingEntry === undefined) {
                        missingEntry = {
                            name: expected,
                            expectedBy: []
                        };
                        missing.push(missingEntry);
                    }
                    missingEntry.expectedBy.push(fact.path || (fact.rule && fact.rule.name) || "");
                });
            }
        });
        return missing.filter((entry) => {
            const factName = new RegExp(entry.name, "gi");
            return this.facts.find((fact) => {
                return fact.path && fact.path.match(factName);
            }) === undefined
        });
    }

    public sampleJson(): any {
        const sampleBom = {};
        this.missingExpectedFacts().forEach((entry) => {
            addValueToJsonPath(sampleBom, `${ROOT_NAME}.${entry.name}`, "missing");
        });
        this.facts.forEach((fact) => {
            const path = `${ROOT_NAME}.${fact.path}`;
            if (fact.rule && fact.rule.statedAs === undefined) {
                let value = fact.rule.sampleValue !== undefined ? fact.rule.sampleValue : sampleValue(fact.rule.dataType);
                addValueToJsonPath(sampleBom, path, value);
            } else if (fact.rule === undefined) {
                if (fact.dataType === "string") {
                    addValueToJsonPath(sampleBom, path, fact.sampleValue);
                } else if ((fact.dataType === "number")) {
                    addValueToJsonPath(sampleBom, path, 10);
                } else if (fact.dataType === "date") {
                    addValueToJsonPath(sampleBom, path, new Date().getTime());
                } else if (fact.dataType === "boolean") {
                    addValueToJsonPath(sampleBom, path, false);
                } else {
                    addValueToJsonPath(sampleBom, path, "Unknown");
                }
            }
        });
        return sampleBom;
    }

    public sampleJsonWithDataTypes(): any {
        const sampleBom = {};
        this.missingExpectedFacts().forEach((entry) => {
            addValueToJsonPath(sampleBom, `${ROOT_NAME}.${entry.name}`, "unknown:0");
        });
        this.facts.forEach((fact) => {
            const path = `${ROOT_NAME}.${fact.path}`;
            let value = (fact.rule && fact.rule.dataType) || "string";
            let id = (fact.rule && fact.rule.id) || 0;
            addValueToJsonPath(sampleBom, path, `${value}:${id}`);
        });

        return sampleBom;
    }
}
