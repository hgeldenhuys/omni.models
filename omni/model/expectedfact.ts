import {ExpectedFactInterface} from "omni.interfaces";

export class ExpectedFact implements ExpectedFactInterface {
    expectedBy: string[];
    name: string;
    constructor(expectedFactInterface: ExpectedFactInterface) {
        this.name = expectedFactInterface.name;
        this.expectedBy = expectedFactInterface.expectedBy;
    }
}