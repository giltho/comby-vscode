import {
  TextDocument,
  Range
} from "vscode";

export interface SubstPosition {
  offset: number;
}

export interface SubstRange {
  start: SubstPosition;
  end: SubstPosition;
}

export interface Subst {
  range: SubstRange;
  replacement_content: string;
}

export function positionOfSubstPosition(pos: SubstPosition, doc: TextDocument) {
  return doc.positionAt(pos.offset);
}

export function rangeOfSubstRange(range: SubstRange, doc: TextDocument) {
  return new Range(positionOfSubstPosition(range.start, doc), positionOfSubstPosition(range.end, doc));
}