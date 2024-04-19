import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "code-generator" is now active!');

    let disposable = vscode.commands.registerCommand('extension.generateCode', async () => {
        // Get user input
        const userInput = await vscode.window.showInputBox({ prompt: 'Enter your code generation prompt:' });
        if (!userInput) {
            vscode.window.showErrorMessage('No input provided. Code generation canceled.');
            return;
        }

        // Call ChatGPT API
        try {
            const generatedCode = await generateCode(userInput);
            if (!generatedCode) {
                vscode.window.showErrorMessage('Failed to generate code. Please try again.');
                return;
            }

            // Insert generated code into active editor
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, generatedCode);
                });
            } else {
                vscode.window.showErrorMessage('No active editor found.');
            }
        } catch (error) {
            console.error('Error generating code:', error);
            vscode.window.showErrorMessage('An error occurred while generating code.');
        }
    });

    context.subscriptions.push(disposable);
}

async function generateCode(prompt: string): Promise<string | undefined> {
    // Prepare request options
    const requestOptions: vscode.RequestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.7,
            top_p: 1,
            n: 1
        })
    };

    // Send request to ChatGPT API
    const response = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'Generating code...'
    }, async () => {
        const result = await vscode.workspace.fs.fetch(
            vscode.Uri.parse('https://api.openai.com/v1/engines/davinci-codex/completions'),
            requestOptions
        );

        const responseBody = await result.text();
        return JSON.parse(responseBody);
    });

    return response.choices[0].text.trim();
}

export function deactivate() {}
