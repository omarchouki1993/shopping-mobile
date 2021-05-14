import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ToastController, NavController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Article } from 'src/models/article-interface';
import { environement } from 'src/models/environements';
import { itemCart } from 'src/models/itemCart-interface';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
article : Article;
rate: any;
slidesOpt = {
  speed: 1000,
  autoplay: {
    delay: 500
  }
}
  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient,
      private photoViewer : PhotoViewer, private storage: NativeStorage,
      private toastCtrl: ToastController, private navCtlr: NavController,
      private sharing: SocialSharing) { }

  ngOnInit() {
    // on récupère le paramètre 'id' qui est l'id de l'article à afficher
    const id: string = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('id', id);
    // on lance la requette pour récuperer l'article correspondant à cette 'id'
    this.loadData(id)
      .subscribe(data => {
        // on stocke cette article dans la propriété 'article'
        this.article = data;
      })
  }
  //  Methode pour partager un article via les reseaux sociaux
  async share() {
    try {
      await this.sharing.share(
        this.article.title,
        null,
        null,
        `https://example.com/product-detail/${this.article.id}`
      );
      console.log('partage réussi !');
    } catch(e) {
      console.log("error", e);
    }
  }

  onModelChange($event) {
    console.log('event', $event);
  }

  // Voici la methode pour charger l'article
  loadData(id: string) : Observable<Article> {
    let url: string = `${environement.api_url}/Articles/${id}`;
    return this.http.get<Article>(url);
      
  }
   // methode pour visionner une image avec option de partage
  showImage(imgId: string, imgTitle: string) {
    this.photoViewer.show(`http://192.168.8.101:3000/api/Containers/photos/download/${imgId}`, 
    imgTitle, {share: true});
  }

  // Voici la methode pour laisser une note à un article
  leaveNote() : void {
    console.log('rate', this.rate);
    // on stocke la moyenne dans 'average'
    let average: number = (this.article.averageStar + this.rate)/2;
    // on arrondi 'average' et on stocke le résultat dans 'aroundi'
    let aroundi : number = Math.ceil(average);
    let utilisateurId: string = this.article.utilisateurId;
    let articleId: string = this.article.id;
    let url: string = `${environement.api_url}/Utilisateurs/${utilisateurId}/Articles/${articleId}`;
    console.log('url', url);
    this.http.put(url, {"averageStar": aroundi})
      .subscribe(res => {
        this.presentToast('Votre note a réussi !', 2000);
      })
  }
//  grace à cette methode, on se déplace sur la page 'cart' 
  openCart() {
    this.navCtlr.navigateForward('/cart');
  }

  // methode pour ajouter un article au panier
  async addToCart(item: Article) {
    try {
      let data: itemCart[];
      let added: boolean = false;
    data = await this.storage.getItem("Cart");
    console.log("data", data);
    // on vérifie si le panier est vide
    if (data === null || data.length === 0) {
      data.push({
        item: item,
        qty: 1,
        amount: item.price
      });
    }
    // Si le panier n'est pas vide
    else {
      for (let i = 0; i < data.length; i++) {
        const element: itemCart = data[i];
        if (item.id === element.item.id) {
          // le panier contient déjà cette article
          element.qty += 1;
          element.amount += item.price;
          added = true;
        }
      }
    }
    if (!added) {
      // le panier n'est pas vide et ne contient pas l'article
      data.push({
        item: item,
        qty: 1,
        amount: item.price
      });
    }
      await this.storage.setItem("Cart", data);
      this.presentToast('Votre panier a été mis à jour', 1500);
    }
    catch(e){
      let myData: itemCart[] = [];
      console.log("error", e);
      if (e.code === 2) {
        myData.push({
          item: item,
        qty: 1,
        amount: item.price
      });
      await this.storage.setItem("Cart", myData);
        this.presentToast('Votre panier a été mis à jour', 1500);
      }
    }
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
