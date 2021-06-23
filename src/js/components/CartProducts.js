import AmountWidget from "./AmountWidget.js";
import { select } from "../settings.js";

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amountWidget = menuProduct.amountWidget;

    thisCartProduct.getElements(element);
    thisCartProduct.initCartWidget();
    thisCartProduct.initActions();
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget =
      thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.amountWidget
      );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
  }

  initCartWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.amountWidget.value = thisCartProduct.amount;
    thisCartProduct.dom.amountWidget.addEventListener("click", function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price =
        thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent("remove", {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener("click", function (e) {
      e.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener("click", function (e) {
      e.preventDefault();
      thisCartProduct.remove();
      console.log("remove");
    });
  }
  getData() {
    const thisCartProduct = this;

    const payloadSummary = {
      id: thisCartProduct.id,
      name: thisCartProduct.name,
      amount: thisCartProduct.amountWidget.value,
      priceSingle: thisCartProduct.priceSingle,
      price: thisCartProduct.amountWidget.value * thisCartProduct.priceSingle,
      params: thisCartProduct.params,
    };
    console.log("payloadSummary", payloadSummary);
    return payloadSummary;
  }
}

export default CartProduct;
