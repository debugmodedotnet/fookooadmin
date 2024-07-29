import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IYoutubeVideos } from '../modules/home-youtube';

@Injectable({
  providedIn: 'root'
})
export class YoutubeVideoService {

  constructor(private firestore: AngularFirestore) { }

  getVideos(): Observable<IYoutubeVideos[]> {
    return this.firestore.collection<IYoutubeVideos>('youtube-videos').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IYoutubeVideos;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addVideo(video: IYoutubeVideos) {
    console.log('Adding video:', video);
    return this.firestore.collection('youtube-videos').add(video);
  }

  updateVideo(id: string, video: IYoutubeVideos) {
    return this.firestore.doc(`youtube-videos/${id}`).update(video);
  }

  deleteVideo(id: string) {
    return this.firestore.doc(`youtube-videos/${id}`).delete();
  }

}
