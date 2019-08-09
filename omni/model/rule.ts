import {Factory, IdentifierInterface, RuleInterface} from "omni.interfaces";
import {DataType, RuleBehaviour} from "omni.interfaces/types";
import {assert, extractUndeclaredVarsFromCode, formatCode} from "../utils";

export class Rule implements RuleInterface {
    public id: number | undefined;
    public name: string;
    public aliases: string[] | undefined;
    public title?: string;
    public description: string | undefined;
    public sampleValue: string | undefined;
    public statedAs: string | undefined;
    public dataType: DataType;
    public behaviour: RuleBehaviour | undefined;
    public type: "Rule" = "Rule";
    constructor(ruleInterface: RuleInterface) {
        this.id = ruleInterface.id;
        this.name = ruleInterface.name;
        this.title = ruleInterface.title;
        this.description = ruleInterface.description;
        this.statedAs = ruleInterface.statedAs;
        this.aliases = ruleInterface.aliases;
        this.dataType = ruleInterface.dataType || "string";
        this.sampleValue = ruleInterface.sampleValue;
        this.behaviour = ruleInterface.behaviour || "Normal";
    }
    public expectedFacts() {
        if (this.statedAs !== undefined) {
            return extractUndeclaredVarsFromCode(this.statedAs);
        }
        return [];
    }
    public getRule(): string {
        assert
            (!!this.statedAs, `This rule hasn't been stated`, `FACT-01`);
        let code = this.statedAs || "";
        if ((code.indexOf("theResultIs") === -1)) {
            assert
            (
                code.trim().split(";").length <= 1,
                `When using multiple statements, please use theResultIs.`,
                `FACT-02`
            );
            return formatCode(`theResultIs(${code})`) as string;
        } else {
            return formatCode(code) as string;
        }
    }

    expected: boolean | undefined;
}