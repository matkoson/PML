import React, {useState} from 'react';
import {TextInput, StyleSheet} from 'react-native';
import ExpensiMark from './Aztec/expensify-common/lib/ExpensiMark';
import RichTextEditor from './Aztec/react-native-aztec';

const parser = new ExpensiMark();
/**
 * so, what do I want to achieve?
 * 'processHtml'
 * - (INPUT) - HTML string, NOT containing any markdown
 * - (OUTPUT) - HTML string, containing markdown syntax
 *
 * How does this function achieve this effect?
 * - it replaces all <strong> tags with <strong>*...*</strong>
 * - it replaces all <em> tags with <em>_..._</em>
 *
 * What kind of regular expression do I need to achieve this effect?
 * - I need to match all <strong> tags, and replace them with <strong>*...*</strong>, only if the content of the <strong> tag does not start with * and does not end with *
 * - I need to match all <em> tags, and replace them with <em>_..._</em>, only if the content of the <em> tag does not start with _ and does not end with _
 *
 */
const processHtml = html => {
  let processedHtml = html;

  const getMarkdownChar = char => `<span>${char}</span>`;

  const MarkdownSyntax = {
    bold: getMarkdownChar('*'),
    italic: getMarkdownChar('_'),
    inlineCode: getMarkdownChar('`'),
  };

  const rules = [
    [MarkdownSyntax.bold, 'strong'],
    [MarkdownSyntax.italic, 'em'],
    [MarkdownSyntax.inlineCode, 'code'],
    ['\n', 'br'],
    ['\n\n', '</p><p>'],
  ];

  rules.forEach(([markdownChar, htmlTag]) => {
    processedHtml = processedHtml.replace(
      new RegExp(`<${htmlTag}>(.*?)<\/${htmlTag}>`, 'g'),
      (match, p1) => {
        if (p1.startsWith(markdownChar) && p1.endsWith(markdownChar)) {
          return match;
        }

        return `<${htmlTag}>${markdownChar}${p1}${markdownChar}</${htmlTag}>`;
      },
    );
  });

  return processedHtml;
};

const MarkdownInput = props => {
  const [html, setHtml] = useState(
    processHtml(parser.replace('*bold*, _italic_')),
  );
  const [tempSelection, setTempSelection] = useState({start: 0, end: 0});
  const [selection, setSelection] = useState({start: 0, end: 0});
  const [newlinePosition, setNewlinePosition] = useState(null);
  const richTextEditorRef = React.useRef();

  const handleChangeText = event => {
    const logChangeEvent = true;
    const inputText = event.nativeEvent.text;
    const nativeEvent = event.nativeEvent;
    const textFromHtml = parser.htmlToText(event.nativeEvent.text);
    let markdownFromHtml = parser.htmlToMarkdown(event.nativeEvent.text);
    markdownFromHtml = processHtml(parser.replace(textFromHtml));

    logChangeEvent &&
      console.log(
        '\n',
        '########################################',
        '\n',
        '##### handleChangeText #####',
        '\n',
        '########################################',
        '\n',
        {inputText},
        '\n',
        {textFromHtml},
        '\n',
        {markdownFromHtml},
        '\n',
      );

    if (html !== markdownFromHtml) {
      setHtml(markdownFromHtml);
    }
  };

  const handleSelectionChange = (selectionStart, selectionEnd, text, event) => {
    const logSelectionEvent = false;

    const newSelection = {
      start: selectionStart,
      end: selectionEnd,
    };

    logSelectionEvent &&
      console.log(
        '\n',
        '########################################',
        '\n',
        '##### handleSelectionChange #####',
        '\n',
        '########################################',
        '\n',
        {selectionStart},
        '\n',
        {selectionEnd},
        '\n',
        {text},
        '\n',
        {html: `<p>${html}</p>`},
        '\n',
        // event,
      );

    if (
      (selection.start !== newSelection.start ||
        selection.end !== newSelection.end) &&
      text !== `<p>${html}</p>`
    ) {
      setTempSelection(newSelection);
    }
  };

  React.useEffect(() => {
    if (tempSelection) {
      setSelection(tempSelection);
      setTempSelection(null);
    }
  }, [html, tempSelection]);

  console.log('RENDER html', html);

  return (
    <>
      <RichTextEditor
        ref={richTextEditorRef}
        isMultiLine
        style={{height: 200}}
        // onChange={handleChangeText}
        onChange={event => {
          console.log(
            'onChange event.nativeEvent.text',
            event.nativeEvent.text,
          );
        }}
        // onSelectionChange={handleSelectionChange}
        onCaretVerticalPositionChange={event => {
          console.log('onCaretVerticalPositionChange event', event);
        }}
        onContentSizeChange={event => {
          console.log('onContentSizeChange event', event);
        }}
        onSelectionChange={(selectionStart, selectionEnd, text, event) => {
          console.log(
            'onSelectionChange  selectionStart, selectionEnd, text, event.nativeEvent',
            '\n',
            {selectionStart},
            '\n',
            {selectionEnd},
            '\n',
            {text},
            '\n',
            {nativeEvent: event.nativeEvent},
            '\n',
          );
        }}
        // onKeyDown={event => {
        //   console.log('onKeyDown event.nativeEvent', event.nativeEvent);
        //   return;
        // }}
        text={{
          // text: html,
          text: 'hello',
          selection: tempSelection || selection,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
});

export default MarkdownInput;
