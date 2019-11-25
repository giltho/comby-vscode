import {
  CodeLensProvider,
  CodeLens,
  TextDocument,
  EventEmitter,
  Event,
  TextEditor
} from "vscode";
import {
  Subst,
  rangeOfSubstRange,
  positionOfSubstPosition
} from './subst';
import { Match, matchPositionToPosition } from "./match";
import CombyBox from "./combyBox";

export const commandName = "comby-vscode.rewrite";

class SubstCodeLensProvider implements CodeLensProvider {

  private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

  private current: CodeLens[];

  constructor() {
    this.current = [];
  }

  update(lenses: CodeLens[]) {
    this.current = lenses;
    this._onDidChangeCodeLenses.fire();
  }

  async provideCodeLenses(): Promise < CodeLens[] > {
    return this.current;
  }
}

function startsEqual(match: Match, subst: Subst, doc: TextDocument) : boolean {
  const mstart = matchPositionToPosition(match.range.start);
  const sstart = positionOfSubstPosition(subst.range.start, doc);
  return mstart.isEqual(sstart);
}

export function codeLensOfSubst(subst: Subst, matches: Match[], editor: TextEditor, box: CombyBox): CodeLens {
  
  const match = matches.find((m) => startsEqual(m, subst, editor.document));
  const command = {
    title: "Replace by: " + subst.replacement_content,
    command: commandName,
    arguments: [match, subst, editor, box]
  };
  return new CodeLens(rangeOfSubstRange(subst.range, editor.document), command);
}

export const provider = new SubstCodeLensProvider();