import { templates } from "../settings.js";

class Home {
  constructor(element) {
    const thisHome = this;
    thisHome.render(element);
    thisHome.init();
  }

  init() {
    const thisHome = this;
    const links = document.querySelectorAll(".choice");
    console.log(links);
    for (let link of links) {
      link.addEventListener("click", function (e) {
        console.log("hello");
        console.log(thisHome);
        console.log(this);
        console.log(e.target);
        console.log(e.currentTarget);
        let clickedElement = this;
        e.preventDefault();

        /*get page id from href attribute */
        const id = clickedElement.getAttribute("href").replace("#", "");
        console.log(id);
        /*run actvatePage with that id */

        /*change URL hash */
        window.location.hash = "#/" + id;
      });
    }
  }

  render(element) {
    console.log(element);
    const thisHome = this;
    const generatedHTML = templates.homeWidget();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }
}

export default Home;
