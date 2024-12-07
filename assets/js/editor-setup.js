require(['vs/editor/editor.main'], function () {
    // Use Monaco's built-in Lua configuration for Luau
    monaco.languages.register({ id: 'luau' });

    // Define a tokenizer configuration for the 'luau' language
    monaco.languages.setMonarchTokensProvider('luau', {
        tokenizer: {
            root: [
                [/\b(if|else|for|while|function|return)\b/, 'keyword'],
                [/\b(true|false|nil)\b/, 'constant'],
                [/".*?"/, 'string'],
                [/\d+/, 'number'],
                [/--\[\[/, { token: 'comment', next: '@comment' }],
                [/--.*$/, 'comment'],
                [/\w+/, 'identifier'],
                [/\.|\,|\;|\:|\(|\)|\{|\}|\[|\]/, 'delimiter']
            ],
            comment: [
                [/[^\]]+/, 'comment'],
                [/\]\]/, { token: 'comment', next: '@pop' }],
                [/\]/, 'comment']
            ]
        }
    });

    // Define a custom theme with a vibrant color scheme
    monaco.editor.defineTheme('luauVibrantTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: 'ff79c6' }, // Bright pink
            { token: 'constant', foreground: 'bd93f9' }, // Light purple
            { token: 'string', foreground: 'f1fa8c' }, // Yellow
            { token: 'number', foreground: 'ffb86c' }, // Orange
            { token: 'comment', foreground: '6272a4' }, // Soft blue
            { token: 'identifier', foreground: 'ff79c6' }, // Bright pink
            { token: 'delimiter', foreground: '8be9fd' } // Cyan
        ],
        colors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2',
            'minimap.background': '#0a0b11',
            'minimap.foreground': '#8be9fd',
        }
    });

    // Apply the vibrant theme
    monaco.editor.setTheme('luauVibrantTheme');

    // Define Luau language configuration
    monaco.languages.setLanguageConfiguration('luau', {
        comments: {
            lineComment: '--',
            blockComment: ['--[[', ']]']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"', notIn: ['string'] },
            { open: '\'', close: '\'', notIn: ['string', 'comment'] },
            { open: '--[[', close: ']]' }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' }
        ]
    });

    // Expand autocompletion with basic Luau functions
    monaco.languages.registerCompletionItemProvider('luau', {
        provideCompletionItems: function (model, position) {
            var textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
            var match = textUntilPosition.match(/game:GetService\(\"(.*?)\"\)/);
            var suggestions = [];
            if (match) {
                // Provide suggestions for GetService
                var services = ['Workspace', 'Players', 'Lighting', 'ReplicatedStorage', 'ServerScriptService'];
                suggestions = services.map(service => ({
                    label: service,
                    kind: monaco.languages.CompletionItemKind.Text,
                    insertText: service
                }));
            } else {
                // Default suggestions
                suggestions = [
                    {
                        label: 'local',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'local '
                    },
                    {
                        label: 'if',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'if '
                    },
                    {
                        label: 'else',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'else '
                    },
                    {
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'for '
                    },
                    {
                        label: 'while',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'while '
                    },
                    {
                        label: 'print',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'print($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'pairs',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'pairs($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'ipairs',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'ipairs($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'tonumber',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'tonumber($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'tostring',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'tostring($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'next',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'next($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'pcall',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'pcall($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'xpcall',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'xpcall($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'wait',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'wait($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'delay',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'delay($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'coroutine.wrap',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'coroutine.wrap($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'coroutine.create',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'coroutine.create($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'coroutine.resume',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'coroutine.resume($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'coroutine.status',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'coroutine.status($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'math.abs',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'math.abs($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'math.random',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'math.random($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'math.sin',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'math.sin($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'math.cos',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'math.cos($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'string.find',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'string.find($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'string.sub',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'string.sub($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'string.gsub',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'string.gsub($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'string.match',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'string.match($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'string.split',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'string.split($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'table.insert',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'table.insert($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'table.remove',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'table.remove($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'table.concat',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'table.concat($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'table.sort',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'table.sort($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'game:GetService',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'game:GetService("$1")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'instance.new',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Instance.new("$1")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'Workspace',
                        kind: monaco.languages.CompletionItemKind.Module,
                        insertText: 'Workspace'
                    },
                    {
                        label: 'Players',
                        kind: monaco.languages.CompletionItemKind.Module,
                        insertText: 'Players'
                    },
                    {
                        label: 'Lighting',
                        kind: monaco.languages.CompletionItemKind.Module,
                        insertText: 'Lighting'
                    },
                    {
                        label: 'ReplicatedStorage',
                        kind: monaco.languages.CompletionItemKind.Module,
                        insertText: 'ReplicatedStorage'
                    },
                    {
                        label: 'FindFirstChild',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'FindFirstChild("$1")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: ':WaitForChild',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: ':WaitForChild("$1")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'HttpGet',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'HttpGet("$1")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'Clone',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Clone()',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'Destroy',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Destroy()',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'loadstring',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'loadstring()',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }
                ];
            }

            // Detect if the user is typing a method call
            var methodCallMatch = textUntilPosition.match(/\b\w+:(\w*)$/);
            if (methodCallMatch) {
                var methods = [
                    ':WaitForChild',
                    ':FindFirstChild',
                    ':GetChildren',
                    ':GetDescendants'
                ];
                var methodSuggestions = methods.map(method => ({
                    label: method,
                    kind: monaco.languages.CompletionItemKind.Method,
                    insertText: method
                }));
                suggestions = suggestions.concat(methodSuggestions);
            }

            // Extract user-defined variables from the code
            var userDefinedVariables = [];
            var codeLines = textUntilPosition.split('\n');
            codeLines.forEach(line => {
                var match = line.match(/\b(local\s+\w+)/);
                if (match) {
                    var variableName = match[1].split(' ')[1];
                    userDefinedVariables.push({
                        label: variableName,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: variableName
                    });
                }
            });

            // Append user-defined variables to suggestions
            suggestions = suggestions.concat(userDefinedVariables);

            return { suggestions: suggestions };
        }
    });

    monaco.editor.create(document.getElementById('editor'), {
        value: `--[[
    Neon Lua Editor
    Made with 💜 by Swift
]]

print("Hello, World!")`,
        language: 'luau',
        automaticLayout: true
    });

    // Prism.js initialization
    Prism.highlightAll();
});
