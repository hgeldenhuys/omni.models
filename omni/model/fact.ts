import {Rule} from "./rule";
import {FactInterface, PathMappingInterface} from "omni.interfaces";
import {DataType} from "omni.interfaces/types";

export default class Fact implements FactInterface {
    public path?: string;
    public rule?: Rule;
    public pathMapping: PathMappingInterface[];
    public expectedFacts: string[];
    public dataType: DataType;
    public type: "Fact" = "Fact";
    constructor(fact: FactInterface) {
        if (fact.rule) {
            this.rule = Rule.new(fact.rule);
            this.path = fact.path || fact.rule.name;
            this.expectedFacts = this.rule.expectedFacts();
        } else {
            this.path = fact.path;
            this.expectedFacts = [];
        }
        this.pathMapping = fact.pathMapping || [];
        this.dataType = fact.dataType || "string";
    }
    getPath(name: string): string {
        const pathMap = this.pathMapping.find(map => map.replaceName === name);
        return (pathMap && pathMap.withPath) || name;
    }
}
