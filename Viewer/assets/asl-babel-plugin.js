const template = require("@babel/template");

// TODO(randomuserhi): Move to separate project and document + make more maintainable 

module.exports = function ( { types: t } ) {
    return {
        visitor: {
            ImportDeclaration(path) {
                const source = path.node.source.value;
                const specifiers = path.node.specifiers;
  
                const type = source.startsWith("@esm") ? "esm" : "asl";

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
            Program(path) {
                // Rename `module` and `require` as they are default to ASL
                path.scope.rename("module");
                path.scope.rename("require");

                const exports = [];
                path.traverse({
                    ExportDeclaration(path) {
                        console.log(path.node);

                        switch(path.node.type) {
                        case "ExportNamedDeclaration": {
                            const declaration = path.node.declaration;
                            if (t.isFunctionDeclaration(declaration)) {
                                exports.push(t.objectProperty(declaration.id, declaration.id));
                                path.replaceWith(declaration);
                            } else if (t.isVariableDeclaration(declaration)) {
                                declaration.declarations.forEach((declarator) => {
                                    exports.push(t.objectProperty(declarator.id, declarator.id));
                                });
                                path.replaceWith(declaration);
                            } else {
                                const specifiers = path.node.specifiers;

                                for (const specifier of specifiers) {
                                    switch(specifier.type) {
                                    case "ExportSpecifier": {
                                        exports.push(t.objectProperty(specifier.exported, specifier.local));
                                    } break;
                                    default: throw new Error(`[ExportNamedDeclaration] Unknown specifier '${specifier.type}'`);
                                    }
                                }

                                path.remove();
                            }
                        } break;
                        default: throw new Error(`Unknown specifier '${path.node.type}'`);
                        }
                    },
                });
        
                if (exports.length > 0) {
                    const exportNode = t.expressionStatement(
                        t.assignmentExpression(
                            "=",
                            t.memberExpression(t.identifier("module"), t.identifier("exports")),
                            t.objectExpression(exports)
                        )
                    );
                    path.pushContainer("body", exportNode);
                }
            }
        },
    };
};