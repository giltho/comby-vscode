import { Match, matchRangeToRange } from './match';
import * as vscode from 'vscode';


const totalDecorationType = vscode.window.createTextEditorDecorationType({
  borderWidth: '1px',
  borderStyle: 'solid',
  overviewRulerColor: 'blue',
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: {
    // this color will be used in light color themes
    borderColor: 'darkblue'
  },
  dark: {
    // this color will be used in dark color themes
    borderColor: 'lightblue'
  }
});

const yellowDecorationType = vscode.window.createTextEditorDecorationType({
  borderWidth: '1px',
  borderStyle: 'solid',
  overviewRulerColor: 'yellow',
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: {
    // this color will be used in light color themes
    borderColor: 'darkyellow'
  },
  dark: {
    // this color will be used in dark color themes
    borderColor: 'lightyellow'
  }
});

const redDecorationType = vscode.window.createTextEditorDecorationType({
  borderWidth: '1px',
  borderStyle: 'solid',
  overviewRulerColor: 'red',
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: {
    // this color will be used in light color themes
    borderColor: 'darkred'
  },
  dark: {
    // this color will be used in dark color themes
    borderColor: 'pink'
  }
});

type key = "total" | "yellow" | "red";
const keys: key[] = ["total", "yellow", "red"];
const nonTotalKeys = keys.slice(1);

const matchDecorations = {
  total: totalDecorationType,
  yellow: yellowDecorationType,
  red: redDecorationType
};

function getDecorationForMatch(match: Match): { key: string; range: vscode.Range }[] {
  const decorations = [{
    key: "total",
    range: matchRangeToRange(match.range)
  }];

  let i = 0;
  const environment = match.environment.sort((a, b) =>
    a.range.start.line === b.range.start.line ?
      a.range.start.column - b.range.start.column :
      a.range.start.line - b.range.start.line
  );
  environment.forEach((env) => {
    let key = nonTotalKeys[i];
    i = (i + 1) % nonTotalKeys.length; //Rotate colors
    decorations.push({
      key,
      range: matchRangeToRange(env.range)
    });
  });

  return decorations;
}

type ReadyToDecorate = [vscode.TextEditorDecorationType, { range: vscode.Range }[]];

export function getDecorationsForMatches(matches: Match[]) : ReadyToDecorate[] {
  const readyToDecorate : ReadyToDecorate[] = [];
  const decorations = matches.map(getDecorationForMatch).reduce((a, b) => a.concat(b));
  keys.forEach((key) => {
    const keyDecorations = decorations.filter(d => d.key === key);
    readyToDecorate.push([matchDecorations[key], keyDecorations] as ReadyToDecorate);
  });
  return readyToDecorate;
}

export function setDecorations(decorations: ReadyToDecorate[], textEditor: vscode.TextEditor) : void {
  decorations.forEach(([dt, ops]) => textEditor.setDecorations(dt, ops));
}

export function resetDecorations(textEditor: vscode.TextEditor) : void {
  keys.forEach((key) => {
    textEditor.setDecorations(matchDecorations[key], []);
  });
}