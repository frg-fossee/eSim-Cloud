import { Component, OnInit, Injector, ViewEncapsulation, OnDestroy } from '@angular/core';
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
import { environment } from 'src/environments/environment';
import { AlertService } from '../alert/alert-service/alert.service';
import { LayoutUtils } from '../layout/ArduinoCanvasInterface';
import { ExportJSONDialogComponent } from '../export-jsondialog/export-jsondialog.component';
import { UndoUtils } from '../Libs/UndoUtils';
import { ExitConfirmDialogComponent } from '../exit-confirm-dialog/exit-confirm-dialog.component';
import { SaveProjectDialogComponent } from './save-project-dialog/save-project-dialog.component';
import { sample } from 'rxjs/operators';
/**
 * Declare Raphael so that build don't throws error
 */
declare var Raphael;

/**
 * Class For Simulator Page (Component)
 */
@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SimulatorComponent implements OnInit, OnDestroy {
  /**
   * Raphael Paper
   */
  canvas: any;
  /**
   * Stores the id of project
   */
  projectId: any = null;
  /**
   *  Stores the title of project
   */
  projectTitle = 'Untitled';
  /**
   * Stores the description of project
   */
  description = '';
  /**
   * Toggle for Property Box
   */
  showProperty = true;
  /**
   * Component Box Object
   */
  componentsBox = Utils.componentBox;
  /**
   * String to Component map
   */
  components = Utils.components;
  /**
   * stores the initial status of code editor (Open/Closed)
   */
  openCodeEditor = false;
  /**
   * Stores toggle status for code editor
   */
  toggle = true;
  /**
   * Stores toggle status for simulation button
   */
  stoggle = true;
  /**
   * Simulation button toggle for disabling
   */
  disabled = false;
  /**
   * Stores the toggle status for expanding Virtual console
   */
  toggle1 = false;
  /**
   * stores the toggle status for closing/opening Virtual console
   */
  atoggle = false;
  /**
   * Login Token
   */
  token: string;
  /**
   * Username
   */
  username = '';
  /**
   * window
   */
  window: any;
  /**
   * Is autolayout in progress?
   */
  isAutoLayoutInProgress = false;
  /**
   * Hide/Show submit button
   */
  submitButtonVisibility = false;
  /**
   * LTI ID of LTI App (if simulator is opened on LMS)
   */
  ltiId = '';
  /**
   * LTI Nonce of LTI App (if simulator is opened on LMS)
   */
  ltiNonce = '';
  /**
   * LTI User ID of LTI App (if simulator is opened on LMS)
   */
  ltiUserId = '';
  /**
   * Currently loaded circuit's branch
   */
  branch: string;
  /**
   * Currently loaded circuit's version
   */
  version: string;
  /**
   * Currently loaded circuit's save time
   */
  saveTime: Date;
  /**
   * Determines whether staff is
   */
  isStaff = false;
  /**
   * Simulator Component constructor
   * @param aroute Activated Route
   * @param dialog Material Dialog
   * @param injector App Injector
   * @param title Document Title
   * @param router Router to navigate
   * @param api API service for api calls
   */
  constructor(
    private aroute: ActivatedRoute,
    public dialog: MatDialog,
    private injector: Injector,
    private title: Title,
    private router: Router,
    private api: ApiService,
    private alertService: AlertService,
  ) {
    // Initialize Global Variables
    Workspace.initializeGlobalFunctions();
  }
  /** Function dynamically creates an SVG tag */
  makeSVGg() {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // Set Default Scale and Translation
    el.setAttribute('transform', 'scale(1,1)translate(0,0)');
    return el;
  }
  /**
   * On Destroy Callback
   */
  ngOnDestroy() {
    // If production remove save before close popup
    if (environment.production) {
      window.removeEventListener('beforeunload', Workspace.BeforeUnload);
    }
    // Make Redo & Undo Stack empty
    UndoUtils.redo = [];
    UndoUtils.undo = [];
  }
  /**
   * On Init Callback
   */
  ngOnInit() {
    // Get User Token
    this.api.login().then(() => {
      // if token is valid get User name
      this.token = Login.getToken();
      if (this.token) {
        this.api.getRole(this.token).subscribe((result: any) => {
          result.is_arduino_staff === true ? this.isStaff = true : this.isStaff = false;
        });
        this.api.userInfo(this.token).subscribe((tmp) => {
          this.username = tmp.username;
        }, err => {
          if (err.status === 401) {
            // Unauthorized clear token
            Login.logout();
          }
          this.token = null;
          console.log(err);
        });
      }
    });
    this.projectId = null;

    // Detect change in url Query parameters
    this.aroute.queryParams.subscribe(v => {

      // if project id is present and no query parameter then redirect to dashoard
      if (Object.keys(v).length === 0 && this.projectId) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      // if gallery query parameter is present
      if (v.gallery) {
        this.OpenGallery(v.gallery, v.proId);
        return;
      }
      // if id is present and it is ofline
      if (v.id && v.offline === 'true') {
        // if project id is present then project is read from offline
        this.projectId = parseInt(v.id, 10);
        if (this.projectId) {
          SaveOffline.Read(this.projectId, (data) => {
            this.LoadProject(data);
          });
        }
      } else if (v.id && v.lti_id && v.lti_nonce && v.lti_user_id) {
        this.projectId = v.id;
        this.ltiId = v.lti_id;
        this.ltiNonce = v.lti_nonce;
        this.ltiUserId = v.lti_user_id;
        this.branch = v.branch;
        this.version = v.version;
        this.submitButtonVisibility = true;
        this.LoadOnlineProject(v.id, 'false');
      } else if (v.id) {
        this.projectId = v.id;
        this.LoadOnlineProject(v.id, v.offline);
        this.submitButtonVisibility = false;
      }
    });


    // Make a svg g tag
    const gtag = this.makeSVGg();
    // Create Canvas
    this.canvas = Raphael('holder', '100%', '100%');
    // insert g tag
    document.querySelector('#holder > svg').appendChild(gtag);
    this.canvas.canvas = gtag; // Change the reference

    // Initialize clobal variables
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

    if (environment.production) {
      // Global function for displaying alert msg during closing and reloading page
      window.addEventListener('beforeunload', Workspace.BeforeUnload);
    }

    // Initialize Property Box
    Workspace.initProperty(v => {
      this.showProperty = v;
    });

    // Initializing window
    this.window = window;
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
      // Compile code and show loading animation
      sim.style.display = 'block';
      Workspace.CompileCode(this.api, () => {
        this.disabled = false;
        document.getElementById('simload').style.display = 'none';
      });
    } else {
      // Hide loading animation
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
  }
  /** Function called to Minimize Virtual console */
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
  /** function called to Expand Virtual Console */
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
  /**
   * Clear Virtual Console
   */
  clearConsole() {
    Workspace.ClearConsole();
  }
  /**
   * Send Serial data to arduino
   * @param sin Serial Input Html Element
   */
  PrintToConsole(sin: HTMLInputElement) {
    if (sin.value) {
      const tmp = sin.value;
      for (const ard of window['scope']['ArduinoUno']) {
        if (ard.runner) {
          ard.runner.serialInput(tmp);
        }
      }
    }
    sin.value = ''; // Clear input
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
    return this.projectTitle;
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
    // Save Dump of current Workspace
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

  autoLayout() {
    // this.isAutoLayoutInProgress = true;
    LayoutUtils.solveAutoLayout();
    // this.isAutoLayoutInProgress = false;
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
    // if Not logged in show message
    if (!(Login.getToken())) {
      AlertService.showAlert('Please login! Before Login Save the Project Temporary.');
      return;
    }
    // if projet id is uuid (online circuit)
    if (SaveOnline.isUUID(this.projectId)) {
      this.aroute.queryParams.subscribe(params => {
        const branch = params.branch;
        const versionId = params.version;
        const newVersionId = this.getRandomString(20);
        // Update Project to DB
        SaveOnline.Save(this.projectTitle, this.description, this.api, branch, newVersionId, (out) => {
          AlertService.showAlert('Updated');
          if (out['duplicate']) {
            // TODO: if duplicate, refresh the route with same versionId and same branch
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              // add new query parameters
              this.router.navigate(
                ['/simulator'],
                {
                  relativeTo: this.aroute,
                  queryParams: {
                    id: out.save_id,
                    online: true,
                    offline: null,
                    gallery: null,
                    version: versionId,
                    branch
                  },
                  queryParamsHandling: 'merge'
                }
              );
            });

            return;
          }
          // If project is not duplicate refresh route with newVersion Id and same branch
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            // add new query parameters
            this.router.navigate(
              ['/simulator'],
              {
                relativeTo: this.aroute,
                queryParams: {
                  id: out.save_id,
                  online: true,
                  offline: null,
                  gallery: null,
                  version: newVersionId,
                  branch
                },
                queryParamsHandling: 'merge'
              }
            );
          });
        }, this.projectId);
      });
    } else {
      // TODO: Save a new project within master branch
      const branch = 'master';
      const versionId = this.getRandomString(20);
      // Save Project and show alert
      SaveOnline.Save(this.projectTitle, this.description, this.api, branch, versionId, (out) => {
        AlertService.showAlert('Saved');
        // add new query parameters
        this.router.navigate(
          [],
          {
            relativeTo: this.aroute,
            queryParams: {
              id: out.save_id,
              online: true,
              offline: null,
              gallery: null,
              version: versionId,
              branch
            },
            queryParamsHandling: 'merge'
          }
        );
      });
    }
  }
  /** Function saves or updates the project offline */
  SaveProjectOff(callback = null) {
    // if Project is UUID
    if (SaveOnline.isUUID(this.projectId)) {
      AlertService.showAlert('Project is already Online!');
      return;
    }
    // Save circuit if id is not presenr
    if (this.projectId) {
      Workspace.SaveCircuit(this.projectTitle, this.description, callback, this.projectId);
    } else {
      // save circuit and add query parameters
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
        if (callback) {
          callback();
        }
      });
    }
  }

  /**
   * Function save the gallery
   */
  addToGallery() {
    SaveOnline.staffSaveGallery(this.projectTitle, this.description, this.api, (out) => {
      // this.router.navigate(['/gallery'])
    });

  }
  /** Function clear variables in the Workspace */
  ClearProject() {
    Workspace.ClearWorkspace();
    this.closeProject();
  }
  /**
   * Fetches project from cloud
   * @param id Project id
   * @param offline A check whether circuit is offline or shared in absence of token
   */
  LoadOnlineProject(id, offline) {
    const token = Login.getToken();
    if (!token && offline !== 'false') {
      AlertService.showAlert('Please Login');
      return;
    }
    this.aroute.queryParams.subscribe(params => {
      // read branch from queryParams
      const branch = params.branch;
      // read version from queryParams
      const version = params.version;
      // read project from DB
      this.api.readProject(id, branch, version, token).subscribe((data: any) => {
        this.projectTitle = data.name;
        this.description = data.description;
        this.saveTime = data.save_time;
        this.title.setTitle(this.projectTitle + ' | Arduino On Cloud');
        Workspace.Load(JSON.parse(data.data_dump));
      });
    }, (err: HttpErrorResponse) => {
      if (err.status === 401) {
        AlertService.showAlert('You are Not Authorized to view this circuit');
        window.open('../../../', '_self');
        return;
      }
      AlertService.showAlert('Something Went Wrong');
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
  /**
   * Close Clear message Dialog
   */
  closeProject() {
    const closeProject = document.getElementById('opendialog');
    closeProject.style.display = 'none';
  }
  /**
   * Open clear project dialog
   */
  openProject() {
    const openProject = document.getElementById('opendialog');
    openProject.style.display = 'block';
  }
  /**
   * Redirect to Login
   */
  Login() {
    Login.redirectLogin();
  }
  /**
   * Logout and clear token
   */
  Logout() {
    // Login.logout();
    this.api.logout(Login.getToken());
  }
  RouteToSimulator() {
    this.window.location = '../#/simulator';
    this.window.location.reload();
  }
  /**
   * @param routeLink route link
   * @param isAbsolute is the link absolute? [pass false if relatives]
   */
  RouteToFunction(routeLink, isAbsolute = false) {
    return () => {
      if (isAbsolute) {
        this.window.location = routeLink;
      } else {
        this.router.navigateByUrl(routeLink);
      }
    };
  }
  /**
   * Handles routeLinks
   */
  HandleRouter(callback) {
    AlertService.showOptions(
      'Save changes to the untitled circuit? Your changes will be lost if you do not save it.',
      () => {
        AlertService.showCustom(
          SaveProjectDialogComponent,
          {
            onChangeProjectTitle: (e) => {
              this.projectTitle = e.target.value || '';
              return this.projectTitle;
            },
            projectTitle: this.projectTitle,
          },
          (value) => {
            if (value) {
              this.SaveProjectOff(() => {
                callback();
              });
            }
          }
        );
      },
      () => {
        callback();
      },
      () => { },
      'Save',
      'Don\'t save',
      'Cancel'
    );
  }
  /**
   * Open Gallery Project
   * @param index Gallery item index
   * @param id Component Id
   */
  OpenGallery(index: string, id: any) {
    // Show Loading animation
    window['showLoading']();
    // Get Position
    const i = parseInt(index, 10);
    // if it is a valid number then proceed
    if (!isNaN(i)) {
      // Fetch all samples
      this.api.fetchSingleProjectToGallery(id).subscribe((out: any) => {
        if (out) {
          // set project title
          this.projectTitle = out.name;
          this.title.setTitle(this.projectTitle + ' | Arduino On Cloud');
          // Set project description
          this.description = out.description;
          // Load the project
          Workspace.Load(JSON.parse(out.data_dump));
        } else {
          AlertService.showAlert('No Item Found');
        }
        window['hideLoading']();
      }, err => {
        console.log(err);
        AlertService.showAlert('Failed to load From gallery!');
        window['hideLoading']();
      });
    } else {
      window['hideLoading']();
    }
  }

  // Export to a JSON File
  exportJson() {

    // Check if workspace is empty or not
    if (Workspace.checkIfWorkspaceEmpty()) {
      AlertService.showAlert('You have nothing to save!'); // Throw Alert if Workspace is empty
    } else {
      // Open File rename dialog
      const viewref = this.dialog.open(ExportJSONDialogComponent, {
        width: '600px',
        data: { description: this.description, title: this.projectTitle }
      });
      viewref.afterClosed();
    }
  }

  // Import from jSON file
  importJson(file) {
    // Read File
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (event: Event) => {
      const data = fileReader.result;
      // Load the data object and change into workspace
      this.LoadProject(JSON.parse(data as string));
    };
  }

  // Function to Exit Project & go back to mainScreen
  exitProject() {
    if (Workspace.checkIfWorkspaceEmpty()) {
      this.router.navigate(['/']);
    } else {
      this.dialog.open(ExitConfirmDialogComponent).afterClosed().subscribe(res => {
        if (res) {
          this.router.navigate(['/']);
        }
      });
    }
  }

  /**
   * Function to enable/disable undo/redo button depending upon undostack
   * @param type button type
   * @returns boolean
   */
  enableButton(type) {
    if (!UndoUtils.enableButtonsBool) {
      return true;
    }
    if (type === 'undo') {
      return UndoUtils.undo.length <= 0;
    } else if (type === 'redo') {
      return UndoUtils.redo.length <= 0;
    }
  }

  /**
   * Undo Operation
   */
  undoChange() {
    UndoUtils.workspaceUndo();
  }
  /**
   * Redo Operation
   */
  redoChange() {
    UndoUtils.workspaceRedo();
  }
  /**
   * Create a new branch for project
   * @param obj Object containing branch and version
   */
  createNewBranch(obj) {
    const branch = obj.branch;
    const versionId = obj.version;
    // Save Project and show alert
    SaveOnline.Save(this.projectTitle, this.description, this.api, branch, versionId, (out) => {
      AlertService.showAlert('Created new branch');
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        // add new query parameters
        this.router.navigate(
          ['/simulator'],
          {
            relativeTo: this.aroute,
            queryParams: {
              id: out.save_id,
              online: true,
              offline: null,
              gallery: null,
              version: versionId,
              branch
            },
            queryParamsHandling: 'merge'
          }
        );
      });
    }, this.projectId);
  }

  /**
   * Generate and return a random string
   * @param length Length of random string
   * @returns random string
   */
  getRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  /**
   * Saves the circuit and saves it as a submission for given LTI details
   */
  SaveLTISubmission() {
    const token = Login.getToken();
    this.branch = this.branch ? this.branch : 'master';
    this.version = this.getRandomString(20);
    SaveOnline.Save(this.projectTitle, this.description, this.api, this.branch, this.version, (out) => {
      this.projectId = out.save_id;
      const data = {
        schematic: this.projectId,
        ltisession: {
          id: this.ltiId,
          user_id: this.ltiUserId,
          oauth_nonce: this.ltiNonce,
        },
        student_simulation: null,
      };
      this.api.submitCircuit(token, data).subscribe(res => {
        AlertService.showAlert(res['message']);
        // add new query parameters
        this.router.navigate(
          [],
          {
            relativeTo: this.aroute,
            queryParams: {
              id: out.save_id,
              lti_id: this.ltiId,
              lti_user_id: this.ltiUserId,
              lti_nonce: this.ltiNonce,
              branch: this.branch,
              version: this.version,
              online: true,
              offline: false,
              gallery: null
            },
            queryParamsHandling: 'merge'
          });
        return;
      }, err => {
        AlertService.showAlert(err['message']);
        console.log(err);
      });
    });
  }

  /**
   * Returns date in human readable format
   * @param date Date string
   * @returns string with formatted date
   */
  getFormattedDate(date: string) {
    const dateObj = new Date(date);
    let str = `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()} `;
    str += `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
    return str;
  }
}
