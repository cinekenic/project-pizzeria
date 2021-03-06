import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import Home from "./components/Home.js";

export const app = {
  initHomeLinks() {
    const thisApp = this;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    thisApp.homeLinks = document.querySelectorAll(select.nav.homeLinks);
  },

  initPages() {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    thisApp.linkss = document.querySelector(".opening-hours");

    const idFromHash = window.location.hash.replace("#/", "");

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
      }
    }

    thisApp.actvatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener("click", function (e) {
        const clickedElement = this;
        e.preventDefault();

        /*get page id from href attribute */
        const id = clickedElement.getAttribute("href").replace("#", "");

        /*run actvatePage with that id */
        thisApp.actvatePage(id);
        /*change URL hash */
        window.location.hash = "#/" + id;
      });
    }
  },

  initNavLinks(links) {
    const thisApp = this;
    console.log(links);
    for (let link of links) {
      link.addEventListener("click", function (e) {
        const clickedElement = this;
        e.preventDefault();
        const id = clickedElement.getAttribute("href").replace("#", "");
        thisApp.actvatePage(id);
        // window.location.hash = "#/" + id;
      });
    }
  },

  actvatePage(pageId) {
    const thisApp = this;

    /*add class 'active' to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      // if (page.id == pageId) {
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }
      page.classList.toggle(classNames.pages.active, page.id == pageId);
      /*add class 'active' to matching links, remove from non-matching */
      for (let link of thisApp.navLinks) {
        link.classList.toggle(
          classNames.nav.active,
          link.getAttribute("href") == "#" + pageId
        );
      }
    }
  },

  initBooking() {
    const thisApp = this;
    const bookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidget);
  },

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
        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });
  },

  initHome() {
    const thisApp = this;
    const homeWidget = document.querySelector(select.containerOf.home);
    thisApp.booking = new Home(homeWidget);
  },

  init: function () {
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initBooking();
    thisApp.initHome();
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
