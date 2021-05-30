import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveProjectDialogComponent } from './save-project-dialog.component';

describe('SaveProjectDialogComponent', () => {
  let component: SaveProjectDialogComponent;
  let fixture: ComponentFixture<SaveProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveProjectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
