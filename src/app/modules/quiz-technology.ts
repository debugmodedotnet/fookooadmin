export interface IQuizTechnology {
    id: string;
    Name: string;
    logo: string;
    StartDate: Date;
    EndDate: Date;
    TotalMarks: number;
    numberOfQuestions: number;
    isPrivate: boolean;
    isActive: boolean;
}