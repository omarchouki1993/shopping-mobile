import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environement } from './../../models/environements';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from 'src/models/article-interface';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {
catTitle: string;
articles: Article[];
url: string;
  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient,
      private photoViewer: PhotoViewer, private navCtrl: NavController,
      private toastCtrl: ToastController) { }

  ngOnInit() {
    // on récupère le paramètre 'catTitle' qui est le titre de la catégorie
    this.catTitle = this.activatedRoute.snapshot.paramMap.get('catTitle');
    console.log('catTitle', this.catTitle);
    this.url = `${environement.api_url}/Articles?filter=%7B"where"%3A%20%7B"category"%3A"${this.catTitle}"%7D%7D`;
    console.log('url', this.url);
    // on lance la requette pour récuperer tous les articles de cette catégorie
    this.loadData(this.url)
    .subscribe((data: Article[]) => {
      console.log('articles', data);
      // on stocke les articles dans la propriétés 'articles'
      this.articles = data;
      if (data.length === 0) {
        // Et si il n'y a aucun article de cette catégorie, on affiche un message
        this.presentToast("Pas d'article pour cette categorie pour le moment", 2000);
      }
    })
  }

  // Voici la methode pour charger les articles
  loadData(url: string) : Observable<Article[]> {
    return this.http.get<Article[]>(url);
      
  }
  // la methode pour implémenter le Pull Refresh
  doRefresh($event) {
    this.loadData(this.url)
    .subscribe((data: Article[]) => {
      console.log('articles à partir de doRefresh', data);
      this.articles = data;
        $event.target.complete();
    })
  }

  // Voici la methode pour visionner une image avec option de partage
  showImage(imgId: string, imgTitle: string, event) {
    event.stopPropagation();
    this.photoViewer.show(`http://192.168.8.101:3000/api/Containers/photos/download/${imgId}`, 
    imgTitle, {share: true});
  }

  // Grace à cette methode, on se déplace sur la page 'product detail'.
  showDetails(id: string) {
    this.navCtrl.navigateForward('/product-detail/'+id)
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
