import { window, Disposable, TextEditorDecorationType, Range, EventEmitter, TextEditor } from "vscode";
import { ChildProcess, exec, ExecException } from "child_process";
import { parse as parsePath } from 'path';
import { getDecorationsForMatches, resetDecorations } from "./decorators";
import { Match } from "./match";



export class CombyMatch implements Disposable {

  private process: ChildProcess | null;
  private onMatch: (matches: Match[]) => void;

  constructor(queryString: string, onMatch: (matches: Match[]) => void) {
    this.onMatch = onMatch;
    if (window.activeTextEditor) {
      this.process = this.createProcess(queryString, window.activeTextEditor);
    } else {
      this.process = null;
    }
  }

  private createProcess(queryString: string, textEditor: TextEditor) : ChildProcess {
    const path = parsePath(textEditor.document.uri.fsPath);
    const executable = 'comby';
    const params = [`'${queryString}'`, `''`, '-json-lines', '-match-only', path.base, '-d', path.dir];
    const command = `${executable} ${params.join(" ")}`;
    return exec(command, this.execCallback);
  }

  private execCallback = (error: ExecException | null, stdout: string) => {
    let matches: Match[] = [];
    if (!error && stdout) {
      matches = JSON.parse(stdout).matches;
    }
    this.onMatch(matches);
  }

  dispose = () => {
    if (this.process) {
      this.process.kill();
    }
  }
}

export class CombyReplace implements Disposable {
  dispose() {}
}