import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAgendaComponent } from './add-agenda.component';

describe('AddAgendaComponent', () => {
  let component: AddAgendaComponent;
  let fixture: ComponentFixture<AddAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
