import { window, Disposable } from "vscode";
import { ChildProcess, exec } from "child_process";
import { parse as parsePath } from 'path';
import { setDecorationsForMatches, resetDecorations } from "./decorators";
import { Match } from "./match";

export default class Comby implements Disposable {

  process: ChildProcess | null;

  matches: any;

  constructor(queryString: string) {

    if (window.activeTextEditor) {

      const path = parsePath(window.activeTextEditor.document.uri.fsPath);
      const executable = 'comby';
      const params = [`'${queryString}'`, `''`, '-json-lines', '-match-only', path.base, '-d', path.dir];
      const command = `${executable} ${params.join(" ")}`;

      this.process = exec(command, (error, stdout) => {
        if (!error && stdout && window.activeTextEditor) {
          const matches: Match[] = JSON.parse(stdout).matches;
          setDecorationsForMatches(matches, window.activeTextEditor);
        } else if (window.activeTextEditor) {
          resetDecorations(window.activeTextEditor);
        }
      });
    } else {
      this.process = null;
    }
  }

  kill() {
    if (this.process) { this.process.kill(); }
  }

  dispose() {
    if (this.process) {
      this.kill();
      if (window.activeTextEditor) {
        setDecorationsForMatches([], window.activeTextEditor);
      }
    }

  }
}