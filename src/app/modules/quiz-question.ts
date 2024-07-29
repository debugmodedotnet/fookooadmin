interface IQuizQuestionOption {
    id: string;
    value: string;
}

export interface IQuizQuestion {
    id: string;
    question: string;
    options: IQuizQuestionOption[];
}