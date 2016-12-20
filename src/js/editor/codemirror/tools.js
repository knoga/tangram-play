//  GET Functions
//  ===============================================================================
import { isEmptyString } from '../../tools/helpers';

//  Get the spaces of a string
export function getSpaces(str) {
  const regex = /^(\s+)/gm;
  const space = regex.exec(str);
  if (space) {
    return (space[1].match(/\s/g) || []).length;
  }

  return 0;
}

//  Get the indentation level of a line
export function getLineInd(cm, nLine) {
  return getSpaces(cm.lineInfo(nLine).text) / cm.getOption('tabSize');
}

//  Check if a line is empty
export function isEmpty(cm, nLine) {
  return isEmptyString(cm.lineInfo(nLine).text);
}

//  Check if the line is commented YAML style
export function isStrCommented(str) {
  const regex = /^\s*[#||//]/gm;
  return (regex.exec(str) || []).length > 0;
}
export function isCommented(cm, nLine) {
  return isStrCommented(cm.lineInfo(nLine).text);
}

// Get the text of a line and ignore the previus spaces
export function getText(cm, nLine) {
  const value = /^\s*(\w+)/gm.exec(cm.lineInfo(nLine).text);
  return value ? value[1] : '';
}

//  Get value of a key pair
export function getValue(cm, nLine) {
  const value = /^\s*\w+:\s*([\w|\W|\s]+)$/gm.exec(cm.lineInfo(nLine).text);
  return value ? value[1] : '';
}

// Escape regex special characters
// via http://stackoverflow.com/a/9310752
export function regexEscape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

//  Common NAVIGATION functions on CM
//  ===============================================================================

/**
 * Scrolls a given line into view.
 *
 * CodeMirror's native `scrollIntoView()` method only scrolls just enough to
 * bring a line into view, which can put the line at the bottom of the viewport.
 * This forces the line to be placed as high as possible in the viewport.
 *
 * @params {CodeMirror} cm - instance of CodeMirror.
 * @params {Number} line - the line number to scroll to.
 */
export function jumpToLine(cm, line) {
  cm.scrollTo(null, cm.charCoords({ line, ch: 0 }, 'local').top);
}

//  Common FOLD functions on CM
//  ===============================================================================

//  Is posible to fold
//
export function isFolder(cm, nLine) {
  if (cm.lineInfo(nLine).gutterMarkers) {
    return cm.lineInfo(nLine).gutterMarkers['CodeMirror-foldgutter'] !== null;
  }

  return false;
}

//  Unfold all lines
//
export function unfoldAll(cm) {
  const opts = cm.state.foldGutter.options;
  for (let i = 0; i < cm.lineCount(); i++) {
    cm.foldCode({ line: i }, opts.rangeFinder, 'unfold');
  }
}

//  Fold all lines above a specific indentation level
//
export function foldByLevel(cm, level) {
  unfoldAll(cm);
  const opts = cm.state.foldGutter.options;

  let actualLine = cm.getDoc().size - 1;
  while (actualLine >= 0) {
    if (isFolder(cm, actualLine)) {
      if (getLineInd(cm, actualLine) >= level) {
        cm.foldCode({ line: actualLine, ch: 0 }, opts.rangeFinder);
      }
    }
    actualLine -= 1;
  }
}
