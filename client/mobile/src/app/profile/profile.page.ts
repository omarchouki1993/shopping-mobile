import { HttpClient } from '@angular/common/http';
import { NavController, ActionSheetController, ToastController, LoadingController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { Utilisateur } from './../../models/utilisateur-interface';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Component, OnInit } from '@angular/core';
import { FileTransferObject, FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { environement } from 'src/models/environements';
import { Observable } from 'rxjs';
import { Article } from 'src/models/article-interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
profileType: string = "Profil";
utilisateur = {} as Utilisateur;
imgUploaded: boolean = false;
articles : Article[];
  constructor(private storage: NativeStorage, private imagePicker: ImagePicker, private camera: Camera,
    private navCtrl: NavController, private actionSheet: ActionSheetController,
    private transfer: FileTransfer, private http: HttpClient, private toastCtrl: ToastController,
    private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    //  on recupère le contenu de la clé 'Utilisateur' de notre local storage 
    // et on stocke ça dans la propriété utilisateur
    this.utilisateur = await this.storage.getItem('Utilisateur');
    console.log('utilisateur storage', this.utilisateur);
    if (this.utilisateur.avatar === "") {
      // si notre utilisateur n'a pas d'avatar pour le moment, son avatar sera :
      this.utilisateur.avatar = 'https://ionicframework.com/docs/demos/api/avatar/avatar.svg';
    }
    this.loadData()
      .subscribe(articles => {
        console.log('articles', articles);
        this.articles = articles;
      })
  }

  updateArticle(article: Article, i: number) {
    console.log(article, i);
    this.navCtrl.navigateForward('/edit-product/' + article.id);
  }

  async deleteArticle(article: Article, i: number) {
    // afficher un loading Controller
    let loading = await this.loadingCtrl.create({
      message: 'Suppression en cours'
    });
    loading.present();
    console.log(i);
    // Supprimer toutes les images de l'article
    for (let i = 0; i < article.pictures.length; i++) {
      const fileId: string = article.pictures[i];
      let url: string = `${environement.api_url}/Containers/photos/files/${fileId}`;
      this.http.delete(url)
        .subscribe(deleted => {
          console.log('image deleted', deleted);
        })
    }
    // Supprimer l'article en lui meme
    const id: string = this.utilisateur.id;
    const articleId: string = article.id;
    let url: string = `${environement.api_url}/Utilisateurs/${id}/articles/${articleId}`;
    this.http.delete(url)
      .subscribe(result => {
        console.log('article supprimé', result);
        loading.dismiss();
        this.presentToast('Article supprimé', 2000);
      }, error => {
        console.log('echec de suppression', error);
        loading.dismiss();
      })
  }

  //  on affiche un message toast grace à cette methode
  async presentToast(message: string, duration: number) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration
    });
    toast.present();
  }

  // Voici la methode pour changer de segment
  segmentChanged($event) {
    console.log('event', $event);
    this.profileType = $event.detail.value;
  }

   //  Voici la methode pour charger les articles appartenant à notre utilisateur
  loadData() : Observable<Article[]> {
    const id: string = this.utilisateur.id;
    let url: string = `${environement.api_url}/Utilisateurs/${id}/articles`;
    return this.http.get<Article[]>(url);
      
  }

  //  Voici la methode pour utiliser le pull refresh
  doRefresh($event) {
    this.loadData()
    .subscribe((data: Article[]) => {
      console.log('articles à partir de doRefresh', data);
      this.articles = data;
        $event.target.complete();
    })
  }
// Grace à cette methode, on va pouvoir uploader l'avatar de l'utilisateur
  async uploadImages(image: string) {
    // on stocke le nom de l'image dans la variable 'elementName'
        let elementName: string = image.substr(image.lastIndexOf('/')+1);
        console.log('elementName', elementName);
        // on initialise l'objet 'fileTransfer'
        let fileTransfer: FileTransferObject = this.transfer.create();
        const url: string = `${environement.api_url}/Containers/photos/upload`;
        console.log('url',url);
        // on détermine les options d'upload de fichiers
        let options: FileUploadOptions = {
          fileKey: 'Shopping',
          fileName: elementName,
          chunkedMode: false,
          mimeType: 'image/jpeg',
          headers: {}
        }
        if (!this.imgUploaded) {
          let data = await fileTransfer.upload(image, url, options);
          let id: string = JSON.parse(data.response)._id;
          console.log('id', id);
          // this.utilisateur.avatar = id;
          this.imgUploaded = true;
          return id;
        }
  }

// Grace à cette methode, on va mette à jour le profil de l'utilisateur
  async updateProfile() {
    console.log('utilisateur', this.utilisateur);
    let flag : string = await this.uploadImages(this.utilisateur.avatar);
    if (flag) {
      this.utilisateur.avatar = flag;
      const url: string = `${environement.api_url}/Utilisateurs/${this.utilisateur.id}`;
      this.http.put(url, this.utilisateur)
        .subscribe(async result => {
          // Afficher un message toast
          console.log('result', result);
         await this.storage.setItem("Utilisateur", result);
          this.presentToast('Mise à jour réussie !', 2000);
        }, error => {
          console.log('echec', error);
          this.presentToast('Echec de la mise à jour !', 2000);
        })
    }
  }

   // Grace à cette methode on selectionne les images à partir de la galerie
  async galerie(imageNum: number) {
    let options: ImagePickerOptions = {
      maximumImagesCount: imageNum,
      outputType: 0,
      quality: 100,
    }
    return this.imagePicker.getPictures(options);
  }
  // Grace à cette methode on peut prendre en photo
  async getCam() {
    let options: CameraOptions = {
      sourceType: 1,
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 100,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    return this.camera.getPicture(options);
  }

   //  Grace à cette methode on peut afficher un action sheet avec 3 boutons pour soit:
  /* 1. Selectionner à partir de la Galerie
  2. Prendre en Photo
  3. Annuler */
  async action() {
    const actionSheet = await this.actionSheet.create({
      header: 'Sélectionner la source',
      buttons: [
        {
          text: 'Galerie',
          icon: 'images',
          handler: async ()=> {
            console.log('Galerie');
            let pictures: string[] = await this.galerie(1);
              for (let i = 0; i < pictures.length; i++) {
                const element = pictures[i];
                console.log('element de pictures', element);
                this.utilisateur.avatar = element;
              }
          }
        },
        {
          text: 'Camera',
          icon: 'camera',
          handler: ()=> {
            console.log('Camera');
            this.getCam().then(image => {
              console.log('image', image);
              this.utilisateur.avatar = image;
            })
          }
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

}