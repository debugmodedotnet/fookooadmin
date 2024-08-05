import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostQuizComponent } from './post-quiz.component';

describe('PostQuizComponent', () => {
  let component: PostQuizComponent;
  let fixture: ComponentFixture<PostQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
