import { Availability } from './../../models/article-interface';
import { ToastController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from 'src/models/article-interface';
import { environement } from 'src/models/environements';
import { categories } from 'src/models/category';
import { cities } from 'src/models/cities';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
})
export class EditProductPage implements OnInit {
article = {} as Article;
categories: any[];
cities : any[];
  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient, 
    private toastCtrl: ToastController, private navCtrl: NavController) {
      this.categories = categories;
      this.cities = cities;
     }

  ngOnInit() {
    this.article.availability = {} as Availability;
    // on récupère le paramètre 'id' qui est l'id de l'article à modifier
    const id: string = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('id');
    // on lance la requette pour récuperer l'article correspondant à cette 'id'
    this.loadData(id)
      .subscribe(data => {
        // on stocke cette article dans la propriété 'article'
        this.article = data;
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

  // Voici la methode pour charger l'article
  loadData(id: string) : Observable<Article> {
    let url: string = `${environement.api_url}/Articles/${id}`;
    return this.http.get<Article>(url);
  }
  
  // Voici la methode pour mettre à jour (modifier) un article
  update() {
    console.log('article', this.article);
    const id: string = this.article.utilisateurId;
    const articleId: string = this.article.id;
    let url: string = `${environement.api_url}/Utilisateurs/${id}/articles/${articleId}`;
    this.http.put(url, this.article)
      .subscribe(result => {
        this.presentToast('Mise à jour réussie !', 2000);
        this.navCtrl.navigateBack('/profile');
      }, error => {
        this.presentToast('Echec de la mise à jour !', 2000);
        console.log('echec', error);
      })
  }
}
