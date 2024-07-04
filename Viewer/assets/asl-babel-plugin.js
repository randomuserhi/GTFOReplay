const template = require("@babel/template");

// TODO(randomuserhi): Move to separate project and document + make more maintainable 
// NOTE(randomuserhi): Doesnt support default export or export * for now...

module.exports = function ( { types: t } ) {
    return {
        visitor: {
            Program(path) {
                // Ammend imports
                let usedDynamicImport = false;

                path.traverse({
                    ImportDeclaration(path) {
                        let source = path.node.source.value;
                        const specifiers = path.node.specifiers;
          
                        const esmIdentifier = "@esm";
                        const esm = source.startsWith(esmIdentifier);
                        const type = esm ? "esm" : "asl";
                        if (esm) {
                            source = source.slice(esmIdentifier.length + 1);
                        }
        
                        const defaultSpecifiers = [];
                        const importSpecifiers = [];
                        const namespaceSpecifiers = [];
                        for (const specifier of specifiers) {
                            const localName = specifier.local.name;
                            switch(specifier.type) {
                            case "ImportDefaultSpecifier": {
                                defaultSpecifiers.push(`const ${localName} = (await require("${source}", "${type}")).default`);
                            } break;
                            case "ImportSpecifier": {
                                importSpecifiers.push(localName);
                            } break;
                            case "ImportNamespaceSpecifier": {
                                namespaceSpecifiers.push(`const ${localName} = await require("${source}", "${type}")`);
                            } break;
                            default: throw new Error(`Unknown specifier '${specifier.type}'`);
                            }
                        }
          
                        const statements = [];
                        if (defaultSpecifiers.length > 0) statements.push(defaultSpecifiers.join(";\n"));
                        if (importSpecifiers.length > 0) statements.push(`const { ${importSpecifiers.join(",")} } = await require("${source}", "${type}")`);
                        if (namespaceSpecifiers.length > 0) statements.push(namespaceSpecifiers.join(";\n"));
                        path.replaceWith(template.statement.ast`${statements.join(";\n")}`);
                    },
                    CallExpression(path) {
                        if (t.isImport(path.node.callee)) { 
                            usedDynamicImport = true;
                            path.replaceWith(
                                t.callExpression(t.identifier("require"), path.node.arguments)
                            );
                        }
                    },
                });

                if (usedDynamicImport) console.warn("NOTE: The babel compiler for ASL only supports dynamic imports to non-esm modules.");
                
                // Manage renaming `module` and `require` as they are default to ASL
                const identifiersToRename = [];
                path.traverse({
                    Identifier(path) {
                        if (path.node.name === "module") {
                            identifiersToRename.push(path);
                        }
                    },
                });

                // Handle exports
                path.traverse({
                    ExportDeclaration(path) {
                        const rebind = (name) => {
                            path.scope.bindings[name].referencePaths.forEach((refPath) => {
                                if (refPath === path) return;
                                refPath.replaceWith(t.memberExpression(
                                    t.identifier('module.exports'),
                                    t.identifier(name)
                                ));
                            });
                            path.scope.bindings[name].constantViolations.forEach((refPath) => {
                                if (refPath === path) return;
                                if (t.isAssignmentExpression(refPath)) {
                                    refPath.get("left").replaceWith(t.memberExpression(
                                        t.identifier('module.exports'),
                                        t.identifier(name)
                                    ));
                                }
                            });
                        };

                        switch(path.node.type) {
                        case "ExportNamedDeclaration": {
                            const declaration = path.node.declaration;
                            if (t.isFunctionDeclaration(declaration)) {
                                const { id, params, body, generator, async } = declaration;
                                path.replaceWith(t.expressionStatement(t.assignmentExpression(
                                    '=',
                                    t.memberExpression(t.identifier('module.exports'), t.identifier(id.name)),
                                    t.functionExpression(undefined, params, body, generator, async)
                                )));

                                rebind(id.name);
                            } else if (t.isVariableDeclaration(declaration)) {
                                path.replaceWithMultiple(declaration.declarations.map((declarator) => {
                                    if (declarator.init) {
                                        return t.expressionStatement(t.assignmentExpression(
                                            '=',
                                            t.memberExpression(t.identifier('module.exports'), t.identifier(declarator.id.name)),
                                            declarator.init
                                        ));
                                    }
                                    return t.expressionStatement(t.assignmentExpression(
                                        '=',
                                        t.memberExpression(t.identifier('module.exports'), t.identifier(declarator.id.name)),
                                        t.identifier('undefined')
                                    ));
                                }));

                                declaration.declarations.forEach((declarator) => {
                                    rebind(declarator.id.name);
                                });
                            } else if (t.isClassDeclaration(declaration)) {
                                const { id, superClass, body, decorators } = declaration;

                                path.replaceWith(t.expressionStatement(t.assignmentExpression(
                                    '=',
                                    t.memberExpression(t.identifier('module.exports'), t.identifier(id.name)),
                                    t.classExpression(undefined, superClass, body, decorators)
                                )));

                                rebind(id.name);
                            } else {
                                const specifiers = path.node.specifiers;

                                path.replaceWithMultiple(specifiers.map((specifier) => {
                                    switch(specifier.type) {
                                    case "ExportSpecifier": {
                                        return t.expressionStatement(t.assignmentExpression(
                                            '=',
                                            t.memberExpression(t.identifier('module.exports'), specifier.exported),
                                            specifier.local
                                        ));
                                    }
                                    default: throw new Error(`[ExportNamedDeclaration] Unknown specifier '${specifier.type}'`);
                                    }
                                }));
                            }
                        } break;
                        default: throw new Error(`Unknown specifier '${path.node.type}'`);
                        }
                    }
                });

                // Perform rename => done after handling exports to prevent renaming `module.exports.module` from `export const module = ...;` since this is fine
                identifiersToRename.forEach((path) => path.scope.rename("module"));
            }
        },
    };
};