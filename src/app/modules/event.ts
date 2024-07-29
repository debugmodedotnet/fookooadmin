import { IEventAgenda } from "./event-agenda";
import { IEventSpeakers } from "./event-speakers";

export interface IEvent {
  id?: string;
  Id: string;
  Title: string;
  City: string;
  isOffline: boolean;
  isCertificateProvided: boolean;
  isPaid: boolean;
  EventImage: string;
  Tech: string;
  Date: Date;
  Logo: string;
  ShortDescription: string;
  Description?: string;
  displayAtHomePage: boolean;
  TotalSeats: number;
  RegisteredSeats: number;
  VenueName: string;
  VenueInfo: string;
  VenueImg: string;
  Tagline: string;
  VenueIframe: string;
  Speakers?: IEventSpeakers[];
  Agenda?: IEventAgenda[];
}


