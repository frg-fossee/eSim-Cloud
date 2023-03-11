import { Component, OnInit, Input } from '@angular/core';
import { ArduinoUno } from '../Libs/outputs/Arduino';
import { Download } from '../Libs/Download';

/**
 * For Handling Time ie. Prevent moment error
 */
declare var monaco;
declare var window;

/**
 * Code Editor Component
 */
@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent {
  // TODO: Fetch records and Suggestion from api

  /**
   * Initialization variable for code editor
   */
  private init = false;
  /**
   * Monaco code editor options
   */
  editorOptions = {
    theme: 'vs',
    language: 'c'
  };
  /**
   * Instance of Monaco editor
   */
  editor: any;
  /**
   * Libraries that are already present
   */
  records = [
    {
      include: 'EEPROM.h',
      name: 'EEPROM',
      Description: 'Reading and writing to permanent storage',
      url: 'https://www.arduino.cc/en/Reference/EEPROM'
    },
    {
      include: 'LiquidCrystal.h',
      name: 'LiquidCrystal',
      Description: 'Controlling liquid crystal displays (LCDs)',
      url: 'https://www.arduino.cc/en/Reference/LiquidCrystal'
    },
    {
      include: 'Servo.h',
      name: 'Servo',
      Description: 'Controlling Servo motor',
      url: 'https://www.arduino.cc/en/Reference/Servo'
    },
    {
      include: 'SoftwareSerial.h',
      name: 'SoftwareSerial',
      Description: 'Allow serial communication on other digital pins of the Arduino',
      url: 'https://www.arduino.cc/en/Reference/SoftwareSerial'
    },
    {
      include: 'Wire.h',
      name: 'Wire',
      Description: 'This library allows you to communicate with I2C / TWI devices',
      url: 'https://www.arduino.cc/en/Reference/Wire'
    },
    {
      include: 'SPI.h',
      name: 'SPI',
      Description: 'Communicating with devices using the Serial Peripheral Interface (SPI) Bus',
      url: 'https://www.arduino.cc/en/Reference/SPI'
    }
  ];
  /**
   * Code inside the Monaco editor
   */
  code = '';
  /**
   * Names of Arduino
   */
  names: string[] = [];
  /**
   * List of Programming languages available
   */
  lang: string[] = ['Arduino .ino file', 'C inline assembly'];
  /**
   * Selected programming language
   */
  langIndex = 0;
  /**
   * Instance of Arduino uno for updating code
   */
  arduinos: ArduinoUno[] = [];
  /**
   * Selected Arduino Index
   */
  selectedIndex = 0;
  /**
   * Width of the Code editor
   */
  @Input() width = 500;
  /**
   * Height of the code editor in terms of VH
   */
  @Input() height = 80;
  /**
   * Code Visibility in LTI mode
   */
  @Input() codeView = true;
  /**
   * Reninitialize arduino names
   */
  @Input('reinit')
  set reinit(value: boolean) {
    // Set Global variable to tell that code editor is opened
    window['isCodeEditorOpened'] = value;

    if (value) {
      // Clear names and instances
      this.names = [];
      this.arduinos = [];
      // get Names and instances
      for (const key in window['ArduinoUno_name']) {
        if (window['ArduinoUno_name'][key]) {
          this.names.push(key);
          this.arduinos.push(window['ArduinoUno_name'][key]);
        }
      }
      // reset selected  index
      if (this.selectedIndex >= this.arduinos.length) {
        this.selectedIndex = 0;
      }
      // select the code of respective arduino
      if (this.arduinos.length > 0) {
        this.code = this.arduinos[this.selectedIndex].code;
      }
      // show loading animation if code editor is nor initialized
      if (this.names.length !== 0 && !this.init) {
        window['showLoading']();
      }
    }
  }
  /**
   * Download the code from code editor
   */
  DownloadCode() {
    Download.DownloadText(this.names[this.selectedIndex] + '.ino',
      [this.code],
      {
        type: 'text/ino;charset=utf-8;'
      });
  }
  /**
   * Include the header to the code
   * @param i Index of the Library that needs to be included
   */
  Include(i) {
    this.editor.executeEdits('code-editor', [{
      identifier: { major: 1, minor: 1 },
      range: new monaco.Range(1, 1, 1, 1),
      text: '#include <' + this.records[i].include + '>\n',
      forceMoveMarkers: false
    }]);
    this.openFolder();
  }
  /**
   * On Monaco code editor initialization
   * @param editor Monaco Editor Instance
   */
  onInit(editor) {
    this.init = true;
    window['hideLoading']();
    this.editor = editor;
    monaco.languages.registerCompletionItemProvider('c', {
      provideCompletionItems: () => {
        return {
          // If more function needs to add then add to the following array
          // https://www.arduino.cc/en/Reference
          suggestions: [
            {
              label: 'digitalRead', // Searching Parameter
              kind: monaco.languages.CompletionItemKind.Function, // Type of Completion
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, // Insertion Rule
              documentation: 'Read Digital Value', // The Documentation copied from arduino.cc
              insertText: 'digitalRead(${1:PIN});', // The inserted text
            },
            {
              label: 'digitalWrite',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Write a HIGH or a LOW value to a digital pin',

              insertText: 'digitalWrite(${1:pin}, ${2:value});',
            },
            {
              label: 'pinMode',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Configures the specified pin',
              insertText: 'pinMode(${1:pin}, ${2:mode});',
            },
            {
              label: 'analogRead',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Read Anolog Value',
              insertText: 'analogRead(${1:pin});',
            },
            {
              label: 'analogWrite',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Writes an analog value (PWM wave) to a pin.',
              insertText: 'analogWrite(${1:pin}, ${2:value});',
            },
            {
              label: 'analogReference',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Configures the reference voltage',
              insertText: 'analogReference(${1:type});',
            },
            {
              label: 'analogReadresolution',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Sets the size of analogRead value',
              insertText: 'analogReadResolution(${1:bits});',
            },
            {
              label: 'analogReadResolution',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Sets the size of analogRead value',
              insertText: 'analogReadResolution(${1:bits});',
            },
            {
              label: 'analogWriteResolution',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Sets the resolution of analogWrite value',
              insertText: 'analogWriteResolution(${1:bits});',
            },
            {
              label: 'noTone',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Stops the generation of a square wave',
              insertText: 'noTone(${1:pin});',
            },
            {
              label: 'pulseIn',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Reads a pulse',
              insertText: 'pulseIn(${1:pin}, ${2:value});',
            },
            {
              label: 'pulseIn',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Reads a pulse',
              insertText: 'pulseIn(${1:pin}, ${2:value}, ${3:timeout});',
            },
            {
              label: 'pulseInLong',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Reads a long pulse',
              insertText: 'pulseInLong(${1:pin}, ${2:value});',
            },
            {
              label: 'pulseInLong',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Reads a long pulse',
              insertText: 'pulseInLong(${1:pin}, ${2:value}, ${3:timeout});',
            },
            {
              label: 'ShiftIn',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Shifts in a byte of data one bit at a time',
              insertText: 'shiftIn(${1:dataPin}, ${2:clockPin}, ${3:bitOrder});',
            },
            {
              label: 'ShiftOut',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Shifts out a byte of data one bit at a time',
              insertText: 'shiftOut(${1:dataPin}, ${2:clockPin}, ${3:bitOrder}, ${4:value});',
            },
            {
              label: 'tone',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Generates a square wave of specified frequency',
              insertText: 'tone(${1:pin}, ${2:frequency});',
            },
            {
              label: 'tone',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Generates a square wave of specified frequency',
              insertText: 'tone(${1:pin}, ${2:frequency}, ${3:duration});',
            },
            {
              label: 'delay',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'amount of time(milliseconds)',
              insertText: 'delay(${1:ms});',
            },
            {
              label: 'delayMicroseconds',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'amount of time(microseconds)',
              insertText: 'delayMicroseconds(${1:us});',
            },
            {
              label: 'micros',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Returns the number of microseconds',
              insertText: 'micros():',
            },
            {
              label: 'millis',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Returns the number of milliseconds',
              insertText: 'millis();',
            },
            {
              label: 'abs',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Calculates the absolute value of a number',
              insertText: 'abs(${1:x});',
            },
            {
              label: 'constrain',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Constrains a number to be within a range',
              insertText: 'constrain(${1:x}, ${2:a}, ${3:b});',
            },
            {
              label: 'map',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Re-maps a number',
              insertText: 'map(${1:value}, ${2:fromLow}, ${3:fromHigh}, ${4:toLow}, ${5:toHigh});',
            },
            {
              label: 'max',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'maximum of two numbers',
              insertText: 'max(${1:x}, ${2:y});',
            },
            {
              label: 'min',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'mininmum of two numbers',
              insertText: 'min(${1:x}, ${2:y});',
            },
            {
              label: 'pow',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'value of a number raised to a power',
              insertText: 'pow(${1:x}, ${2:y});',
            },
            {
              label: 'sqr',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: ' square of a number',
              insertText: 'sq(${1:x});',
            },
            {
              label: 'sqrt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'square root of a number',
              insertText: 'sqrt(${1:x});',
            },
            {
              label: 'cos',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'cosine of an angle (in radians)',
              insertText: 'cos(${1:rad});',
            },
            {
              label: 'sin',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'sine of an angle (in radians)',
              insertText: 'sin(${1:rad});',
            },
            {
              label: 'tan',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'tangent of an angle (in radians)',
              insertText: 'tan(${1:rad});',
            },
            {
              label: 'isAlpha',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is alpha (that is a letter)',
              insertText: 'isAlpha(${1:thisChar});',
            },
            {
              label: 'isAlphaNumeric',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is alphanumeric',
              insertText: 'isAlphaNumeric(${1:thisChar});',
            },
            {
              label: 'isAscii',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is Ascii',
              insertText: 'isAscii(${1:thisChar});',
            },
            {
              label: 'isControl',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is control character',
              insertText: 'isControl(${1:thisChar);',
            },
            {
              label: 'isDigit',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is digit',
              insertText: 'isDigit(${1:thisChar);',
            },
            {
              label: 'isGraph',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is printable with some content',
              insertText: 'isGraph(${1:thisChar);',
            },
            {
              label: 'isHexadecimalDigit',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is printable with some content',
              insertText: 'isHexadecimalDigit(${1:thisChar);',
            },
            {
              label: 'isLowerCase',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is lower case',
              insertText: 'isLowerCase(${1:thisChar);',
            },
            {
              label: 'isPrintable',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is printable',
              insertText: 'isPrintable(${1:thisChar);',
            },
            {
              label: 'isSpace',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is white space character',
              insertText: 'isSpace(${1:thisChar);',
            },
            {
              label: 'isUpperCase',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is upper case',
              insertText: 'isUpperCase(${1:thisChar);',
            },
            {
              label: 'isWhiteSpace',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Analyse if a char is space character',
              insertText: 'isWhitespace(${1:thisChar);',
            },
            {
              label: 'random',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'generates pseudo-random numbers',
              insertText: 'random(${1:max});',
            },
            {
              label: 'random',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'generates pseudo-random numbers',
              insertText: 'random(${1:min}, ${2:max});',
            },
            {
              label: 'randomSeed',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'initializes the pseudo-random number generator',
              insertText: 'randomSeed(${1:seed});',
            },
            {
              label: 'bit',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Computes the values of specified bit',
              insertText: 'bit(${1:n});',
            },
            {
              label: 'bitClear',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Clears a bit of numeric variable',
              insertText: 'bitClear(${1:x}, ${2:n});',
            },
            {
              label: 'bitRead',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Reads a bit of a number',
              insertText: 'bitRead(${1:x}, ${2:n});',
            },
            {
              label: 'bitSet',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Sets a bit of a number variable',
              insertText: 'bitSet(${1:x}, ${2:n});',
            },
            {
              label: 'bitWrite',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Writes a bit of a numeric variable',
              insertText: 'bitWrite(${1:x}, ${2:n}, ${3:b});',
            },
            {
              label: 'highByte',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Extracts high-order byte of a word',
              insertText: 'highByte(${1:x});',
            },
            {
              label: 'lowByte',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Extracts low-order byte of a word',
              insertText: 'lowByte(${1:x});',
            },
            {
              label: 'attachInterrupt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Digital Pins With Interrupts',
              insertText: 'attachInterrupt(digitalPinToInterrupt(${1:pin}), ${2:ISR}, ${3:mode});',
            },
            {
              label: 'attachInterrupt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Digital Pins With Interrupts',
              insertText: 'attachInterrupt(${1:interrupt}, ${2:ISR}, ${3:mode});',
            },
            {
              label: 'attachInterrupt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Digital Pins With Interrupts',
              insertText: 'attachInterrupt(${1:pin}, ${2:ISR}, ${3:mode});',
            },
            {
              label: 'Interrupts',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Re-enable Interrupts',
              insertText: 'interrupts();',
            },
            {
              label: 'noInterrupts',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Disables interrupts',
              insertText: 'noInterrupts();',
            },
            {
              label: 'if(Serial)',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Indicates if the specified Serial port is ready',
              insertText: 'if (${1:Serial});',
            },
            {
              label: 'Serial.available',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Get the numbers of bytes available',
              insertText: 'Serial.available();',
            },
            {
              label: 'Serial.availableForWrite',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Get the numbers of bytes available for writing',
              insertText: 'Serial.availableForWrite();',
            },
            {
              label: 'Serial.begin',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Sets the data rate in bits per second',
              insertText: 'Serial.begin(${1:speed});',
            },
            {
              label: 'Serial.begin',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Sets the data rate in bits per second',
              insertText: 'Serial.begin(${1:speed}, ${2:config});',
            },
            {
              label: 'Serial.end',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Disable serial communication',
              insertText: 'Serial.end();',
            },
            {
              label: 'Serial.find',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'finds data from the serial buffer',
              insertText: 'Serial.find(${1:target});',
            },
            {
              label: 'Serial.find',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'finds data from the serial buffer',
              insertText: 'Serial.find(${1:target}, ${2:length});',
            },
            {
              label: 'Serial.findUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'finds data until terminated string is found',
              insertText: 'Serial.findUntil(${1:target}, ${2:terminal});',
            },
            {
              label: 'Serial.flush',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Waits for the transmission of outgoing serial data to complete',
              insertText: 'Serial.flush();',
            },
            {
              label: 'Serial.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns floating point number',
              insertText: 'Serial.parseFloat();',
            },
            {
              label: 'Serial.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns floating point number',
              insertText: 'Serial.parseFloat(${1:lookahead});',
            },
            {
              label: 'Serial.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns floating point number',
              insertText: 'Serial.parseFloat(${1:lookahead}, ${1:ignore});',
            },
            {
              label: 'Serial.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'return integer number',
              insertText: 'Serial.parseInt();',
            },
            {
              label: 'Serial.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'return integer number',
              insertText: 'Serial.parseInt(${1:lookahead});',
            },
            {
              label: 'Serial.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'return integer number',
              insertText: 'Serial.parseInt(${1:lookahead}, ${1:ignore});',
            },
            {
              label: 'Serial.peek',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns the next byte',
              insertText: 'Serial.peek();',
            },
            {
              label: 'Serial.print',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'prints the data to serial data',
              insertText: 'Serial.print(${1:val});',
            },
            {
              label: 'Serial.print',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'prints the data to serial data',
              insertText: 'Serial.print(${1:val}, ${2:format});',
            },
            {
              label: 'Serial.println',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'prints the data to serial data to next line',
              insertText: 'Serial.println(${1:val});',
            },
            {
              label: 'Serial.println',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'prints the data to serial data to next line',
              insertText: 'Serial.println(${1:val}, ${2:format});',
            },
            {
              label: 'Serial.read',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Reads incoming serial data',
              insertText: 'Serial.read();',
            },
            {
              label: 'Serial.readBytes',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns the number of characters placed in the buffer',
              insertText: 'Serial.readBytes(${1:buffer}, ${2:length});',
            },
            {
              label: 'Serial.readBytesUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: ' returns the number of characters read into the buffer',
              insertText: 'Serial.readBytesUntil(${1:character}, ${2:buffer}, ${3:length});',
            },
            {
              label: 'Serial.readString',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'read characters in string ',
              insertText: 'Serial.readString();',
            },
            {
              label: 'Serial.readStringUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'read characters in string ',
              insertText: 'Serial.readStringUntil(${1:terminator});',
            },
            {
              label: 'Serial.setTimeout',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'sets the time to wait for serial data ',
              insertText: 'Serial.setTimeout(${1:time});',
            },
            {
              label: 'Serial.write',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Writes binary data to the serial port',
              insertText: 'Serial.write(${1:val});',
            },
            {
              label: 'Serial.write',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Writes binary data to the serial port',
              insertText: 'Serial.write(${1:str});',
            },
            {
              label: 'Stream.available',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Get the numbers of bytes available in stream',
              insertText: 'stream.available();',
            },
            {
              label: 'Stream.read',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'reads characters from an incoming stream',
              insertText: 'stream.read();',
            },
            {
              label: 'stream.find',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'finds data from the serial buffer',
              insertText: 'stream.find(${1:target});',
            },
            {
              label: 'stream.find',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'finds data from the serial buffer',
              insertText: 'stream.find(${1:target}, ${2:length});',
            },
            {
              label: 'stream.findUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'finds data until terminated string is found',
              insertText: 'stream.findUntil(${1:target}, ${2:terminal});',
            },
            {
              label: 'stream.flush',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'clears the buffer',
              insertText: 'stream.flush();',
            },
            {
              label: 'stream.peek',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Read byte from file without advancing to the next one',
              insertText: 'stream.peek();',
            },
            {
              label: 'stream.readBytes',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'read characters from a stream into buffer',
              insertText: 'stream.readBytes(${1:buffer}, ${2:length);',
            },
            {
              label: 'stream.readBytesUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'read characters from a stream into buffer',
              insertText: 'stream.readBytesUntil(${1:character}, ${2:buffer}, ${3:length});',
            },
            {
              label: 'Stream.readString',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'read characters in string ',
              insertText: 'stream.readString();',
            },
            {
              label: 'stream.readStringUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'read characters in string ',
              insertText: 'stream.readStringUntil(${1:terminator});',
            },
            {
              label: 'stream.setTimeout',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'sets the time to wait for serial data ',
              insertText: 'stream.setTimeout(${1:time});',
            },
            {
              label: 'stream.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns floating point number',
              insertText: 'stream.parseFloat();',
            },
            {
              label: 'stream.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns floating point number',
              insertText: 'stream.parseFloat(${1:lookahead});',
            },
            {
              label: 'stream.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'returns floating point number',
              insertText: 'stream.parseFloat(${1:lookahead}, ${2:ignore});',
            },
            {
              label: 'stream.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'return integer number',
              insertText: 'stream.parseInt();',
            },
            {
              label: 'stream.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'return integer number',
              insertText: 'stream.parseInt(${1:lookahead});',
            },
            {
              label: 'stream.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'return integer number',
              insertText: 'stream.parseInt(${1:lookahead}, ${2:ignore});',
            },
            {
              label: 'HIGH',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:HIGH}',
            },
            {
              label: 'LOW',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:LOW}',
            },
            {
              label: 'INPUT',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:INPUT}',
            },
            {
              label: 'OUTPUT',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:OUTPUT}',
            },
            {
              label: 'INPUT_PULLUP',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:INPUT_PULLUP}',
            },
            {
              label: 'LED_BUILTIN',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:LED_BUILTIN}',
            },
            {
              label: 'true',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:true}',
            },
            {
              label: 'false',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:false}',
            },
            {
              label: 'array',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:array}',
            },
            {
              label: 'bool',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:bool}',
            },
            {
              label: 'byte',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:byte}',
            },
            {
              label: 'char',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:char}',
            },
            {
              label: 'double',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:double}',
            },
            {
              label: 'float',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:float}',
            },
            {
              label: 'int',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:int}',
            },
            {
              label: 'long',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:long}',
            },
            {
              label: 'short',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:short}',
            },
            {
              label: 'size_t',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:size_t}',
            },
            {
              label: 'string',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:string}',
            },
            {
              label: 'String()',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: 'String()',
            },
            {
              label: 'unsigned char',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:unsigned char}',
            },
            {
              label: 'unsigned long',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:unsigned long}',
            },
            {
              label: 'void',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:void}',
            },
            {
              label: 'word',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:word}',
            },
            {
              label: 'const',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:const}',
            },
            {
              label: 'scope',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:scope}',
            },
            {
              label: 'static',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:static}',
            },
            {
              label: 'volatile',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: '${1:volatile}',
            },
            {
              label: 'break',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: 'break',
            },
            {
              label: 'continue',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: 'continue',
            },
            {
              label: 'else',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: 'else',
            },
            {
              label: 'goto',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: 'goto',
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: 'if',
            },
            {
              label: 'dowhile',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              insertText: [
                'do {',
                '\t$0',
                '} while(${1:condition});'
              ].join('\n'),
              documentation: 'Do-while Statement',
            },
            {
              label: 'while',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: [
                'while(${1:condition}) {',
                '\t$0',
                '}'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'while Statement',
            },
            {
              label: 'for',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: [
                'for(${1:int} ${2:i};${3},${4}) {',
                '\t$0',
                '}'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'for Statement',
            },
            {
              label: 'switchcase',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: [
                'switch(${1:value}) {',
                '\tcase ${2:condition}',
                '\t\t$0',
                'break;',
                '}'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'switch Statement',
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
  /**
   * Constructor for code editor
   */
  constructor() { }
  /**
   * On code Change update the code in arduino
   */
  codeChanged() {
    this.arduinos[this.selectedIndex].code = this.code;
  }
  /**
   * Select the code for respective arduino. Event handler for Choosing arduino
   * @param item HTML Select Element
   */
  chooseArduino(item: HTMLSelectElement) {
    this.selectedIndex = item.selectedIndex;
    this.code = this.arduinos[this.selectedIndex].code;
  }
  /**
   * Event handler for Choosing the programming language.
   */
  chooseLanguage(item: HTMLSelectElement) {
    this.langIndex = item.selectedIndex;
    window['progLang'] =  this.langIndex;
  }
  /**
   * Toggle Libraries Box
   */
  openFolder() {
    const folder = document.getElementById('lib');

    if (folder.style.display === 'none') {
      folder.style.display = 'flex';
    } else {
      folder.style.display = 'none';
    }
  }

}
