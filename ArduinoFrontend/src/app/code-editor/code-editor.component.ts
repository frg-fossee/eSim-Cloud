import { Component, OnInit, Input } from '@angular/core';

declare var monaco: any;

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements OnInit {
  editorOptions = {
    theme: 'vs',
    language: 'c'
  };
  code = 'void setup(){\n\t\n}\n\nvoid loop(){\n\t\n}';
  @Input() width = 500;
  @Input() height = 80;

  onInit(_) {
    (window as any).monaco.languages.registerCompletionItemProvider('c', {
      provideCompletionItems: () => {
        return {
          suggestions: [
            {
              label: 'digitalRead',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Read Digital Value',
              insertText: 'digitalRead(PIN);',
            },
            {
              label: 'ifelse',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                'if (${1:condition}) {',
                '\t$0',
                '} else {',
                '\t',
                '}'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If-Else Statement'
            }]
        };
      }
    });
  }
  constructor() { }

  ngOnInit() {
  }

}
