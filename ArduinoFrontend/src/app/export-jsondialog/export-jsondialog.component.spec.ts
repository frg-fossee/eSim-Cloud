import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportJSONDialogComponent } from './export-jsondialog.component';

describe('ExportJSONDialogComponent', () => {
  let component: ExportJSONDialogComponent;
  let fixture: ComponentFixture<ExportJSONDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportJSONDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportJSONDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
