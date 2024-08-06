import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewQuizComponent } from './add-new-quiz.component';

describe('AddNewQuizComponent', () => {
  let component: AddNewQuizComponent;
  let fixture: ComponentFixture<AddNewQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
