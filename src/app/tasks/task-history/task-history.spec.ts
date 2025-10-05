import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskHistory } from './task-history';

describe('TaskHistory', () => {
  let component: TaskHistory;
  let fixture: ComponentFixture<TaskHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
