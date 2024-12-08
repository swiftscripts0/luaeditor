require(['vs/editor/editor.main', 'luaparse'], function (monaco, luaparse) {

    const editors = new Map();
    let tabCount = 1;
    let tabContents = new Map(); // Store content for each tab

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
                        label: 'function',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'function '
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

            // Add user-defined variables to the suggestions
            suggestions = suggestions.concat(userDefinedVariables);

            return { suggestions: suggestions };
        }
    });

    // Enhanced error detection and highlighting
    function detectAndHighlightErrors(editor) {
        // Clear previous error decorations
        const model = editor.getModel();
        const currentDecorations = model.getAllDecorations();
        const errorDecorationIds = currentDecorations
            .filter(dec => dec.options.className === 'error-line')
            .map(dec => dec.id);
        model.deltaDecorations(errorDecorationIds, []);

        // Get the full text of the editor
        const code = model.getValue();

        try {
            // Use luaparse to detect syntax errors
            const parseResult = luaparse.parse(code, {
                comments: true,
                scope: true,
                locations: true,
                ranges: true
            });

            // If parsing succeeds with no errors, return
            return [];
        } catch (error) {
            // If there's a parsing error, highlight the problematic line
            if (error.line) {
                const errorDecoration = {
                    range: new monaco.Range(error.line, 1, error.line, model.getLineMaxColumn(error.line)),
                    options: {
                        isWholeLine: true,
                        className: 'error-line',
                        glyphMarginClassName: 'error-glyph',
                        hoverMessage: { value: `Syntax Error: ${error.message}` }
                    }
                };

                // Apply the error decoration
                model.deltaDecorations([], [errorDecoration]);

                // Optional: Show error message in console
                console.error(`Syntax Error on line ${error.line}: ${error.message}`);

                return [error.line];
            }
        }

        return [];
    }

    // Add error detection to editor change events with line-specific tracking
    function setupErrorDetection(editor) {
        // Track last edited lines and their typing state
        const lineTypingState = new Map();
        
        // Debounce timers for each line
        const lineDebounceTimers = new Map();

        editor.onDidChangeModelContent((event) => {
            event.changes.forEach(change => {
                const startLineNumber = change.range.startLineNumber;
                
                // Clear any existing debounce timer for this line
                if (lineDebounceTimers.has(startLineNumber)) {
                    clearTimeout(lineDebounceTimers.get(startLineNumber));
                }

                // Set a new debounce timer
                const timer = setTimeout(() => {
                    // Remove the timer from the map
                    lineDebounceTimers.delete(startLineNumber);
                    
                    // Detect and highlight errors
                    detectAndHighlightErrors(editor);
                }, 1000); // 1 second after last typing

                // Store the timer
                lineDebounceTimers.set(startLineNumber, timer);
            });
        });
    }

    // Modify existing editor creation to ensure error detection
    function createEditorInstance(container) {
        const editor = monaco.editor.create(container, {
            language: 'luau',
            theme: 'luauVibrantTheme',
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            cursorStyle: 'line',
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on'
        });

        // Setup error detection for this editor
        setupErrorDetection(editor);

        return editor;
    }

    // Apply error detection to existing editors
    editors.forEach(editor => {
        setupErrorDetection(editor);
    });

    // Function to save tab content
    function saveTabContent(tabId) {
        const editor = editors.get(tabId);
        if (editor) {
            tabContents.set(tabId, editor.getValue());
        }
    }

    // Function to restore tab content
    function restoreTabContent(tabId) {
        const editor = editors.get(tabId);
        if (editor) {
            const content = tabContents.get(tabId) || '';
            editor.setValue(content);
        }
    }

    // Special function to handle the initial default tab
    function initializeDefaultTab() {
        const defaultTabContainer = document.querySelector('.tab-container');
        const defaultEditorWrapper = document.getElementById('editor-wrapper');
        
        // Ensure the first tab is always 'main.lua'
        const defaultTab = document.querySelector('.tab[data-tab-id="tab-1"]');
        if (!defaultTab) return;

        // Create editor container if not exists
        let defaultEditorContainer = document.getElementById('editor-tab-1');
        defaultEditorContainer.style.width = '100%';
        defaultEditorContainer.style.height = '100%';
        if (!defaultEditorContainer) {
            defaultEditorContainer = document.createElement('div');
            defaultEditorContainer.id = 'editor-tab-1';
            defaultEditorContainer.className = 'editor-instance';
            defaultEditorContainer.style.width = '100%';
            defaultEditorContainer.style.height = '100%';
            defaultEditorWrapper.appendChild(defaultEditorContainer);
        }

        // Create editor instance
        const defaultEditor = createEditorInstance(defaultEditorContainer);
        
        // Set default content
        const defaultContent = `--[[
    Neon Lua Editor
    Made with 💜 by Swift
]]

print("Hello, World!")`;
        defaultEditor.setValue(defaultContent);
        
        // Store the default editor
        editors.set('tab-1', defaultEditor);
        tabContents.set('tab-1', defaultContent);

        // Modify close button behavior
        const closeButton = defaultTab.querySelector('.close-tab');
        closeButton.style.display = 'none'; // Hide close button for default tab

        // Ensure default tab is active
        setActiveTab(defaultTab);
    }

    // Modified createNewTab function to use dynamic tab naming
    function createNewTab() {
        // Find the next available tab number
        let nextTabNumber = 2;
        const existingTabs = document.querySelectorAll('.tab');
        
        // Check for existing tab numbers
        const usedNumbers = Array.from(existingTabs)
            .map(tab => {
                const match = tab.textContent.match(/Untitled-(\d+)/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(num => num > 1);

        // Find the lowest unused number
        while (usedNumbers.includes(nextTabNumber)) {
            nextTabNumber++;
        }

        const tabId = `tab-${nextTabNumber}`;
        
        // Create tab button
        const tab = document.createElement('button');
        tab.className = 'tab';
        tab.dataset.tabId = tabId;
        tab.innerHTML = `Untitled-${nextTabNumber}.lua<span class="close-tab">x</span>`;
        
        // Create editor container
        const editorContainer = document.createElement('div');
        editorContainer.id = `editor-${tabId}`;
        editorContainer.className = 'editor-instance';
        editorContainer.style.display = 'none';
        editorContainer.style.width = '100%';
        editorContainer.style.height = '100%';
        document.getElementById('editor-wrapper').appendChild(editorContainer);
        
        // Create new editor instance
        const editor = createEditorInstance(editorContainer);
        editors.set(tabId, editor);
        tabContents.set(tabId, `--[[
    Neon Lua Editor
    Made with 💜 by Swift
]]

print("Hello, World!")`);
        
        // Add tab click event
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('close-tab')) {
                setActiveTab(tab);
            }
        });
        
        // Add close button event
        tab.querySelector('.close-tab').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab);
        });
        
        // Insert tab before the new tab button
        const newTabBtn = document.querySelector('.new-tab-btn');
        newTabBtn.parentNode.insertBefore(tab, newTabBtn);
        
        return tab;
    }

    // Modify closeTab to handle tab numbering
    function closeTab(tab) {
        const tabId = tab.dataset.tabId;
        
        // Prevent closing the first tab
        if (tabId === 'tab-1') {
            return;
        }
        
        const editorElement = document.querySelector(`#editor-${tabId}`);
        
        // Clean up editor instance and content
        if (editors.has(tabId)) {
            editors.get(tabId).dispose();
            editors.delete(tabId);
            tabContents.delete(tabId);
        }
        
        // Remove DOM elements
        if (editorElement) {
            editorElement.remove();
        }
        tab.remove();
        
        // If closed tab was active, activate another tab
        if (tab.classList.contains('active')) {
            const remainingTabs = document.querySelectorAll('.tab');
            if (remainingTabs.length > 0) {
                setActiveTab(remainingTabs[remainingTabs.length - 1]);
            }
        }
        
        // If no tabs left, create a new one
        if (document.querySelectorAll('.tab').length === 0) {
            const newTab = createNewTab();
            setActiveTab(newTab);
        }
    }

    // Modify setActiveTab to ensure robust tab switching
    function setActiveTab(tab) {
        // Prevent unnecessary re-activation of current tab
        if (tab.classList.contains('active')) {
            return;
        }

        // Save content of current active tab before switching
        const currentActiveTab = document.querySelector('.tab.active');
        if (currentActiveTab) {
            const currentTabId = currentActiveTab.dataset.tabId;
            saveTabContent(currentTabId);
        }

        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        
        // Hide all editor instances
        document.querySelectorAll('.editor-instance').forEach(editor => {
            editor.style.display = 'none';
        });

        // Set new active tab
        tab.classList.add('active');
        const tabId = tab.dataset.tabId;
        const editorElement = document.querySelector(`#editor-${tabId}`);
        
        if (editorElement) {
            editorElement.style.display = 'block';
            const editor = editors.get(tabId);
            if (editor) {
                editor.layout(); // Ensure proper layout
                editor.focus();
                
                // Restore content if exists
                const content = tabContents.get(tabId) || '';
                editor.setValue(content);
            }
        }
    }

    // Function to rename a tab
    function renameTab(tab) {
        // Prevent renaming if already in rename mode
        if (tab.querySelector('.tab-rename-input')) return;

        const currentName = tab.textContent.replace('x', '').trim();
        
        // Create input for renaming
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.classList.add('tab-rename-input');

        // Store original children to restore later
        const originalChildren = Array.from(tab.childNodes);

        // Replace tab content with input
        tab.innerHTML = '';
        tab.appendChild(input);
        input.focus();
        input.select();

        // Flag to prevent multiple rename attempts
        let isRenamed = false;

        // Handle rename completion
        function completeRename(newName) {
            // Prevent multiple executions
            if (isRenamed) return;
            isRenamed = true;

            // Use the provided name or fallback to current name
            const finalName = (newName || input.value).trim() || currentName;
            
            // Restore tab with new name
            tab.innerHTML = `${finalName} <span class="close-tab">x</span>`;
            const newCloseButton = tab.querySelector('.close-tab');
            newCloseButton.addEventListener('click', () => closeTab(tab));
        }

        // Handle cancellation
        function cancelRename() {
            // Prevent multiple executions
            if (isRenamed) return;
            isRenamed = true;

            // Restore original tab
            tab.innerHTML = '';
            originalChildren.forEach(child => tab.appendChild(child));
        }

        // Event listeners
        input.addEventListener('blur', () => {
            if (!isRenamed) {
                completeRename();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                completeRename();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelRename();
            }
        });
    }

    // Add double-click event listener for tab renaming
    document.querySelector('.tab-container').addEventListener('dblclick', function(e) {
        const tab = e.target.closest('.tab');
        if (tab && !tab.classList.contains('new-tab-btn')) {
            renameTab(tab);
        }
    });

    // Function to highlight error lines
    function highlightErrorLine(editor, lineNumber) {
        // Remove any existing error decorations
        const model = editor.getModel();
        const errorDecorations = model.deltaDecorations(
            [], 
            [{
                range: new monaco.Range(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber)),
                options: {
                    isWholeLine: true,
                    className: 'error-line',
                    glyphMarginClassName: 'error-glyph'
                }
            }]
        );
        return errorDecorations;
    }

    // CSS for error line highlighting (add to styles.css)
    const errorLineStyle = document.createElement('style');
    errorLineStyle.textContent = `
        .error-line {
            background-color: rgba(255, 0, 0, 0.1) !important;
            border-left: 3px solid red !important;
        }
        .error-glyph {
            background-color: red;
            width: 10px;
            margin-left: 5px;
        }
    `;
    document.head.appendChild(errorLineStyle);

    // Expose error highlighting function globally
    window.highlightErrorLine = highlightErrorLine;

    // Add a global method to trigger error highlighting on the current line
    window.triggerErrorHighlight = function() {
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return;

        const activeEditor = editors.get(activeTab.dataset.tabId);
        if (!activeEditor) return;

        // Get the current line number
        const position = activeEditor.getPosition();
        if (!position) return;

        // Highlight the current line
        highlightErrorLine(activeEditor, position.lineNumber);
    };

    // Add a keyboard shortcut to trigger error highlighting
    document.addEventListener('keydown', function(e) {
        // Ctrl + E to highlight current line as an error
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            window.triggerErrorHighlight();
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        const tabContainer = document.querySelector('.tab-container');

        // Enhanced tab switching event listener
        tabContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            
            // Ensure we've clicked on a tab, but not the close button
            if (tab && !e.target.classList.contains('close-tab')) {
                // Always try to set this tab as active
                setActiveTab(tab);
            }
        });

        // Existing initialization code remains the same
        const newTabBtn = document.querySelector('.new-tab-btn');

        // Initialize the default tab
        initializeDefaultTab();

        // New tab button functionality
        newTabBtn.addEventListener('click', () => {
            const newTab = createNewTab();
            setActiveTab(newTab);
        });

        // Close tab event delegation
        tabContainer.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.close-tab');
            if (closeBtn) {
                const tab = closeBtn.closest('.tab');
                closeTab(tab);
            }
        });

        // Implement file operations
        function readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = event => resolve(event.target.result);
                reader.onerror = error => reject(error);
                reader.readAsText(file);
            });
        }

        // Implement drag and drop
        const editorWrapperContainer = document.getElementById('editor-wrapper').parentNode;
        
        editorWrapperContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            editorWrapperContainer.style.border = '2px dashed #8be9fd';
        });

        editorWrapperContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            editorWrapperContainer.style.border = 'none';
        });

        editorWrapperContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            editorWrapperContainer.style.border = 'none';

            const file = e.dataTransfer.files[0];
            if (file) {
                try {
                    const content = await readFile(file);
                    const activeTab = document.querySelector('.tab.active');
                    const activeEditor = editors.get(activeTab.dataset.tabId);
                    activeEditor.setValue(content);
                    activeTab.firstChild.textContent = file.name;
                    tabContents.set(activeTab.dataset.tabId, content);
                } catch (error) {
                    console.error('Error reading file:', error);
                }
            }
        });

        // Implement button functionalities
        document.getElementById('openFileButton').addEventListener('click', async () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.lua,.txt';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const content = await readFile(file);
                        const activeTab = document.querySelector('.tab.active');
                        const activeEditor = editors.get(activeTab.dataset.tabId);
                        activeEditor.setValue(content);
                        activeTab.firstChild.textContent = file.name;
                        tabContents.set(activeTab.dataset.tabId, content);
                    } catch (error) {
                        console.error('Error reading file:', error);
                    }
                }
            };
            
            input.click();
        });

        document.getElementById('saveFileButton').addEventListener('click', () => {
            const activeTab = document.querySelector('.tab.active');
            const activeEditor = editors.get(activeTab.dataset.tabId);
            const content = activeEditor.getValue();
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = activeTab.firstChild.textContent || 'script.lua';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });

        document.getElementById('clearButton').addEventListener('click', () => {
            const activeTab = document.querySelector('.tab.active');
            const activeEditor = editors.get(activeTab.dataset.tabId);
            activeEditor.setValue('');
        });
    });
});