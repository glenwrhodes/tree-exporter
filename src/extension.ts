import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function generateTreeString(dir: string, prefix = '', treeString = ''): string {
    const files = fs.readdirSync(dir);
    const len = files.length;

    files.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const isLast = index === len - 1;
        const newPrefix = isLast ? '└── ' : '├── ';

        treeString += prefix + newPrefix + file + '\n';

        if (fs.statSync(filePath).isDirectory()) {
            const childPrefix = isLast ? '    ' : '│   ';
            treeString = generateTreeString(filePath, prefix + childPrefix, treeString);
        }
    });

    return treeString;
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('tree-exporter.export', () => {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Please open a folder first');
            return;
        }

        const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const treeString = generateTreeString(rootPath);
        const treeDoc = vscode.workspace.openTextDocument({ content: treeString });

        treeDoc.then((doc) => vscode.window.showTextDocument(doc));
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
