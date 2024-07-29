// src/app/modules/instructors.ts
import { ICourse } from './course';

export interface IInstructor {
  id?: string;
  InstructorImg?: string | null;
  Name: string;
  Position: string;
  Bio: string;
  Email: string;
  Twitter?: string;
  LinkedIn?: string;
  YouTube?: string;
  Github?: string;
  Skill1?: string;
  Skill2?: string;
  Skill3?: string;
  Skill4?: string;
  Company1: string;
  Company2: string;
  Company3: string;
  Company4: string;
  Courses?: ICourse[];
}
