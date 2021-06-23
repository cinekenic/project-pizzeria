import { select, classNames, settings, templates } from "../settings.js";
import CartProduct from "./CartProducts.js";
import utils from "../utils.js";

class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initAction();
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  initAction() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener("click", function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener("updated", function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener("remove", function (e) {
      thisCart.remove(e.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener("submit", function (e) {
      e.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + "/" + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.deliveryFee,
      products: [],
    };
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (res) {
        return res.json();
      })
      .then(function (parsedRes) {});
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();
  }
  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;

      thisCart.subTotalPrice += product.price;
    }

    if (thisCart.totalNumber == 0) {
      thisCart.totalPrice = 0;
    } else {
      thisCart.totalPrice = thisCart.subTotalPrice + deliveryFee;
    }

    for (let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
    }

    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  }
  remove(CartProduct) {
    const thisCart = this;

    CartProduct.dom.wrapper.remove();
    const productIndex = thisCart.products.indexOf(CartProduct);

    thisCart.products.splice(productIndex, 1);

    thisCart.update();
  }
}

export default Cart;
