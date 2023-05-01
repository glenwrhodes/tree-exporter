import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function generateTreeString(dir: string, prefix = '', treeString = '', exclude: Set<string> = new Set()): string {
	const files = fs.readdirSync(dir).filter((file) => {
	  const filePath = path.join(dir, file);
	  return !(exclude.has(file) || (file === '.git' && fs.statSync(filePath).isDirectory()));
	});
	const len = files.length;

	if (!prefix) {
		treeString += path.basename(dir) + '\n';
	}

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
	console.log('Activating Tree Exporter extension');
	
	// Store excluded directories
	const excludedDirectories: Set<string> = new Set();
  
	context.subscriptions.push(
	  vscode.commands.registerCommand('extension.exportTree', (uri?: vscode.Uri) => {
		console.log('Running Tree Exporter command');
		if (!vscode.workspace.workspaceFolders) {
		  vscode.window.showErrorMessage('Please open a folder first');
		  return;
		}
  
		const rootPath = uri ? uri.fsPath : vscode.workspace.workspaceFolders[0].uri.fsPath;
		const treeString = generateTreeString(rootPath, '', '', excludedDirectories);
		const treeDoc = vscode.workspace.openTextDocument({ content: treeString });
  
		treeDoc.then((doc) => vscode.window.showTextDocument(doc));
	  })
	);
  
	context.subscriptions.push(
	  vscode.commands.registerCommand('extension.excludeFromTreeExport', (uri?: vscode.Uri) => {
		console.log('Running Exclude from Tree Export command');
		if (!uri || !fs.statSync(uri.fsPath).isDirectory()) {
		  vscode.window.showErrorMessage('Please right-click on a folder to exclude');
		  return;
		}
  
		const folderName = path.basename(uri.fsPath);
		excludedDirectories.add(folderName);
		vscode.window.showInformationMessage(`Excluded folder: ${folderName}`);
	  })
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.includeInTreeExport', (uri?: vscode.Uri) => {
		  console.log('Running Include in Tree Export command');
		  if (!uri || !fs.statSync(uri.fsPath).isDirectory()) {
			vscode.window.showErrorMessage('Please right-click on a folder to include');
			return;
		  }
	
		  const folderName = path.basename(uri.fsPath);
		  if (excludedDirectories.has(folderName)) {
			excludedDirectories.delete(folderName);
			vscode.window.showInformationMessage(`Included folder: ${folderName}`);
		  } else {
			vscode.window.showInformationMessage(`Folder not excluded: ${folderName}`);
		  }
		})
	  );
  
	context.subscriptions.push();
  }

export function deactivate() { }
