export interface IPrevEvents {
    id?: string;
    Date: Date;
    Day: number;
    Delegates: number;
    Description: string;
    Location: string;
    PhotosLink: string;
    Speakers: number;
    SummaryVideoId: string;
    SummaryImg: string;
    Talks: number;
    Title: string;
    VideosLink: string;
    Year: number;
    SpeakersCollection?: ISpeaker[];
    SponsorsCollection?: ISponsor[];
}

export interface ISpeaker {
    Image: string;
    LinkedIn: string;
    Twitter: string;
    Github: string;
}

export interface ISponsor {
    Image: string;
    Link: string;
}