import { Component, OnInit, wtfLeave, Injector, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Workspace, ConsoleType } from '../Libs/Workspace';
import { Utils } from '../Libs/Utils';
import { MatDialog, MatRadioModule } from '@angular/material';
import { ViewComponentInfoComponent } from '../view-component-info/view-component-info.component';
import { ExportfileComponent } from '../exportfile/exportfile.component';
import { ComponentlistComponent } from '../componentlist/componentlist.component';
import { Title } from '@angular/platform-browser';
import { SaveOffline } from '../Libs/SaveOffiline';
declare var Raphael;


@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SimulatorComponent implements OnInit {
  canvas: any;
  projectId: number = null; // Stores the id of project
  projectTitle = 'Untitled'; // Stores the title of project
  description = ''; // Stores the description of project
  showProperty = true;
  componentsBox = Utils.componentBox;
  components = Utils.components;
  openCodeEditor = false; // stores the initial status of code editor
  toggle = true; // Stores toggle status for code editor
  stoggle = true; // stores toggle status for simulation button
  status = 'Start Simulation'; //  stores the initial status of simulation button
  toggle1 = false; // Stores the toggle status for expanding Virtual console
  atoggle = false; // stores the toggle status for closing/opening Virtual console

  constructor(
    private aroute: ActivatedRoute,
    public dialog: MatDialog,
    private injector: Injector,
    private title: Title,
    private router: Router) {
    Workspace.initializeGlobalFunctions();
    Workspace.injector = this.injector;
  }
  /** Function dynamically creates an SVG tag */
  makeSVGg() {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    el.setAttribute('transform', 'scale(1,1)translate(0,0)');
    return el;
  }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      // console.log(v);
      this.projectId = parseInt(v.id, 10);
      // if project id is present then project is read from offline
      if (this.projectId) {
        SaveOffline.Read(this.projectId, (data) => {
          this.LoadProject(data);
        });
      }
    });

    const gtag = this.makeSVGg();
    this.canvas = Raphael('holder', '100%', '100%');
    document.querySelector('#holder > svg').appendChild(gtag);
    this.canvas.canvas = gtag;

    Workspace.initalizeGlobalVariables(this.canvas);

    /**
     * Initialize Event Listeners -> Workspace.ts File Contains all the event listeners
     */
    const holder = document.getElementById('holder');
    holder.addEventListener('click', Workspace.click, true);
    holder.addEventListener('mousedown', Workspace.mouseDown, true);
    holder.addEventListener('mousemove', Workspace.mouseMove, true);
    holder.addEventListener('mouseup', Workspace.mouseUp, true);
    holder.addEventListener('contextmenu', Workspace.contextMenu, true);
    holder.addEventListener('copy', Workspace.copy, true);
    holder.addEventListener('cut', Workspace.cut, true);
    holder.addEventListener('dblclick', Workspace.doubleClick, true);
    holder.addEventListener('dragleave', Workspace.dragLeave, true);
    holder.addEventListener('dragover', Workspace.dragOver, true);
    holder.addEventListener('drop', Workspace.drop, true);
    holder.addEventListener('wheel', Workspace.mouseWheel, true);
    holder.addEventListener('paste', Workspace.paste, true);
    document.body.addEventListener('mousemove', Workspace.bodyMouseMove);
    document.body.addEventListener('mouseup', Workspace.bodyMouseUp);
    document.body.addEventListener('keydown', Workspace.keyDown, true);
    document.body.addEventListener('keypress', Workspace.keyPress, true);
    document.body.addEventListener('keyup', Workspace.keyUp, true);

    // Initialize Property Box
    Workspace.initProperty(v => {
      this.showProperty = v;
    });
    // this.StartSimulation();
  }
  /**
   * Enable Move on Property Box
   */
  startPropertyDrag() {
    window['property_box'].start = true;
  }
  /**
   * Handle Mouse down on Property Box
   * @param event Mouse Event
   */
  propertyMouseDown(event: MouseEvent) {
    const bbox = (window['property_box'].element as HTMLElement).getBoundingClientRect();
    window['property_box'].x = event.clientX - bbox.left;
    window['property_box'].y = event.clientY - bbox.top;
  }

  /**
   * Hide/Show Categories Component
   * @param block Clicked Element
   */
  Collapse(block: HTMLElement) {
    const collapsedDivs = Array.from(document.getElementsByClassName('show-div'));

    for (const item of collapsedDivs) {
      if (block !== item) {
        item.classList.remove('show-div');
      }
    }

    block.classList.toggle('show-div');
  }

  /** Function called when Start Simulation button is triggered */
  StartSimulation() {
    // Clears Output in console when clear button triggered
    Workspace.ClearConsole();
    // prints the output in console
    window['printConsole']('Starting Simulation', ConsoleType.INFO);
    this.stoggle = !this.stoggle;
    this.status = this.stoggle ? 'Start Simulation' : 'Stop Simulation';
    const sim = document.getElementById('console');
    const simload = document.getElementById('simload');
    // if status is Stop simulation then console is opened
    if (!this.stoggle) {
      sim.style.display = 'block';
      // simload.style.display = 'block';
      Workspace.CompileCode();
    } else {
      sim.style.display = 'none';
      Workspace.stopSimulation();
      // this.hidesimload();
    }
  }
  /** Function called to hide simulation loading svg */
  hidesimload() {
    const simload = document.getElementById('simload');
    simload.style.display = 'none';
  }
  /**
   * Hide/Show (toggle) Code Editor
   * @param elem Code Editor Parent Div
   */
  toggleCodeEditor(elem: HTMLElement) {
    elem.classList.toggle('show-code-editor');
    this.toggle = !this.toggle;
    this.openCodeEditor = !this.openCodeEditor;
    /* var div = document.getElementById('console');
     //alert(div.style.display);
     // console.log("meet");
     if (div.style.display === 'none') {
       div.style.display = 'block';
     } else {
       div.style.display = 'none';
     }*/
  }
  /** Function called to close Virtual console */
  closeConsole() {
    const close = document.getElementById('console');
    const ft = document.getElementById('footer');
    const msg = document.getElementById('msg');
    this.atoggle = !this.atoggle;
    if (this.atoggle) {
      close.style.height = '30px';
      msg.style.height = '0px';
      ft.style.display = 'none';

    } else if (!this.atoggle || !this.toggle1) {
      close.style.bottom = '40px';
      close.style.height = '620px';
      msg.style.height = '565px';
      ft.style.display = 'block';
    } else {
      msg.style.height = '150px';
      close.style.height = '230px';
      ft.style.display = 'block';

    }
  }
  /** function called to open Virtual Console */
  expandConsole() {
    const msg = document.getElementById('msg');
    const console = document.getElementById('console');
    this.toggle1 = !this.toggle1;

    if (this.toggle1 || console.style.top === '495px') {
      console.style.bottom = '40px';
      console.style.height = '620px';
      msg.style.height = '565px';
    } else {
      console.style.bottom = '0px';
      console.style.height = '230px';
      msg.style.height = '150px';
    }
  }

  clearConsole() {
    Workspace.ClearConsole();
  }

  /**
   * Project Title input focus out callback
   * @param evt Event
   */
  onFocusOut(evt) {
    // check if textbox is empty if it is change title back to Untitled
    const el = evt.target;
    if (el.value === '') {
      el.value = 'Untitled';
    }
  }
  /**
   * Function invoked when dbclick is performed on a component inside ComponentList
   * @param key string
   */
  componentdbClick(key: string) {
    Workspace.addComponent(key, 100, 100, 0, 0);
  }
  /**
   * Event is fired when the user starts dragging an component or text selection.
   * @param event DragEvent
   * @param key string
   */
  dragStart(event: DragEvent, key: string) {
    event.dataTransfer.dropEffect = 'copyMove';
    event.dataTransfer.setData('text', key);
  }
  /**
   * Function calls zoomIn/Out() mentioned in Workspace.ts
   * @param x number
   */
  zoom(x: number) {
    if (x === 0) {
      Workspace.zoomIn();
    } else {
      Workspace.zoomOut();
    }
  }
  /** Functions opens Info Dailog Box on selecting the component */
  openInfo() {
    const dialogRef = this.dialog.open(ViewComponentInfoComponent, {
      width: '500px'
    });
    dialogRef.afterClosed();
  }
  /** Function opens Dailog Box on selecting Export option */
  openDailog() {
    const exportref = this.dialog.open(ExportfileComponent);
    exportref.afterClosed();
  }
  /** Function opens Component List Dailog box on selecting view option */
  openview() {
    const viewref = this.dialog.open(ComponentlistComponent, {
      width: '600px'
    });
    viewref.afterClosed();
  }
  /** Function deletes the component */
  delete() {
    Workspace.DeleteComponent();
    Workspace.hideContextMenu();
  }
  /** Function pastes the component */
  paste() {
    Workspace.pasteComponent();
    Workspace.hideContextMenu();
  }
  /** Function copy the component */
  copy() {
    Workspace.copyComponent();
    Workspace.hideContextMenu();
  }
  /** Function saves or updates the project */
  SaveProject() {
    if (this.projectId) {
      Workspace.SaveCircuit(this.projectTitle, this.description, null, this.projectId);
    } else {
      Workspace.SaveCircuit(this.projectTitle, this.description, (v) => {
        this.router.navigate(
          [],
          {
            relativeTo: this.aroute,
            queryParams: {
              id: v.id,
              offline: true
            },
            queryParamsHandling: 'merge'
          }
        );
      });
    }
  }
  /** Function clear variables in the Workspace */
  ClearProject() {
    // TODO: Clear Variables instead of Reloading
    window.location.reload();
  }
  /**
   * Function called after reading data from offline
   * @param data any
   */
  LoadProject(data: any) {
    // console.log(data);
    this.projectTitle = data.project.name;
    this.description = data.project.description;
    this.title.setTitle(this.projectTitle + ' | Arduino On Cloud');
    Workspace.Load(data);
  }
}
