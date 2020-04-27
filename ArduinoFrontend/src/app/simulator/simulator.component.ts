import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workspace } from '../Libs/Workspace';

declare var Raphael;

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit {
  canvas: any;

  constructor(private aroute: ActivatedRoute) {
    // Stores all the Circuit Information
    window['scope'] = {
    };
    // True when simulation takes place
    window['isSimulating'] = false;
    // Stores the reference to the selected circuit component
    window['selected'] = null;
    // True when a component is selected
    window['isSelected'] = false;
    // Global Function to Show Properties of Circuit Component
    window['showProperties'] = () => {

    };
    // Global Function to Hide Properties of Circuit Component
    window['hideProperties'] = () => {

    };
    // Global Function to show Popup Bubble
    window['showBubble'] = (label: string, x: number, y: number) => {

    };
    // Global Function to hide Popub Bubble
    window['hideBubble'] = () => {

    };
    // Global Function to show Toast Message
    window['showToast'] = (message: string) => {

    };
  }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      console.log(v);
    });

    this.canvas = Raphael('holder', '100%', '100%');
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
  }

  Collapse(block: HTMLElement) {
    const collapsedDivs = Array.from(document.getElementsByClassName('show-div'));

    for (const item of collapsedDivs) {
      if (block !== item) {
        item.classList.remove('show-div');
      }
    }

    block.classList.toggle('show-div');
  }

}
