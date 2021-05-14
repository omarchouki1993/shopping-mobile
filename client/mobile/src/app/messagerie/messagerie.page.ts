import { NavController } from '@ionic/angular';
import { Notification } from './../../models/notification-interface';
import { environement } from 'src/models/environements';
import { Observable, forkJoin } from 'rxjs';
import { Utilisateur } from './../../models/utilisateur-interface';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Message } from 'src/models/message-interface';

@Component({
  selector: 'app-messagerie',
  templateUrl: './messagerie.page.html',
  styleUrls: ['./messagerie.page.scss'],
})
export class MessageriePage implements OnInit {
  messageType: string = 'received';
  utilisateur: Utilisateur;
  messages_received: Message[];
  messages_sent : Message[];
  notifications: Notification[];
  constructor(private http: HttpClient, private storage : NativeStorage,
      private navCtrl: NavController) { }

  async ngOnInit() {
    this.utilisateur = await this.storage.getItem('Utilisateur');
    // on appèlle la methode pour charger tous les messages et notification au meme moment
    this.loadAll()
      .subscribe(results => {
        console.log('results', results);
        this.messages_received = results[0];
        this.messages_sent = results[1];
        this.notifications = results[2];
      })
  }

  // Voici la methode pour changer de segment
  segmentChanged($event) {
    this.messageType = $event.detail.value;
  }
// Voici la methode pour charger tous les messages et notifications
  loadAll(event?) {
    if (event) {
      // si un evenement est passé en paramètre, on fait le 'pull refresh'
      forkJoin(this.loadReceived(), this.loadSent(), this.loadNotif())
      .subscribe(results => {
        console.log('results', results);
        this.messages_received = results[0];
        this.messages_sent = results[1];
        this.notifications = results[2];
        event.target.complete();
      })
    } else {
      return forkJoin(this.loadReceived(), this.loadSent(), this.loadNotif());
    }
  }

  loadReceived(event?) : Observable<Message[]> {
    let url: string = `${environement.api_url}/Utilisateurs/${this.utilisateur.id}/messages`;
    console.log('url', url);
    return this.http.get<Message[]>(url);
  }
  loadSent(event?) : Observable<Message[]> {
    let url: string = `${environement.api_url}/Messages?filter[where][title]=${this.utilisateur.username}`;
    console.log('url', url);
    return this.http.get<Message[]>(url);
  }
  loadNotif(event?) : Observable<Notification[]> {
    let url: string = `${environement.api_url}/Utilisateurs/${this.utilisateur.id}/notifications`;
    console.log('url', url);
    return this.http.get<Notification[]>(url);
  }
//  grace à cette methode, on se déplace sur la page 'action-message' pour écrire un message
  messageWrite(message: Message, i) {
    this.navCtrl.navigateForward(`/action-message/${message.id}/write/${'1000'}`);
  }
  //  grace à cette methode, on se déplace sur la page 'action-message' pour lire un message
  messageView(message: Message, i) {
    this.navCtrl.navigateForward(`/action-message/${message.id}/read/${'1000'}`);
  }


}
