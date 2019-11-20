import { Range, Position } from "vscode";

export interface MatchPosition {
  offset: number;
  line: number;
  column: number;
}

export interface MatchRange {
  start: MatchPosition;
  end: MatchPosition;
}

export interface SubPattern {
  value: string;
  variable: string;
  range: MatchRange;
}

export interface Match {
  matched: string;
  range: MatchRange;
  environment: SubPattern[];
}

export function matchPositionToPosition(mp: MatchPosition): Position {
  return new Position(mp.line - 1, mp.column - 1);
}

export function matchRangeToRange(mr: MatchRange): Range {
  const start = matchPositionToPosition(mr.start);
  const end = matchPositionToPosition(mr.end);
  return new Range(start, end);
}