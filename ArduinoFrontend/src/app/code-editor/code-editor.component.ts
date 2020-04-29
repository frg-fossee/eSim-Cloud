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
              label: 'digitalWrite',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Write a HIGH or a LOW value to a digital pin',
              insertText: 'digitalWrite(pin, value);',
            },
            {
              label: 'pinMode',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Configures the specified pin',
              insertText: 'pinMode(pin, mode);',
            },
            {
              label: 'analogRead',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Read Anolog Value',
              insertText: 'analogRead(pin);',
            },
            {
              label: 'analogReference',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Configures the reference voltage',
              insertText: 'analogReference(type);',
            },
            {
              label: 'analogReadresolution',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Sets the size of analogRead value',
              insertText: 'analogReadResolution(bits);',
            },
            {
              label: 'analogReadResolution',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Sets the size of analogRead value',
              insertText: 'analogReadResolution(bits);',
            },
            {
              label: 'analogWriteResolution',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Sets the resolution of analogWrite value',
              insertText: 'analogWriteResolution(bits);',
            },
            {
              label: 'noTone',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Stops the generation of a square wave',
              insertText: 'noTone(pin);',
            },
            {
              label: 'pulseIn',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Reads a pulse',
              insertText: 'pulseIn(pin, value);',
            },
            {
              label: 'pulseIn',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Reads a pulse',
              insertText: 'pulseIn(pin, value, timeout);',
            },
            {
              label: 'pulseInLong',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Reads a long pulse',
              insertText: 'pulseInLong(pin, value);',
            },
            {
              label: 'pulseInLong',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Reads a long pulse',
              insertText: 'pulseInLong(pin, value, timeout);',
            },
            {
              label: 'ShiftIn',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Shifts in a byte of data one bit at a time',
              insertText: 'shiftIn(dataPin, clockPin, bitOrder);',
            },
            {
              label: 'ShiftOut',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Shifts out a byte of data one bit at a time',
              insertText: 'shiftOut(dataPin, clockPin, bitOrder, value);',
            },
            {
              label: 'tone',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Generates a square wave of specified frequency',
              insertText: 'tone(pin, frequency);',
            },
            {
              label: 'tone',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Generates a square wave of specified frequency',
              insertText: 'tone(pin, frequency, duration);',
            },
            {
              label: 'delay',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'amount of time(milliseconds)',
              insertText: 'delay(ms);',
            },
            {
              label: 'delayMicroseconds',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'amount of time(microseconds)',
              insertText: 'delayMicroseconds(us);',
            },
            {
              label: 'micros',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Returns the number of microseconds',
              insertText: 'micros();',
            },
            {
              label: 'millis',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Returns the number of milliseconds',
              insertText: 'millis();',
            },
            {
              label: 'abs',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Calculates the absolute value of a number',
              insertText: 'abs(x);',
            },
            {
              label: 'constrain',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Constrains a number to be within a range',
              insertText: 'constrain(x, a, b);',
            },
            {
              label: 'map',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Re-maps a number',
              insertText: 'map(x, 1, 50, 50, 1);',
            },
            {
              label: 'map',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Re-maps a number',
              insertText: 'map(x, 1, 50, 50, -100);',
            },
            {
              label: 'max',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'maximum of two numbers',
              insertText: 'max(x, y);',
            },
            {
              label: 'min',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'mininmum of two numbers',
              insertText: 'min(x, y);',
            },
            {
              label: 'pow',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'value of a number raised to a power',
              insertText: 'pow(x, y);',
            },
            {
              label: 'sqr',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: ' square of a number',
              insertText: 'sq(x);',
            },
            {
              label: 'sqrt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'square root of a number',
              insertText: 'sqrt(x);',
            },
            {
              label: 'cos',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'cosine of an angle (in radians)',
              insertText: 'cos(rad);',
            },
            {
              label: 'sine',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'sine of an angle (in radians)',
              insertText: 'sin(rad);',
            },
            {
              label: 'tan',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'tangent of an angle (in radians)',
              insertText: 'tan(rad);',
            },
            {
              label: 'isAlpha',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is alpha (that is a letter)',
              insertText: 'isAlpha(thisChar);',
            },
            {
              label: 'isAlphaNumeric',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is alphanumeric',
              insertText: 'isAlphaNumeric(thisChar);',
            },
            {
              label: 'isAscii',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is Ascii',
              insertText: 'isAscii(thisChar);',
            },
            {
              label: 'isControl',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is control character',
              insertText: 'isControl(thisChar);',
            },
            {
              label: 'isDigit',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is digit',
              insertText: 'isDigit(thisChar);',
            },
            {
              label: 'isGraph',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is printable with some content',
              insertText: 'isGraph(thisChar);',
            },
            {
              label: 'isHexadecimalDigit',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is printable with some content',
              insertText: 'isHexadecimalDigit(thisChar);',
            },
            {
              label: 'isLowerCase',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is lower case',
              insertText: 'isLowerCase(thisChar);',
            },
            {
              label: 'isPrintable',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is printable',
              insertText: 'isPrintable(thisChar);',
            },
            {
              label: 'isSpace',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is white space character',
              insertText: 'isSpace(thisChar);',
            },
            {
              label: 'isUpperCase',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is upper case',
              insertText: 'isUpperCase(thisChar);',
            },
            {
              label: 'isWhiteSpace',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Analyse if a char is space character',
              insertText: 'isWhitespace(thisChar);',
            },
            {
              label: 'random',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'generates pseudo-random numbers',
              insertText: 'random(max);',
            },
            {
              label: 'random',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'generates pseudo-random numbers',
              insertText: 'random(min, max);',
            },
            {
              label: 'randomSeed',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'initializes the pseudo-random number generator',
              insertText: 'randomSeed(seed);',
            },
            {
              label: 'bit',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Computes the values of specified bit',
              insertText: 'bit(n);',
            },
            {
              label: 'bitClear',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Clears a bit of numeric variable',
              insertText: 'bitClear(x, n);',
            },
            {
              label: 'bitRead',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Reads a bit of a number',
              insertText: 'bitRead(x, n);',
            },
            {
              label: 'bitSet',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Sets a bit of a number variable',
              insertText: 'bitSet(x, n);',
            },
            {
              label: 'bitWrite',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Writes a bit of a numeric variable',
              insertText: 'bitWrite(x, n, b);',
            },
            {
              label: 'highByte',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Extracts high-order byte of a word',
              insertText: 'highByte(x);',
            },
            {
              label: 'lowByte',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Extracts low-order byte of a word',
              insertText: 'lowByte(x);',
            },
            {
              label: 'attachInterrupt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Digital Pins With Interrupts',
              insertText: 'attachInterrupt(digitalPinToInterrupt(pin), ISR, mode);',
            },
            {
              label: 'attachInterrupt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Digital Pins With Interrupts',
              insertText: 'attachInterrupt(interrupt, ISR, mode);',
            },
            {
              label: 'attachInterrupt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Digital Pins With Interrupts',
              insertText: 'attachInterrupt(pin, ISR, mode);',
            },
            {
              label: 'Interrupts',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Re-enable Interrupts',
              insertText: 'interrupts();',
            },
            {
              label: 'noInterrupts',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Disables interrupts',
              insertText: 'noInterrupts();',
            },
            {
              label: 'if(Serial)',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Indicates if the specified Serial port is ready',
              insertText: 'if (Serial);',
            },
            {
              label: 'Serial.available',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Get the numbers of bytes available',
              insertText: 'Serial.available();',
            },
            {
              label: 'Serial.availableForWrite',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Get the numbers of bytes available for writing',
              insertText: 'Serial.availableForWrite();',
            },
            {
              label: 'Serial.begin',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Sets the data rate in bits per second',
              insertText: 'Serial.begin(speed);',
            },
            {
              label: 'Serial.begin',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Sets the data rate in bits per second',
              insertText: 'Serial.begin(speed, config);',
            },
            {
              label: 'Serial.end',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Disable serial communication',
              insertText: 'Serial.end();',
            },
            {
              label: 'Serial.find',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'finds data from the serial buffer',
              insertText: 'Serial.find(target);',
            },
            {
              label: 'Serial.find',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'finds data from the serial buffer',
              insertText: 'Serial.find(target, length);',
            },
            {
              label: 'Serial.findUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'finds data until terminated string is found',
              insertText: 'Serial.findUntil(target, terminal);',
            },
            {
              label: 'Serial.flush',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Waits for the transmission of outgoing serial data to complete',
              insertText: 'Serial.flush();',
            },
            {
              label: 'Serial.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns floating point number',
              insertText: 'Serial.parseFloat();',
            },
            {
              label: 'Serial.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns floating point number',
              insertText: 'Serial.parseFloat(lookahead);',
            },
            {
              label: 'Serial.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns floating point number',
              insertText: 'Serial.parseFloat(lookahead, ignore);',
            },
            {
              label: 'Serial.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'return integer number',
              insertText: 'Serial.parseInt();',
            },
            {
              label: 'Serial.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'return integer number',
              insertText: 'Serial.parseInt(lookahead);',
            },
            {
              label: 'Serial.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'return integer number',
              insertText: 'Serial.parseInt(lookahead, ignore);',
            },
            {
              label: 'Serial.peek',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns the next byte',
              insertText: 'Serial.peek();',
            },
            {
              label: 'Serial.print',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'prints the data to serial data',
              insertText: 'Serial.print(val);',
            },
            {
              label: 'Serial.print',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'prints the data to serial data',
              insertText: 'Serial.print(val, format);',
            },
            {
              label: 'Serial.println',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'prints the data to serial data to next line',
              insertText: 'Serial.println(val);',
            },
            {
              label: 'Serial.println',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'prints the data to serial data to next line',
              insertText: 'Serial.println(val, format);',
            },
            {
              label: 'Serial.read',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Reads incoming serial data',
              insertText: 'Serial.read();',
            },
            {
              label: 'Serial.readBytes',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns the number of characters placed in the buffer',
              insertText: 'Serial.readBytes(buffer, length);',
            },
            {
              label: 'Serial.readBytesUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: ' returns the number of characters read into the buffer',
              insertText: 'Serial.readBytesUntil(character, buffer, length);',
            },
            {
              label: 'Serial.readString',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'read characters in string ',
              insertText: 'Serial.readString();',
            },
            {
              label: 'Serial.readStringUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'read characters in string ',
              insertText: 'Serial.readStringUntil(terminator);',
            },
            {
              label: 'Serial.setTimeout',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'sets the time to wait for serial data ',
              insertText: 'Serial.setTimeout(time);',
            },
            {
              label: 'Serial.write',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Writes binary data to the serial port',
              insertText: 'Serial.write(val);',
            },
            {
              label: 'Serial.write',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Writes binary data to the serial port',
              insertText: 'Serial.write(str);',
            },
            {
              label: 'Stream.available',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Get the numbers of bytes available in stream',
              insertText: 'stream.available();',
            },
            {
              label: 'Stream.read',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'reads characters from an incoming stream',
              insertText: 'stream.read();',
            },
            {
              label: 'stream.find',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'finds data from the serial buffer',
              insertText: 'stream.find(target);',
            },
            {
              label: 'stream.find',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'finds data from the serial buffer',
              insertText: 'stream.find(target, length);',
            },
            {
              label: 'stream.findUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'finds data until terminated string is found',
              insertText: 'stream.findUntil(target, terminal);',
            },
            {
              label: 'stream.flush',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'clears the buffer',
              insertText: 'stream.flush();',
            },
            {
              label: 'stream.peek',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Read byte from file without advancing to the next one',
              insertText: 'stream.peek();',
            },
            {
              label: 'stream.readBytes',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'read characters from a stream into buffer',
              insertText: 'stream.readBytes(buffer, length);',
            },
            {
              label: 'stream.readBytesUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'read characters from a stream into buffer',
              insertText: 'stream.readBytesUntil(character, buffer, length);',
            },
            {
              label: 'Stream.readString',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'read characters in string ',
              insertText: 'stream.readString();',
            },
            {
              label: 'stream.readStringUntil',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'read characters in string ',
              insertText: 'stream.readStringUntil(terminator);',
            },
            {
              label: 'stream.setTimeout',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'sets the time to wait for serial data ',
              insertText: 'stream.setTimeout(time);',
            },
            {
              label: 'stream.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns floating point number',
              insertText: 'stream.parseFloat();',
            },
            {
              label: 'stream.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns floating point number',
              insertText: 'stream.parseFloat(lookahead);',
            },
            {
              label: 'stream.parseFloat',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'returns floating point number',
              insertText: 'stream.parseFloat(lookahead, ignore);',
            },
            {
              label: 'stream.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'return integer number',
              insertText: 'stream.parseInt();',
            },
            {
              label: 'stream.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'return integer number',
              insertText: 'stream.parseInt(lookahead);',
            },
            {
              label: 'stream.parseInt',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'return integer number',
              insertText: 'stream.parseInt(lookahead, ignore);',
            },
            {
              label: 'HIGH',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'HIGH',
            },
            {
              label: 'LOW',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'LOW',
            },
            {
              label: 'INPUT',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'INPUT',
            },
            {
              label: 'OUTPUT',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'OUTPUT',
            },
            {
              label: 'INPUT_PULLUP',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'INPUT_PULLUP',
            },
            {
              label: 'LED_BUILTIN',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'LED_BUILTIN',
            },
            {
              label: 'true',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'true',
            },
            {
              label: 'false',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'false',
            },
            {
              label: 'array',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'array',
            },
            {
              label: 'bool',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'bool',
            },
            {
              label: 'byte',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'byte',
            },
            {
              label: 'char',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'char',
            },
            {
              label: 'double',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'double',
            },
            {
              label: 'float',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'float',
            },
            {
              label: 'int',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'int',
            },
            {
              label: 'long',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'long',
            },
            {
              label: 'short',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'short',
            },
            {
              label: 'size_t',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'size_t',
            },
            {
              label: 'string',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'string',
            },
            {
              label: 'String()',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'String()',
            },
            {
              label: 'unsigned char',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'unsigned char',
            },
            {
              label: 'unsigned long',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'unsigned long',
            },
            {
              label: 'void',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'void',
            },
            {
              label: 'word',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'word',
            },
            {
              label: 'const',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'const',
            },
            {
              label: 'scope',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'scope',
            },
            {
              label: 'static',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'static',
            },
            {
              label: 'volatile',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'volatile',
            },
            {
              label: 'break',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'break',
            },
            {
              label: 'continue',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'continue',
            },
            {
              label: 'else',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'else',
            },
            {
              label: 'goto',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'goto',
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'if',
            },
            {
              label: 'dowhile',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: [
                'do {',
                '\t$0',
                '} while(${1:condition});'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
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
