import { CircuitElement } from '../CircuitElement';
import { BreadBoard } from '../General';
import { Point } from '../Point';

/**
 * 7447 Decoder IC class
 */
export class 74LS47 extends CircuitElement {
    /**
     * Pin Name mapped to Pins
     */
    pinNamedMap: any = {};
    /**
     * Previous values of the pins.
     */
    prevValues: any = {
        A: 0,
        B: 0,
        C: 0,
        D: 0
    };
    /**
     * boolean to store LT value
     */
     LT_bar = false;
    /**
     * boolean to store RBO value
     */
    RBO_bar = false;
    /**
     * boolean for RBI
     */
    RBI_bar= false;
    /**
     * boolean for GND
     */
    GND = false;

    /**
     * 74LS47 decoder constructor
     * @param canvas Raphael Canvas (Paper)
     * @param x  position x
     * @param y  position y
     */
    constructor(public canvas: any, x: number, y: number) {
        super('74LS47', x, y, '7447 IC.json', canvas);
    }
    /**
     * Initialize 74LS47 decoder  class.
     */
    init() {
        // Add all nodes to pinNamedMap
        for (const node of this.nodes) {
            this.pinNamedMap[node.label] = node;
        }
        // Add value listner to VCC pin
        this.pinNamedMap['VCC'].addValueListener(v => {
            this.pinNamedMap['GND'].setValue(v, this.pinNamedMap['GND']);
            this.update();
        });
        // Add value listner to A pin
        this.pinNamedMap['A'].addValueListener(v => {
            if (v !== this.prevValues.A) {
                this.prevValues.A = v;
                this.update();
            }
        });
        // Add value listner to B pin
        this.pinNamedMap["B"].addValueListener(v => {
            if (v !== this.prevValues.B) {
                this.prevValues.B = v;
                this.update();
            }
        });
        // Add value listner to C pin
        this.pinNamedMap['C'].addValueListener(v => {
            if (v !== this.prevValues.C) {
                this.prevValues.C = v;
                this.update();
            }
        });
        // Add value listner to LT_bar pin
        this.pinNamedMap['LT_bar'].addValueListener(v => {
            if (v > 0) {
                this.LT = true;
            } else {
                this.LT = false;
            }
        });
        // Add value listner to RBO_bar pin
        this.pinNamedMap['RBO_bar'].addValueListener(v => {
            if (v > 0) {
                this.RBO = true;
            } else {
                this.RBO = false;
            }
        });
        // Add value listner to RBI_bar pin
        this.pinNamedMap['RBI_bar'].addValueListener(v => {
            if (v > 0) {
                this.RBI = true;
            } else {
                this.RBI = false;
            }
        });
    }
    /**
     * Simulation Logic For 7447 Decoder IC
     */
    update() {
        // If LT is LOW & RBo_bar is HIGH
        if (this.LT_bar && !this.RBO_bar) {
                  // TODO: set value of pins 'a'to 'g' to one
                this.pinNamedMap['a'].setValue(1,this.pinNamedMap['a']);
                this.pinNamedMap['b'].setValue(1,this.pinNamedMap['b']);
                this.pinNamedMap['c'].setValue(1,this.pinNamedMap['c']);
                this.pinNamedMap['d'].setValue(1,this.pinNamedMap['d']);
                this.pinNamedMap['e'].setValue(1,this.pinNamedMap['e']);
                this.pinNamedMap['f'].setValue(1,this.pinNamedMap['f']);
                this.pinNamedMap['g'].setValue(1,this.pinNamedMap['g']);
            }
            //If LT is HIGH & RBO_bar is HIGH
            else if(!this.LT_bar && this.RBO_bar){
                //output a
                this.pinNamedMap['a'].setValue((!this.pinNamedMap['B'] * !this.pinNamedMap['D']) + (this.pinNamedMap['B'] * this.pinNamedMap['D']) + (this.pinNamedMap['C'] * this.pinNamedMap['D']) + this.pinNamedMap['A'],this.pinNamedMap['a']);
                //output b
                this.pinNamedMap['b'].setValue((!this.pinNamedMap['C'] * !this.pinNamedMap['D']) + (!this.pinNamedMap['B']) + (this.pinNamedMap['C'] + this.pinNamedMap['D']));
                // output c
                this.pinNamedMap['c'].setValue(this.pinNamedMap['B'] + !this.pinNamedMap['C'] + this.pinNamedMap['D']);
                //output d
                this.pinNamedMap['d'].setValue((!this.pinNamedMap['B'] * !this.pinNamedMap['D']) + (!this.pinNamedMap['B'] * (this.pinNamedMap['C']) + (this.pinNamedMap['C'] * !this.pinNamedMap['D']) + (this.pinNamedMap['B'] * !this.pinNamedMap['C'] + this.pinNamedMap['D']));
                //output e
                this.pinNamedMap['e'].setValue((!this.pinNamedMap['B'] * !this.pinNamedMap['D']) + (this.pinNamedMap['C'] * !this.pinNamedMap['D']));
                //output f
                this.pinNamedMap['f'].setValue(this.pinNamedMap['a'] +(!this.pinNamedMap['C'] * !this.pinNamedMap['D']) + (this.pinNamedMap['B'] * (!this.pinNamedMap['C']) + (this.pinNamedMap['B'] * !this.pinNamedMap['D'])));
                //output g
                this.pinNamedMap['g'].setValue((this.pinNamedMap['C'] * !this.pinNamedMap['D']) + (this.pinNamedMap['B'] * (!this.pinNamedMap['C']) + (!this.pinNamedMap['B'] * (this.pinNamedMap['C']) + this.pinNamedMap['a'])));
            }

            else {
                // TODO: set value of pins 'a'to 'g' to zero
                this.pinNamedMap['a'].setValue(0,this.pinNamedMap['a']);
                this.pinNamedMap['b'].setValue(0,this.pinNamedMap['b']);
                this.pinNamedMap['c'].setValue(0,this.pinNamedMap['c']);
                this.pinNamedMap['d'].setValue(0,this.pinNamedMap['d']);
                this.pinNamedMap['e'].setValue(0,this.pinNamedMap['e']);
                this.pinNamedMap['f'].setValue(0,this.pinNamedMap['f']);
                this.pinNamedMap['g'].setValue(0,this.pinNamedMap['g']);
            }

    }
    /**
     * Function provides component details
     * @param keyName Unique Class name
     * @param id Component id
     * @param body body of property box
     * @param title Component title
     */
    properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
        const body = document.createElement('div');
        return {
            keyName: this.keyName,
            id: this.id,
            body,
            title: 'Decoder IC (74LS47)'
        };
    }
    /**
     * Called on Start Simulation
     */
    initSimulation(): void {         

        // run simulation
        this.update();

    }
    /**
     * Called on Stop Simulation
     */
    closeSimulation(): void {
        this.pinNamedMap['A'].value = 0;
        this.pinNamedMap['B'].value = 0;
        this.pinNamedMap['C'].value = 0;
        this.pinNamedMap['D'].value = 0;
        this.prevValues = {
            A: 0,
            B: 0,
            C: 0,
            D: 0
        };
        this.LT_bar = false;
        this.RBI_bar= false;
        this.RBO_bar = false;
        this.GND = false;
    }
}


