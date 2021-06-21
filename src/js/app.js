import { settings, select, classNames, templates } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";

const app = {
  initMenu() {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + "/" + settings.db.products;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log("parseResponse", parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });
  },

  init: function () {
    const thisApp = this;
    console.log("*** App starting ***");
    console.log("thisApp:", thisApp);
    console.log("classNames:", classNames);
    console.log("settings:", settings);
    console.log("templates:", templates);
    thisApp.initData();
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener("add-to-cart", function (e) {
      app.cart.add(e.detail.product);
    });
  },
};

app.init();
app.initCart();
