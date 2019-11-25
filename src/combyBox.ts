import { window, InputBox, Disposable, TreeItemCollapsibleState } from "vscode";
import { CombyMatch, CombyReplace } from "./comby";
import { getDecorationsForMatches, setDecorations, resetDecorations } from "./decorators";
import { provider, codeLensOfSubst } from "./substCL";
import { Match } from "./match";
import { Subst } from "./subst";


export default class CombyBox implements Disposable {
  private inputBox: InputBox;
  private matchCall: CombyMatch | null;
  private matchQuery: string;
  private replaceCall: CombyReplace | null;
  private currEvents: Disposable[];
  private matches: Match[];
  private substs: Subst[];

  constructor() {
    this.matches = [];
    this.substs = [];
    this.currEvents = [];
    this.matchQuery = "";
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
    this.currEvents.push(this.inputBox.onDidChangeValue((input) => this.onChangeMatch(input)));
    this.currEvents.push(this.inputBox.onDidAccept(() => this.initReplaceState()));
  }

  private onChangeMatch(input: string) {
    this.matchQuery = input;
    if (window.activeTextEditor) {
      resetDecorations(window.activeTextEditor);
    }
    if (this.matchCall) {
      this.matchCall.dispose();
      this.matchCall = null;
    }
    this.matchCall = new CombyMatch(input, (matches) => {
      const decorations = getDecorationsForMatches(matches);
      if (window.activeTextEditor) {
        setDecorations(decorations, window.activeTextEditor);
      }
      this.matches = matches;
    });
  }

  private initReplaceState() {
    this.currEvents.forEach((x) => x.dispose());
    this.inputBox.placeholder = "Comby Rewrite Pattern";
    this.inputBox.title = "Replacing: " + this.matchQuery;
    this.inputBox.onDidChangeValue((input) => this.onReplaceMatch(input));
    this.inputBox.value = "";
    this.inputBox.onDidAccept(() => {
      this.inputBox.hide();
      this.dispose();
    });
  }

  private onReplaceMatch(input: string) {
    if (this.replaceCall) {
      this.replaceCall.dispose();
      this.replaceCall = null;
    }
    if (window.activeTextEditor) {
      provider.update([]);
    }
    this.replaceCall = new CombyReplace(this.matchQuery, input, (substs) => {
      this.substs = substs;
      if (window.activeTextEditor) {
        const editor = window.activeTextEditor;
        provider.update(substs.map((subst) => codeLensOfSubst(subst, this.matches, editor, this)));
      }
    });
  }

  removeMatch(match: Match) {
    this.matches = this.matches.filter((x) => x !== match);
    if (window.activeTextEditor) {
      const decorations = getDecorationsForMatches(this.matches);
      setDecorations(decorations, window.activeTextEditor);
    }
  }

  removeSubst(subst: Subst) {
    this.substs = this.substs.filter((x) => x !== subst);
    if (window.activeTextEditor) {
      const editor = window.activeTextEditor;
      provider.update(this.substs.map((subst) => codeLensOfSubst(subst, this.matches, editor, this)));
    }
  }

  dispose = () => {
    if (window.activeTextEditor) {
      resetDecorations(window.activeTextEditor);
    }
    if (this.matchCall) {
      this.matchCall.dispose();
    }
    if (this.replaceCall) {
      this.replaceCall.dispose();
    }
  }

  show() { this.inputBox.show(); }

}