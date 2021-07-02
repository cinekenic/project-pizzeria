import { templates, select } from "../settings.js";
import { app } from "../app.js";

class Home {
  constructor(element) {
    const thisHome = this;
    thisHome.render(element);
    thisHome.navigate();
    thisHome.initWidgets();
  }

  render(element) {
    console.log(element);
    const thisHome = this;

    const generatedHTML = templates.homeWidget();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.navLinks = thisHome.dom.wrapper.querySelectorAll(
      select.home.mainOptions
    );
  }

  initWidgets() {
    const thisHome = this;
    thisHome.element = document.querySelector(select.widgets.carousel);
    // eslint-disable-next-line no-undef
    thisHome.flkty = new Flickity(thisHome.element, {
      cellAlign: "left",
      contain: true,
      autoPlay: true,
      prevNextButtons: false,
      wrapAround: true,
    });
    window.onload = function () {
      thisHome.flkty.resize();
    };
  }

  navigate() {
    const thisHome = this;
    console.log(thisHome.dom.navLinks);
    app.initNavLinks(thisHome.dom.navLinks);
  }
}

export default Home;
