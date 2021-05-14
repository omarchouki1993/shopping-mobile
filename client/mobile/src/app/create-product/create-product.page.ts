import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Utilisateur } from './../../models/utilisateur-interface';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpClient } from '@angular/common/http';
import { environement } from 'src/models/environements';
import { categories } from 'src/models/category';
import { Availability } from './../../models/article-interface';
import { Article } from 'src/models/article-interface';
import { Component, OnInit } from '@angular/core';
import { cities } from 'src/models/cities';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ActionSheetController, LoadingController, ToastController, NavController } from '@ionic/angular';

import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.page.html',
  styleUrls: ['./create-product.page.scss'],
})
export class CreateProductPage implements OnInit {
article : Article;
categories;
cities;
myPictures: string[] = [];
imgUploaded: boolean = false;
numImgUpload : number = 0;
utilisateur: Utilisateur;
  constructor(private actionSheet: ActionSheetController, private imagePicker: ImagePicker,
      private camera: Camera, private transfer: FileTransfer, private http: HttpClient,
      private storage: NativeStorage, private loadingCtrl: LoadingController, 
      private toastCtrl: ToastController, private navCtrl: NavController,
      private webview: WebView) { 
    this.article = {} as Article;
    this.article.availability = {} as Availability;
    this.article.pictures = [];
    this.article.averageStar = 1;
    this.article.createdAt = new Date().getTime();
    
    this.categories = categories;
    this.cities = cities;
  }

  async ngOnInit() {
    //  on recupère le contenu de la clé 'Utilisateur' de notre local storage 
    // et on stocke ça dans la propriété utilisateur
    this.utilisateur = await this.storage.getItem("Utilisateur");
    this.article.owner = this.utilisateur.username;
  }

  // Grace à cette methode, on va pouvoir uploader des images
  async uploadImages(images: string[]) {
    // on parcours le tableua d'images qui est passé en parametre
    for (let i = 0; i < images.length; i++) {
      const element: string = images[i];
      // on stocke le nom de l'image dans la variable 'elementName'
        let elementName: string = element.substr(element.lastIndexOf('/')+1);
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
          // on upload l'image et on stocke le résultat dans 'data'.
          let data = await fileTransfer.upload(element, url, options);
          // on récupère l'id de l'image qui vient d'etre uploadé
          let id: string = JSON.parse(data.response)._id;
          console.log('id', id);
          this.article.pictures.push(id);
          // on incrémente le numbre d'images uploadées de 1
          this.numImgUpload += 1;
        }
        if (this.numImgUpload === images.length) {
          // si le nombre d'images uploadées = à la longeur du tablear alors :
          this.imgUploaded = true;
        }
      }
      return true;
  }

  // Grace à cette methode, on va créer un nouveau document 'Article'.
  // On va créer un nouvel article
  async create() {
    this.article.availability.available = true;
    console.log('article', this.article);
    // Afficher un loading Controller
    let loading = await this.loadingCtrl.create({
      message: 'Chargement...'
    });
    loading.present();
    try {
      if (this.article.availability.type === 'Livraison') {
        this.article.availability.address = undefined;
      } else {
        this.article.availability.feed = 0;
      }
      // Appeler la methode 'uploadImages'
      const flag: boolean = await this.uploadImages(this.myPictures);
      const url: string = `${environement.api_url}/Utilisateurs/${this.utilisateur.id}/articles`;
      if (flag) {
        this.http.post(url, this.article, { headers: { 'Content-Type': 'application/json'}})
          .subscribe(data => {
            loading.dismiss();
            console.log('article', data);
            // Cacher le loading controller
            this.presentToast('Création réussie !', 2000);
            this.navCtrl.navigateBack('/home');
            // Afficher un message Toast et retourner à la page home
          }, error => {
            loading.dismiss();
            console.log('error', error);
            // Cacher le loading controller
            this.presentToast('Echec de création !', 2000);
            // Afficher toast
          });
      }
    }
    catch(e) {
      console.log('error', e);
      loading.dismiss();
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
            let pictures: string[] = await this.galerie(4);
              for (let i = 0; i < pictures.length; i++) {
                const element = pictures[i];
                console.log('element de pictures', element);
                let src = this.webview.convertFileSrc(element);
                this.myPictures.push(src);
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
              let src = this.webview.convertFileSrc(image);
              this.myPictures.push(src);
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

  delete(index: number) {
    this.myPictures.splice(index, 1);
  }
  
  //  on affiche un message toast grace à cette methode
  async presentToast(message: string, duration: number) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration
    });
    toast.present();
  }

}
