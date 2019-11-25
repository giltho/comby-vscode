// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { handler } from './handler';
import { provider, commandName } from './substCL';
import rewrite from './rewrite';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

		context.subscriptions.push(vscode.commands.registerCommand('comby-vscode.searchAndReplace', handler));
		context.subscriptions.push(vscode.commands.registerCommand(commandName, rewrite));
		vscode.languages.registerCodeLensProvider("*", provider);

}

// this method is called when your extension is deactivated
export function deactivate() {}