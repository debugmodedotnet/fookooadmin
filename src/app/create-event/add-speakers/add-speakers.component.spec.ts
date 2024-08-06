import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpeakersComponent } from './add-speakers.component';

describe('AddSpeakersComponent', () => {
  let component: AddSpeakersComponent;
  let fixture: ComponentFixture<AddSpeakersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSpeakersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSpeakersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
