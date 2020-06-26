import { Component, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Workspace, ConsoleType } from '../Libs/Workspace';
import { Utils } from '../Libs/Utils';
import { MatDialog } from '@angular/material';
import { ViewComponentInfoComponent } from '../view-component-info/view-component-info.component';
import { ExportfileComponent } from '../exportfile/exportfile.component';
import { ComponentlistComponent } from '../componentlist/componentlist.component';
import { Title } from '@angular/platform-browser';
import { SaveOffline } from '../Libs/SaveOffiline';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';
import { SaveOnline } from '../Libs/SaveOnline';
import { HttpErrorResponse } from '@angular/common/http';
declare var Raphael;


@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SimulatorComponent implements OnInit {
  canvas: any;
  projectId: any = null; // Stores the id of project
  projectTitle = 'Untitled'; // Stores the title of project
  description = ''; // Stores the description of project
  showProperty = true;
  componentsBox = Utils.componentBox;
  components = Utils.components;
  openCodeEditor = false; // stores the initial status of code editor
  toggle = true; // Stores toggle status for code editor
  stoggle = true; // stores toggle status for simulation button
  disabled = false;
  toggle1 = false; // Stores the toggle status for expanding Virtual console
  atoggle = false; // stores the toggle status for closing/opening Virtual console
  token: string;
  username: string;

  constructor(
    private aroute: ActivatedRoute,
    public dialog: MatDialog,
    private injector: Injector,
    private title: Title,
    private router: Router,
    private api: ApiService
  ) {
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
    this.token = Login.getToken();
    if (this.token) {
      this.api.userInfo(this.token).subscribe((tmp) => {
        this.username = tmp.username;
      }, err => {
        if (err.status === 401) {
          Login.logout();
        }
        this.token = null;
        console.log(err);
      });
    }

    this.aroute.queryParams.subscribe(v => {
      if (Object.keys(v).length === 0 && this.projectId) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      if (v.gallery) {
        this.OpenGallery(v.gallery);
        return;
      }
      if (v.id && v.offline === 'true') {
        // if project id is present then project is read from offline
        this.projectId = parseInt(v.id, 10);
        if (this.projectId) {
          SaveOffline.Read(this.projectId, (data) => {
            this.LoadProject(data);
          });
        }
      } else if (v.id) {
        this.projectId = v.id;
        this.LoadOnlineProject(v.id);
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
    this.disabled = true;
    // Clears Output in Console
    Workspace.ClearConsole();
    // prints the output in console
    window['printConsole']('Starting Simulation', ConsoleType.INFO);

    this.stoggle = !this.stoggle;
    const sim = document.getElementById('console');

    // Show Loading Animation
    document.getElementById('simload').style.display = 'block';

    // if status is Stop simulation then console is opened
    if (!this.stoggle) {
      sim.style.display = 'block';
      Workspace.CompileCode(this.api, () => {
        this.disabled = false;
        document.getElementById('simload').style.display = 'none';
      });
    } else {
      sim.style.display = 'none';
      Workspace.stopSimulation(() => {
        this.disabled = false;
        document.getElementById('simload').style.display = 'none';
      });
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
  minimizeConsole() {
    const Console = document.getElementById('console');
    const close = document.querySelector('#console > .body');
    if (this.toggle1) {
      this.toggle1 = !this.toggle1;
    }
    this.atoggle = !this.atoggle;
    if (this.atoggle) {
      (close as HTMLElement).style.display = 'none';
      Console.style.height = 'auto';
    } else {
      (close as HTMLElement).style.display = 'flex';
      Console.style.height = '30%';
    }
  }
  /** function called to open Virtual Console */
  expandConsole() {
    const Console = document.getElementById('console');
    if (this.atoggle) {
      const close = document.querySelector('#console > .body');
      (close as HTMLElement).style.display = 'flex';
      this.atoggle = !this.atoggle;
    }
    this.toggle1 = !this.toggle1;
    if (this.toggle1) {
      Console.style.height = 'calc(100% - 110px)';
    } else {
      Console.style.height = '30%';
    }
  }

  clearConsole() {
    Workspace.ClearConsole();
  }

  PrintToConsole(sin: HTMLInputElement) {
    if (sin.value) {
      const tmp = sin.value;
      for (const ard of window['scope']['ArduinoUno']) {
        if (ard.runner) {
          ard.runner.serialInput(tmp);
        }
      }
    }
    sin.value = '';
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
    this.projectTitle = el.value;
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
  /** Function saves or updates the project Online */
  SaveProject() {
    if (!(Login.getToken())) {
      alert('Please Login! Before Login Save the Project Temporary.');
      return;
    }
    if (SaveOnline.isUUID(this.projectId)) {
      SaveOnline.Save(this.projectTitle, this.description, this.api, (_) => alert('Updated'), this.projectId);
    } else {
      SaveOnline.Save(this.projectTitle, this.description, this.api, (out) => {
        alert('Saved');
        this.router.navigate(
          [],
          {
            relativeTo: this.aroute,
            queryParams: {
              id: out.save_id,
              online: true,
              offline: null,
              gallery: null
            },
            queryParamsHandling: 'merge'
          }
        );
      });
    }
  }
  /** Function saves or updates the project offline */
  SaveProjectOff() {
    if (SaveOnline.isUUID(this.projectId)) {
      alert('Project is already Online!');
      return;
    }
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
              offline: true,
              gallery: null
            },
            queryParamsHandling: 'merge'
          }
        );
      });
    }
  }
  /** Function clear variables in the Workspace */
  ClearProject() {
    Workspace.ClearWorkspace();
    this.closeProject();
  }
  LoadOnlineProject(id) {
    const token = Login.getToken();
    if (!token) {
      alert('Please Login');
      return;
    }
    this.api.readProject(id, token).subscribe((data: any) => {
      this.projectTitle = data.name;
      this.description = data.description;
      this.title.setTitle(this.projectTitle + ' | Arduino On Cloud');
      Workspace.Load(JSON.parse(data.data_dump));
    }, (err: HttpErrorResponse) => {
      if (err.status === 401) {
        alert('You are Not Authorized to view this circuit');
        window.open('../../../', '_self');
        return;
      }
      alert('Something Went Wrong');
      console.log(err);
    });
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
  closeProject() {
    const closeProject = document.getElementById('opendialog');
    closeProject.style.display = 'none';
  }
  openProject() {
    const openProject = document.getElementById('opendialog');
    openProject.style.display = 'block';
  }
  Login() {
    Login.redirectLogin();
  }
  Logout() {
    Login.logout();
  }
  OpenGallery(index: string) {
    window['showLoading']();
    const i = parseInt(index, 10);
    if (!isNaN(i)) {
      this.api.fetchSamples().subscribe(out => {
        if (out[i]) {
          this.projectTitle = out[i].name;
          this.title.setTitle(this.projectTitle + ' | Arduino On Cloud');
          this.description = out[i].description;
          Workspace.Load(JSON.parse(out[i].data_dump));
        } else {
          alert('No Item Found');
        }
        window['hideLoading']();
      }, err => {
        alert('Failed to load From gallery!');
        window['hideLoading']();
      });
    } else {
      window['hideLoading']();
    }
  }
}
