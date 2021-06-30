import { classNames, select, settings, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableSelectedData = "";
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    // console.log(params);
    const urls = {
      bookings:
        settings.db.url +
        "/" +
        settings.db.bookings +
        "?" +
        params.bookings.join("&"),

      eventsCurrent:
        settings.db.url +
        "/" +
        settings.db.events +
        "?" +
        params.eventsCurrent.join("&"),

      eventsRepeat:
        settings.db.url +
        "/" +
        settings.db.events +
        "?" +
        params.eventsRepeat.join("&"),
    };

    // console.log(urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])

      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(booking);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parsData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parsData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    // console.log(bookings);
    for (let item of bookings) {
      // console.log(item);
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    // console.log(eventsCurrent);
    for (let item of eventsCurrent) {
      // console.log(item);
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      // console.log(item);
      if (item.repeat == "daily") {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    // console.log(thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == "undefined") {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      // console.log("loop", hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == "undefined") {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == "undefined" ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        "undefined"
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
  }

  render(element) {
    console.log(element);
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = document.querySelector(
      select.widgets.hourPicker.wrapper
    );

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.floorPlan = document.querySelector(
      select.booking.floorPlan
    );
    thisBooking.dom.bookingSubmit = document.querySelector(
      select.booking.submit
    );
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.address = document.querySelector(select.booking.address);
    thisBooking.dom.checkboxes =
      thisBooking.dom.wrapper.querySelector(".booking-options");
    thisBooking.dom.starters = [];
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener("updated", function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener("click", function (e) {
      e.preventDefault();
      thisBooking.initTables(e);
    });
    thisBooking.dom.checkboxes.addEventListener("click", function (e) {
      thisBooking.choseStarters(e);
    });
    thisBooking.dom.bookingSubmit.addEventListener("click", function (e) {
      e.preventDefault();
      thisBooking.sendBooking();
      alert("Rezerwacja została złożona.");
    });
  }

  initTables(e) {
    const thisBooking = this;
    const targetTable = e.target;
    console.log(e.target);
    const targetTableId = targetTable.getAttribute("data-table");
    console.log(targetTableId);

    if (
      !targetTable.classList.contains(classNames.booking.tableBooked) &&
      !targetTable.classList.contains(classNames.booking.tableSelected)
    ) {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
      }
      targetTable.classList.add(classNames.booking.tableSelected);
      thisBooking.tableSelectedData = targetTableId;
      console.log(thisBooking.tableSelectedData);
    } else if (
      !targetTable.classList.contains(classNames.booking.tableBooked) &&
      targetTable.classList.contains(classNames.booking.tableSelected)
    ) {
      targetTable.classList.remove(classNames.booking.tableSelected);
    } else {
      alert("Ten stolik jest zarezerwowany.");
    }
  }

  choseStarters(e) {
    const thisBooking = this;

    // e.preventDefault();
    // console.log(e.target);
    const clickedChecbox = e.target;
    if (clickedChecbox.type === "checkbox" && clickedChecbox.name === "starter")
      if (clickedChecbox.checked) {
        console.log(clickedChecbox.value);
        thisBooking.dom.starters.push(clickedChecbox.value);
        console.log(thisBooking.dom.starters);
      } else {
        const bookingStarterIndex = thisBooking.dom.starters.indexOf(
          e.target.value
        );

        thisBooking.dom.starters.splice(bookingStarterIndex, 1);
        console.log(thisBooking.dom.starters);
      }
  }
  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + "/" + settings.db.bookings;
    // console.log(url);

    const bookingLoad = {
      date: thisBooking.date,
      hour: thisBooking.hour,
      table: parseInt(thisBooking.tableSelectedData),
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    console.log(thisBooking);

    bookingLoad.starters = thisBooking.dom.starters;
    // console.log(thisBooking.starters);
    // console.log("bookingLoad", bookingLoad);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingLoad),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log("parsedResponse", parsedResponse);

        thisBooking.booked = parsedResponse;
        console.log(thisBooking.booked);
      });
  }
}

export default Booking;
