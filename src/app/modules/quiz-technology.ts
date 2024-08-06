export interface IQuizTechnology {
    id: string;
    name: string;
    logo: string;
    startDate: Date;
    endDate: Date;
    totalMarks: number;
    numberOfQuestions: number;
    isPrivate: boolean;
    isActive: boolean;
}