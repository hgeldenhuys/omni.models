import Aggregate from "../model/aggregate";
import {AggregateInterface, BoundaryInterface, DomainModelInterface} from "omni.interfaces";

export default class Boundary implements BoundaryInterface {
    aggregates: AggregateInterface[];
    name: string;

    constructor(boundedContextInterface: BoundaryInterface) {
        this.aggregates = boundedContextInterface.aggregates
            .map((aggregate) => new Aggregate(undefined, aggregate));
        this.name = boundedContextInterface.name;
        this.description = boundedContextInterface.description || "";
        this.domainModel = boundedContextInterface.domainModel;
        this.id = boundedContextInterface.id || 0;
        this.title = boundedContextInterface.title || "";
    }

    description: string;
    domainModel: DomainModelInterface;
    id: number;
    title: string;
    type: "Boundary" = "Boundary";
}