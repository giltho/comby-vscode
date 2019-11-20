import { window, InputBox } from "vscode";
import Comby from "./comby";
import { setDecorationsForMatches } from "./decorators";

enum MatchBoxState {
  Search,
  Replace
}

export default class MatchBox {
  private inputBox: InputBox;
  private currentCall: Comby | null;
  private state: MatchBoxState;

  constructor() {
    this.state = MatchBoxState.Search;
    this.inputBox = window.createInputBox();
    this.inputBox.placeholder = "Comby Pattern To Match";
    this.inputBox.title = "Comby Pattern";
    this.inputBox.ignoreFocusOut = true;
    this.inputBox.onDidChangeValue((input) => this.query(input));
    this.inputBox.onDidHide(() => {
      if (this.currentCall) {
        this.currentCall.dispose();
      }
    });
    this.currentCall = null;
  }

  private query(input: string) {
    if (this.currentCall) {
      this.currentCall.kill();
    }
    this.currentCall = new Comby(input);
  }

  show() { this.inputBox.show(); }

}