import { NavController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Component, OnInit } from '@angular/core';
import { itemCart } from 'src/models/itemCart-interface';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
cartItems: itemCart[];
total: number = 0;
  constructor(private storage: NativeStorage, private navCtrl: NavController) { }

  async ngOnInit() {
    // on récupère le contenu de la clé 'Cart' de notre Native Storage
    // Et on le stock dans la propriété 'cartItems' et qui est un tableau.
    this.cartItems = await this.storage.getItem("Cart");
    // on parcours ce tableau afin de mettre 'zéro' comme frais de livraison
    // de tous les articles qui sont disponibles en magasin.
    this.cartItems.forEach((element: itemCart) => {
      if (element.item.availability.type === "En Magasin") {
        element.item.availability.feed = 0;
      }
      // on calcul le prix total de ctous les articles présent dans le panier
      this.total += element.item.availability.feed + (element.amount * element.qty);
    })
  }

  //  cette methode nous permettra de supprimer un article du panier
  async remove(index: number, item: itemCart) {
    const myTotal: number = (item.qty*item.amount)+item.item.availability.feed;
    // on retire l'article du tableau 'cartItems'
    this.cartItems.splice(index, 1);
    // Ensuite on met à jour la clé 'Cart' de notre Native Storage avec le nouveau tableau
    await this.storage.setItem("Cart", this.cartItems);
    // on recalcule le total
    this.total -= myTotal;
  }
  // cette methode nous permettra de nous déplacer sur la page 'messagerie' pour contacte un vendeur
  contact(item: itemCart) {
    this.navCtrl.navigateForward(`/action-message/${'1000'}/write/${item.item.utilisateurId}`);
  }
}
