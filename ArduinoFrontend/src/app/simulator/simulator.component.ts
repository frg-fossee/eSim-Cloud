import { Component, OnInit, wtfLeave } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workspace } from '../Libs/Workspace';
import { Utils } from '../Libs/Utils';
import { MatDialog, MatRadioModule } from '@angular/material';
import { ViewComponentInfoComponent } from '../view-component-info/view-component-info.component';
import { ExportfileComponent } from '../exportfile/exportfile.component';
import { ComponentlistComponent } from '../componentlist/componentlist.component';
import { ApiService } from '../api.service';
declare var Raphael;

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit {
  canvas: any;
  projectTitle = 'Untitled';
  showProperty = true;
  componentsBox = Utils.componentBox;
  components = Utils.components;
  openCodeEditor = false;
  constructor(private aroute: ActivatedRoute, public dialog: MatDialog, private api: ApiService) {
    Workspace.initializeGlobalFunctions();
  }

  makeSVGg() {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    el.setAttribute('transform', 'scale(1,1)translate(0,0)');
    return el;
  }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      // console.log(v);
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
    holder.addEventListener('keydown', Workspace.keyDown, true);
    holder.addEventListener('keypress', Workspace.keyPress, true);
    holder.addEventListener('keyup', Workspace.keyUp, true);
    holder.addEventListener('wheel', Workspace.mouseWheel, true);
    holder.addEventListener('paste', Workspace.paste, true);
    document.body.addEventListener('mousemove', Workspace.bodyMouseMove);
    document.body.addEventListener('mouseup', Workspace.bodyMouseUp);

    // Initialize Property Box
    Workspace.initProperty(v => {
      this.showProperty = v;
    });
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

  /**
   * Hide/Show (toggle) Code Editor
   * @param elem Code Editor Parent Div
   */
  toggleCodeEditor(elem: HTMLElement) {
    elem.classList.toggle('show-code-editor');
    this.openCodeEditor = !this.openCodeEditor;
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

  componentdbClick(key: string) {
    Workspace.addComponent(key, 100, 100, 0, 0);
  }

  dragStart(event: DragEvent, key: string) {
    event.dataTransfer.dropEffect = 'copyMove';
    event.dataTransfer.setData('text', key);
  }

  zoom(x: number) {
    if (x === 0) {
      Workspace.zoomIn();
    } else {
      Workspace.zoomOut();
    }
  }
  openInfo() {
    const dialogRef = this.dialog.open(ViewComponentInfoComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
    });
  }
  openDailog() {
    const exportref = this.dialog.open(ExportfileComponent);
    exportref.afterClosed().subscribe(result => {

      console.log(`Dialog result: ${result}`);
    });
  }
  openview() {
    const viewref = this.dialog.open(ComponentlistComponent);
    viewref.afterClosed().subscribe(result => {

      console.log(`Dialog result: ${result}`);
    });
  }
  delete() {
    Workspace.DeleteComponent();
    Workspace.hideContextMenu();
  }
  paste() {
    Workspace.pasteComponent();
    Workspace.hideContextMenu();
  }
  copy() {
    Workspace.copyComponent();
    Workspace.hideContextMenu();
  }
  /* exportPng() {
     const cnvas = document.getElementById('canvas') as HTMLCanvasElement;
     const img = cnvas.toDataURL("image/png");
     document.write('<img src="' + img + '"/>');
   }*/
}
