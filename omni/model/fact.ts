import {Rule} from "./rule";
import {FactInterface, PathMappingInterface} from "omni.interfaces";
import {DataType} from "omni.interfaces/types";
import {assert, guessTypeOf} from "../utils";

export default class Fact implements FactInterface {
    public name?: string;
    public path?: string;
    public rule?: Rule;
    public rules?: Rule[];
    public pathMapping: PathMappingInterface[];
    public expectedFacts: string[];
    public dataType: DataType;
    public type: "Fact" = "Fact";
    public sampleValue: any;
    public enumerations?: string[];
    constructor(fact: FactInterface) {
        assert(!(!!fact.rule && !!fact.rules), "Cannot specify both rule and rules attribute", "FACT-100");
        assert((!!fact.rules && !!fact.path) || !fact.rules, "If rules are multiple, specify a fact's path", "FACT-200");
        this.path = fact.path || (
            fact.name ? fact.name.replace(/([A-Z])/g, '.$1').trim() : (
                fact.rule ? fact.rule.name.split(".").join("") : undefined
            )
        );
        // this.path += this.rules ? "[]" : "";
        this.name = fact.name || (
            this.path ? this.path.split(".").join("") : (
                fact.rule ? fact.rule.name : undefined
            )
        );
        if (fact.rule) {
            this.rule = new Rule(fact.rule);
            this.expectedFacts = this.rule.expectedFacts();
        } else if (fact.rules) {
            fact.dataType = "array";
            this.rules = fact.rules.map(rule => new Rule(rule));
            this.expectedFacts = [];
            this.rules.forEach(rule => {
                rule.expectedFacts().forEach(fact => this.expectedFacts.push(fact));
            });
        } else {
            this.expectedFacts = [];
        }
        this.pathMapping = fact.pathMapping || [];
        this.dataType = fact.dataType || "string";
        this.sampleValue = {"bigint": "100", "string": "SampleString", "number": 7, "boolean": false, "date": Date.now(), "array": [], "object": {}}[this.dataType];

        if ((fact.sampleValue !== void 0) && (fact.dataType !== this.dataType)) {
            this.dataType = guessTypeOf(fact.sampleValue);
        }
        this.enumerations = fact.enumerations;
    }
    getPath(name: string): string {
        const pathMap = this.pathMapping.find(map => map.replaceName === name);
        return ((pathMap && pathMap.withPath) || name);
    }
}
