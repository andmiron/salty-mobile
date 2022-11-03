"use strict";

const navBar = document.querySelector(".form");
const inputType = document.querySelector(".form__input__type");
const inputWeight = document.querySelector(".form__input__number");
const showBtn = document.querySelector(".show-btn");
const contentBlock = document.querySelector(".content");

class Package {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, type, weight, currentDate) {
    this.coords = coords;
    this.type = type;
    this.weight = weight;
    this.currentDate = currentDate;
  }
}

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #tempMarker;
  #packages = [];

  constructor() {
    this._getLocalStorage();
    this._loadMap();
    this.#map.on("click", this._mapClickFunction.bind(this));
    navBar.addEventListener("submit", this._newPackage.bind(this));
    showBtn.addEventListener("click", this._toggleList);
    contentBlock.addEventListener("click", this._moveToPopup.bind(this));
  }

  _loadMap() {
    // INITIALIZING MAP
    this.#map = L.map("map").fitWorld();
    this.#map.locate({ setView: true, maxZoom: 16 });
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(this.#map);
    this.#packages.forEach((item) => this._renderPackageMarker(item));
  }

  _mapClickFunction(e) {
    this.#mapEvent = e;
    if (this.#tempMarker !== undefined) {
      this.#map.removeLayer(this.#tempMarker);
    }
    this.#tempMarker = L.marker(e.latlng)
      .addTo(this.#map)
      .bindPopup("Leave package here?")
      .openPopup();
  }

  _newPackage(e) {
    e.preventDefault();
    // DATE
    function padTo2Digits(num) {
      return num.toString().padStart(2, "0");
    }
    const formatDate = function (date) {
      return [
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
        date.getFullYear(),
      ].join("/");
    };
    if (inputWeight.value < 1 || inputWeight.value > 10) {
      alert("Weight must be from 1 to 10 gram!");
      return;
    }
    if (this.#mapEvent) {
      const type = inputType.value;
      const weight = inputWeight.value;
      const currentDate = formatDate(new Date());
      const { lat, lng } = this.#mapEvent.latlng;
      const parcel = new Package([lat, lng], type, weight, currentDate);
      this.#packages.push(parcel);
      this._renderPackage(parcel);
      this._renderPackageMarker(parcel);
      this._setLocalStorage();

      inputType.selectedIndex = 0;
      inputWeight.value = "";
    } else alert("First click on the map!");
  }

  _renderPackageMarker(parcel) {
    L.marker(parcel.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          closeOnClick: false,
          className: "custom-popup",
        })
      )
      .setPopupContent("Something has been dropped here!")
      .openPopup();
  }

  _toggleList() {
    showBtn.classList.toggle("show-btn--rotate");
    contentBlock.classList.toggle("content--hidden");
  }

  _renderPackage(parcel) {
    let html = `
      <ul class="content__list">
      <li class="content__list__item" data-id="${parcel.id}">
        <h2 class="list-title">Package on ${parcel.currentDate}</h2>
        <div class="list-details">
          <span class="list-type">${parcel.type}</span>
          <span class="list-icon"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              class="form__label__logo"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
              /></svg
          ></span>
          <span class="list-weight">${parcel.weight} gram</span>
        </div>
      </li>
    </ul>
    `;

    contentBlock.insertAdjacentHTML("afterbegin", html);
  }

  _moveToPopup(e) {
    const listItem = e.target.closest(".content__list__item");
    if (!listItem) return;
    const item = this.#packages.find((item) => item.id === listItem.dataset.id);
    contentBlock.classList.add("content--hidden");
    this.#map.setView(item.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("packages", JSON.stringify(this.#packages));
  }

  _getLocalStorage() {
    const packg = JSON.parse(localStorage.getItem("packages"));
    if (!packg) return;
    this.#packages = packg;
    this.#packages.forEach((item) => this._renderPackage(item));
  }
}

const app = new App();
