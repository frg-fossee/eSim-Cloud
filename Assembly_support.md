# Assembly Support for the .ino files
Submission for screening task 6<br>
By :-<br>
**Deepam Priyadarshi**<br>
deepam.priyadarshi2019@vitstudent.ac.in  
deepam.odhisha@gmail.com (personal)

## Approach
Since the initial django docker image present at `docker.pkg.github.com/frg-fossee/esim-cloud/django:dev` has only `avr-gcc` toolchain support, so I can only implement `C inline Assembly` programming in which the `avr-gcc` compiles `.c` files. For using `.asm` file we require `avra` assembler, for which I have to rebuild the comtainer images.  

For the swithcing between the programming languages, the users have the liberty to select the type of programming language from the editor' drop down menu as shown in the figure:- 

<p align="center">
  <kbd>
  <img src="https://user-images.githubusercontent.com/65447610/155759550-de0a8c07-3c53-4b23-b057-a0de3b4fc95b.png" alt="Selecting Laguage" width="265" height="248" style="border: 5px solid #555">
    </kbd>
</p>

### avr-gcc compilation procedure
1. To compile the `.c` file received from the frontend we use the command `avr-gcc -Os -DF_CPU=16000000UL -mmcu=atmega328p -c -o {obj_name} {ino_name}`
2. The above step generates an object file `sketch.o` which is then converted to a binary file named `sketch` using the command `avr-gcc -mmcu=atmega328p {obj_name} -o {bin_name}`
3. The binary file is then converted to IntelHEX format using the command `avr-objcopy -O ihex -R .eeprom {bin_name} {out_name}`

## Steps taken to add assembly support
1. A new form element was added in the `code-editor.component.html` file which takes the input of the desired programming laguage in the form of a drop down menu.
2. A new property `progLang` was introduced in the `window` object which keeps the track of programming language used.
3. A new function `CompileInlineASM` is introduced in the `task.py` file which compiles the C Inline assembly code using `avr-gcc`.
4. A new class `CompileSketchInlineASM` in introduced in the `views.py` file
5. New routes and urls are added in the `urls.py` and `api.service.ts` files. And the respective apis are called in the `workspace.ts` file according to the requirement.

## Files Changed
1.  `eSim-Cloud/esim-cloud-backend/arduinoAPI/tasks.py`
2.  `eSim-Cloud/esim-cloud-backend/arduinoAPI/views.py`
3.  `eSim-Cloud/esim-cloud-backend/arduinoAPI/urls.py`
4.  `eSim-Cloud/ArduinoFrontend/src/app/Libs/Workspace.ts`
5.  `eSim-Cloud/ArduinoFrontend/src/app/Libs/Workspace.ts`
6.  `eSim-Cloud/ArduinoFrontend/src/app/code-editor/code-editor.component.ts`
7.  `eSim-Cloud/ArduinoFrontend/src/app/code-editor/code-editor.component.html`

## Video Demostration




https://user-images.githubusercontent.com/65447610/155765289-da379d63-d570-468a-8235-6e8e1967c7bf.mp4


