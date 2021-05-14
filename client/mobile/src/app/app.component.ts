import { ProductDetailPage } from './product-detail/product-detail.page';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';

import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { categories } from 'src/models/category';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  categories : any[];
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: NativeStorage,
    private navCtrl: NavController,
    private deeplinks: Deeplinks
  ) {
    this.categories = categories;
    this.initializeApp();
  }

  initializeApp() {
    console.log('start')
    this.platform.ready().then(async () => {
      // on change la couleur de notre 'statusBar'
      this.statusBar.backgroundColorByHexString('#0bb8cc');
      // on réagit à l'url de notre application
      this.deeplinks.routeWithNavController(this.navCtrl, {
        'product-detail/:id': ProductDetailPage
      }).subscribe(match => {
          // match.$route - the route we matched, which is the matched entry from the arguments to route()
          // match.$args - the args passed in the link
          // match.$link - the full link data
          console.log('Successfully matched route', match);
          this.navCtrl.navigateRoot(match.$link.path);
        }, nomatch => {
          // nomatch.$link - the full link data
          console.error('Got a deeplink that didn\'t match', nomatch);
        });
       //  on recupère le contenu de la clé 'isLoggedIn' de notre local storage 
    // et on stocke ça dans la propriété loggedIn
      const loggedIn = this.storage.getItem('isLoggedIn').then( data => {
        const loggedIn = data
        if (loggedIn) {
          // si l'utilisateur s'est déjà connecté, on le déplace directement sur la page 'home'
          console.log('Déjà connecté');
          this.navCtrl.navigateRoot('/home');
        }
        this.splashScreen.hide();
      },err => {
        this.navCtrl.navigateRoot('/intro');
        this.splashScreen.hide();
      });
      
      
    });
  }
  showCategory(catTitle: string) : void {
    this.navCtrl.navigateForward('/category/'+catTitle);
    console.log('catTitle', catTitle);
  }

  goTo(route: string) : void {
    console.log('route', route);
    this.navCtrl.navigateForward(`/${route}`);
  }
}
