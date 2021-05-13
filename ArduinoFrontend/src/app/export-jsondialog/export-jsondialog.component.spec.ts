import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatFormFieldModule, MAT_DIALOG_DATA } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { Workspace } from '../Libs/Workspace';
import { ExportJSONDialogComponent } from './export-jsondialog.component';

describe('ExportJSONDialogComponent', () => {

    let component: ExportJSONDialogComponent;
    let fixture: ComponentFixture<ExportJSONDialogComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
            ],
            declarations: [
                ExportJSONDialogComponent
            ],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: { description: 'this is a desc', title: 'title' } },
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportJSONDialogComponent);
        component = fixture.componentInstance;
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('Value of fileName variable should be given string', () => {
        expect(component.fileName).toBe('title');
    });

    it('Value of Description variable should be given string', () => {
        expect(component.description).toBe('this is a desc');
    });

    it('should return truthy as workspace is empty', () => {
        expect(Workspace.checkIfWorkspaceEmpty()).toBeTruthy();
    });

    it('should return falsey as workspace is not empty', () => {
        component.ngOnInit();
        window['scope'] = {
            id: 1620892078891,
            canvas: { x: 0, y: 0, scale: 1 },
            project: {
                name: 'Untitled',
                description: '',
                created_at: 1620892078891
            },
            Resistor: [{ x: 483, y: 209, tx: 68, ty: 100, id: 1620892071196, data: { value: 1000, tolerance: 10 } }]
        };
        expect(Workspace.checkIfWorkspaceEmpty()).toBeFalsy();
    });

    it('should return truthy after downloading json file', () => {
        expect(Workspace.SaveJson()).toBeTruthy();
    });
});
