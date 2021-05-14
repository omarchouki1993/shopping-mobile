import { NavController } from '@ionic/angular';
import { environement } from './../../models/environements';
import { HttpClient } from '@angular/common/http';
import { Utilisateur } from './../../models/utilisateur-interface';
import { Component, OnInit } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {
utilisateur = {} as Utilisateur;
  constructor( private fb: Facebook, private storage : NativeStorage, private http: HttpClient,
      private navCtrl: NavController) { }

  ngOnInit() {
    console.log('intro')
  }

  //  Grace a cette methode on va pouvoir se connecter en passant par facebook
  loginWithFacebook() : void {
    this.fb.login(['public_profile', 'user_friends', 'email'])
      .then((res: FacebookLoginResponse) => {
        console.log('Logged into Facebook!', res);
        this.fb.api('me?fields=email', [])
          .then(async profil => {
            let email: string = profil['email'];
            // on crée l'objet 'utilisateur'
            this.utilisateur = {
              contact : email,
              type: 'email',
              avatar: "",
              username: ""
            }
            await this.storage.setItem('isLoggedIn', true);
            // stocker utilisateur dans MongoDB
            let url : string = `${environement.api_url}/Utilisateurs`;
            this.http.post(url, this.utilisateur)
            .subscribe(async user => {
              await this.storage.setItem('Utilisateur', user);
                  // naviguer vers la page d'acceuil
                  this.navCtrl.navigateRoot('/home');
                })
          })
      })
      .catch(e => console.log('Error logging into Facebook', e));
      }
  
      //  Grace a cette methode on va pouvoir se connecter en passant par notre numéro de téléphone
  loginWithPhone() {
    console.log('btn clicked');
    (<any>window).AccountKitPlugin.loginWithPhoneNumber(
      {
        useAccessToken: true,
        defaultCountryCode: "US",
        facebookNotificationsEnabled: true
      }, (success) => {
          console.log('success', success);
          (<any>window).AccountKitPlugin.getAccount(
            async account => {
              console.log('account', account);
              // on crée l'objet 'utilisateur'
              this.utilisateur = {
                contact : account.phoneNumber,
                type: 'phone',
                avatar: "",
                username: ""
              }
              await this.storage.setItem('isLoggedIn', true);
              // stocker utilisateur dans MongoDB
              let url : string = `${environement.api_url}/Utilisateurs`;
              this.http.post(url, this.utilisateur)
              .subscribe(async user => {
                await this.storage.setItem('Utilisateur', user);
                // naviguer vers la page d'acceuil
                    console.log('user', user);
                    this.navCtrl.navigateRoot('/home');
                  })
            }, (fail => {
              console.log('fail', fail)
            }))
      }, (error => {
          console.log('error', error);
      }))
  }

}
