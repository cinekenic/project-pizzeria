import { settings, select } from "../settings.js";

class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    // thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initAction(thisWidget.input.value);
    console.log("AmountWidget:", thisWidget);
    console.log("Construktor Argument:", element);
  }
  getElements(element) {
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }
  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);

    if (
      thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax
    ) {
      thisWidget.value = newValue;
      console.log(" thisWidget.value", newValue);
    }

    thisWidget.input.value = thisWidget.value;

    thisWidget.announce();
  }
  initAction() {
    const thisWidget = this;
    thisWidget.input.addEventListener("change", function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener("click", function (e) {
      e.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener("click", function (e) {
      e.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent("updated", {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
