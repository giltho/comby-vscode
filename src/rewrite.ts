import { Match, matchRangeToRange } from "./match";
import { Subst } from "./subst";
import { TextEditor, TextEdit } from "vscode";
import CombyBox from "./combyBox";

export default function rewrite(match: Match, subst: Subst, editor: TextEditor, box: CombyBox) {
  console.log("REWRITING: ", match, subst, editor, box);
  editor.edit((builder) => {
    builder.replace(matchRangeToRange(match.range), subst.replacement_content);
  });
  box.removeSubst(subst);
  box.removeMatch(match);
}
