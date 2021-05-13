import { HttpClientModule } from '@angular/common/http';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatFormFieldModule, MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { type } from 'os';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { SimulatorComponent } from './simulator.component';

const monacoConfig: NgxMonacoEditorConfig = {
    baseUrl: './assets',
    defaultOptions: { scrollBeyondLastLine: false },
    onMonacoLoad
};

export function onMonacoLoad() { }

describe('SimulatorComponent', () => {

    let component: SimulatorComponent;
    let fixture: ComponentFixture<SimulatorComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatFormFieldModule,
                MatTooltipModule,
                FormsModule,
                MonacoEditorModule.forRoot(monacoConfig),
                MatDialogModule,
                HttpClientModule
            ],
            declarations: [
                SimulatorComponent,
                CodeEditorComponent,
            ]
        }).compileComponents();
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(SimulatorComponent);
        component = fixture.componentInstance;
    })

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

})
