import {expect} from "chai";
import "mocha";
import Fact from "../omni/model/fact";
import Aggregate from "../omni/model/aggregate";
import {addValueToJsonPath} from "../omni/utils";

describe(`Rule result as array`, () => {
    it(`? must add another element`, async () => {
        const x = addValueToJsonPath({}, "bom.geldenhuys[]", "lastname");
        console.log(x);
        addValueToJsonPath(x, "bom.geldenhuys[]", "van");
        console.log(x);

        const aggregate: Aggregate = new Aggregate(undefined,{
            name: "Test",
            facts: [
                {
                    path: "EmailValidation",
                    rules: [
                        {
                            name: "NoEmail",
                            statedAs: "Email === undefined ? 'Email not defined' : false"
                        },
                        {
                            name: "EmptyEmail",
                            statedAs: "Email === '' ? 'Email not filled in' : false"
                        }
                    ]
                }
            ]
        });

        console.log(aggregate.getRules());
        // aggregate.facts[0].name
    });
});
