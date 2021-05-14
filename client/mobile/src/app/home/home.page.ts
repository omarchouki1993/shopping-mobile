import { NavController } from '@ionic/angular';
import { environement } from './../../models/environements';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Article } from 'src/models/article-interface';
import { Observable } from 'rxjs';

import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  articles : Article[];
  constructor(private http: HttpClient, private photoViewer: PhotoViewer, private navCtrl: NavController) {
   
    // this.loadData();
  }

  ngOnInit() {
     // on appelle la methode pour charger tous les articles
    this.loadData()
    .subscribe((data: Article[]) => {
      // on stocke les articles dans 'articles'
      this.articles = data;
      for (let i = 0; i < 5; i++) {
        // ojoute les memes éléments au tablear 'articles' pour pouvoi utiliser le 'virtual scroll'
        this.articles.push(...data);
      }
      console.log('articles', this.articles);
    })
  }

  //  Voici la methode pour charger les articles
  loadData() : Observable<Article[]> {
    let url: string = `${environement.api_url}/Articles`;
    return this.http.get<Article[]>(url);
      
  }
  // Grace à cette methode on se déplace sur la page 'create-product'
  goToCreate() {
    this.navCtrl.navigateForward('/create-product');
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

  // methode pour visionner une image avec option de partage
  showImage(imgId: string, imgTitle: string, event) {
    event.stopPropagation();
    this.photoViewer.show(`http://192.168.8.101:3000/api/Containers/photos/download/${imgId}`, 
    imgTitle, {share: true});
  }

    // Grace à cette methode on se déplace sur la page 'product-detail'
  showDetails(id: string) {
    this.navCtrl.navigateForward('/product-detail/'+id)
  }

  // on trie le tableau pour n'afficher que les articles dont le nom en miniscule
  // est égale à la valeur (en minuscule) entrée dans le champs
  onSearch(event) {
    let value: string = event.target.value;
    if(value) {
      this.articles = this.articles.filter((article) => {
        return article.title.toLowerCase().includes(value.toLowerCase());
      })
    }
  }
  onCancel(event) {
    this.loadData()
    .subscribe((data: Article[]) => {
      console.log('articles à partir de doRefresh', data);
      this.articles = data;
    })
  }
}
