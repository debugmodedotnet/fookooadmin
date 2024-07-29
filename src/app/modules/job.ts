export interface Job {
  id?: string;  
  CompanyName: string;
  CompanyUrl: string;
  JobDescription: string;
  Responsibilities: string[];
  Qualification: string[];
  SkillsRequired: string;
  Location: string;
  Remote: boolean;
  CompanyTwitter?: string;
  CompanyLinkedIn?: string;
  CompanyGithub?: string;
  Position: string;
  Email?: string;
  PhoneNo?: string;
  Tag?: string;
  ImageUrl: string;
  userId?: string; // ID of the user who created the job
  Private?: boolean;
}

