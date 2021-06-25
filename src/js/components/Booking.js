import { select, settings, templates } from "../settings.js";
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
      .then(function ([booking, eventsCurrent, eventsRepeat]) {
        // console.log(booking);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parsData(booking, eventsCurrent, eventsRepeat);
      });
  }

  parsData(booking, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for (let item of eventsCurrent) {
      console.log(item);
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    console.log(thisBooking.booked);
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

  render(element) {
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
  }
}

export default Booking;
