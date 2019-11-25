import { window, Disposable, TextEditorDecorationType, Range, EventEmitter, TextEditor } from "vscode";
import { ChildProcess, exec, ExecException } from "child_process";
import { parse as parsePath } from 'path';
import { Match } from "./match";
import { Subst } from "./subst";



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

  private process: ChildProcess | null;
  private onSubst: (matches: Subst[]) => void;

  constructor(queryString: string, rewriteString: string, onSubst: (substs: Subst[]) => void) {
    this.onSubst = onSubst;
    if (window.activeTextEditor) {
      this.process = this.createProcess(queryString, rewriteString, window.activeTextEditor);
    } else {
      this.process = null;
    }
  }

  private createProcess(queryString: string, rewriteString: string, textEditor: TextEditor) : ChildProcess {
    const path = parsePath(textEditor.document.uri.fsPath);
    const executable = 'comby';
    const params = [`'${queryString}'`, `'${rewriteString}'`, '-json-lines', path.base, '-d', path.dir];
    const command = `${executable} ${params.join(" ")}`;
    return exec(command, this.execCallback);
  }

  private execCallback = (error: ExecException | null, stdout: string) => {
    let substs: Subst[] = [];
    if (!error && stdout) {
      substs = JSON.parse(stdout).in_place_substitutions;
    }
    this.onSubst(substs);
  }

  dispose = () => {
    if (this.process) {
      this.process.kill();
    }
  }
}