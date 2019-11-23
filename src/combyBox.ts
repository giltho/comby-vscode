import { window, InputBox, Disposable } from "vscode";
import { CombyMatch, CombyReplace } from "./comby";
import { Match } from './match';
import { getDecorationsForMatches, setDecorations, resetDecorations } from "./decorators";


export default class CombyBox implements Disposable {
  private inputBox: InputBox;
  private matchCall: CombyMatch | null;
  private matches : Match[];
  private replaceCall: CombyReplace | null;

  constructor() {
    this.matches = [];
    this.matchCall = null;
    this.replaceCall = null;
    this.inputBox = window.createInputBox();
    this.inputBox.ignoreFocusOut = true;
    this.initMatchState();
    this.inputBox.onDidHide(() => {
      this.dispose();
    });
  }

  private initMatchState() {
    this.inputBox.placeholder = "Comby Pattern To Match";
    this.inputBox.title = "Comby Matching";
    this.inputBox.onDidChangeValue((input) => this.onChangeMatch(input));
  }

  private onChangeMatch(input: string) {
    if (window.activeTextEditor) {
      resetDecorations(window.activeTextEditor);
    }
    if (this.matchCall) {
      this.matchCall.dispose();
    }
    this.matchCall = new CombyMatch(input, (matches) => {
      console.log(matches);
      this.matches = matches;
      const decorations = getDecorationsForMatches(matches);
      if (window.activeTextEditor) {
        setDecorations(decorations, window.activeTextEditor);
      }
    });
  }

  dispose() {
    if (this.matchCall) {
      this.matchCall.dispose();
    }
    if (this.replaceCall) {
      this.replaceCall.dispose();
    }
  }

  show() { this.inputBox.show(); }

}