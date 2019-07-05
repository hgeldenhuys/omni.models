import * as ESTree from "estree";
const { Parser } = require("acorn");
import * as recast from "recast";
import {CallExpression} from "estree";
import {DataType} from "omni.interfaces/types";

export const space = " ";
export const commaSpace = ", ";
export const comma = ",";

const detect = require('acorn-globals');

export const specialKeywords = ["space", "comma", "commaSpace"];

export const sampleValue = (dataType: DataType) => {
    if (dataType === "string") {
        return "Sample";
    } else if (dataType === "number") {
        return 100;
    } else if (dataType === "boolean") {
        return true;
    } else if (dataType === "date") {
        return new Date();
    } else {
        return undefined;
    }
};

export const assert = (expr: boolean, message: string, code: string) => {
    if (!expr) {
        throw new Error(`[${code}]: ${message}`);
    }
    return assert;
};

export const getPath = (path: string) => {
    const paths = path.split(".").reverse();
    paths.pop();
    paths.reverse();
    return paths;
};

export const addValueToJsonPath = (json: any, path: string, defaultValue: any, rootName?: string) => {
    const root = json;
    path = path.replace(/\[\]/g, ".?");
    const paths = rootName ? getPath(`${rootName}.${path}`) : getPath(`${path}`);
    let parentNode: any = {};
    let child = "";
    paths.forEach((path) => {
        if (path !== "?") {
            parentNode = json;
            try {
                if (json[path] === undefined) {
                    json[path] = {};
                }
            } catch (e) {
                console.error(`Failed to add path in ${paths}: ${JSON.stringify(root, undefined, 2)}`);
                throw e;
            }
            json = json[path];
        }
        else {
            if (parentNode[child][0] === undefined) {
                parentNode[child] = [{}];
            }
            json = parentNode[child][0];
            parentNode = json;
        }
        child = path;
    });
    if (defaultValue !== undefined) {
        parentNode[child] = defaultValue;
        if (child === "?") {
            parentNode[child] = undefined;
        }
    }
    else {
        delete parentNode[child];
    }
    return root;
};

export const assertValueForPath = (root: {}, paths: string[], testValue: any) => {
    return getValueForPath(root, paths) + "" === testValue + "";
};

export const findUsedBomVariablesInCode = (code: string, rootName: string) => {
    const bomVariablesRx = new RegExp(rootName + "\.([A-Za-z_])+([A-Za-z_0-9\.\[\]])*", "gi");
    const bomVariables = code.match(bomVariablesRx);
    const arrayExpressionsRx = /\[([A-Za-z0-9\+_'' \(\)\t\n\[\]])+\]/g;
    if (bomVariables === null) {
        return [];
    }
    for (let i = 0; i < bomVariables.length; i++) {
        bomVariables[i] = bomVariables[i].replace(arrayExpressionsRx, ".?");
    }
    return bomVariables.filter((variable, index, array) => {
        return array.lastIndexOf(variable) === index;
    });
};

const walk = (tree: any, captured: any[], declared: string[]) => {
    if (tree.left) {
        walk(tree.left, captured, declared);
    }
    if (tree.right) {
        walk(tree.right, captured, declared);
    } else if (tree.type && (tree.type === "CallExpression")) {
        tree.arguments.forEach((arg: any) => {
            if ((arg.type === "FunctionExpression") ||
                 (arg.type === "BlockStatement")){
                captured = captured.concat(extractUndeclaredVars(arg.body));
            } else {
                walk(arg, captured, declared);
            }
        });
    } else if (["Identifier"].indexOf(tree.type) > -1) {
        if (
            (captured.indexOf(tree.name) === -1) &&
            (declared.indexOf(tree.name) === -1) &&
            (specialKeywords.indexOf(tree.name) === -1)) {
            captured.push(tree.name);
        }
    }
    else if (["MemberExpression"].indexOf(tree.type) > -1) {
        if (tree.object.name) {
            if ((captured.indexOf(tree.object.name) === -1) && (declared.indexOf(tree.name) === -1)) {
                captured.push(tree.object.name);
            }
        } else {
            walk(tree.object.object, captured, declared);
        }
    }
};

export const extractUndeclaredVars = (ast: ESTree.Program | ESTree.BlockStatement) => {
    let unknownVars: string[] = [];
    const vars: string[] = [];
    ast.body.forEach((elm) => {
        if (elm.type === "ExpressionStatement") {
            walk(elm.expression, unknownVars, vars);
        } else if (elm.type === "VariableDeclaration") {
            elm.declarations.forEach((dec) => {
                // @ts-ignore
                const name = dec.id.name;
                vars.push(name);
            });
        } else if ((elm.type === "FunctionDeclaration")) {
            unknownVars = unknownVars.concat(
                extractUndeclaredVars(elm.body)
            );
        }
    });
    return unknownVars;
};

export const extractUndeclaredVarsFromCode = (code: string): string[] => {
    const scopes = detect(code);
    return scopes
        .filter((scope: any) => [
            'console',
            'space',
            'Date',
            'BigDecimal',
            'window',
            'document',
            'theResult',
            'theResultIs'
        ].indexOf(scope.name) === -1) // Exclude globals
        .map((scope: any) => {
            return scope.name as string;
        });
};

export const formatCode = (code: string) => {
    const ast = Parser.parse(code);
    return recast.prettyPrint(ast, { tabWidth: 2 }).code as string;
};

export const getValueForPath = (root: {}, paths: string[]) => {
    let object: any = root;
    if (paths.length !== 0) {
        let indexOfArray = paths.indexOf("?");
        indexOfArray = indexOfArray === -1 ? paths.length : indexOfArray;
        const normalPaths = indexOfArray === paths.length ? paths : paths.slice(0, indexOfArray);
        const remainderPaths = indexOfArray === paths.length ? [] : paths.slice(paths.indexOf("?") + 1);
        normalPaths.forEach((path: string) => {
            if (object !== undefined) {
                object = object[path];
            }
        });
        if (object !== undefined) {
            // We have an array
            if (indexOfArray < paths.length) {
                const arr: any[] = object as any[];
                const vals: {}[] = [];
                arr.forEach((item) => {
                    const arrValue = getValueForPath(item, remainderPaths);
                    if (arrValue !== undefined) {
                        vals.push(arrValue);
                    }
                });
                object = vals.length === 0 ? undefined : vals;
            }
        }
        return object;
    }
    return undefined;
};


//
//
// const project = new Project({ compilerOptions: { outDir: "dist", declaration: true } });
// project.createSourceFile("MyFile.ts", "const num = 1;");
//
// // or
// console.log(project.emitSync());