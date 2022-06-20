flatpickr(".date", {
  monthSelectorType: "static",
  minDate: "today",
  dateFormat: "Y/m/d",
  altFormat: "Y/d/m",
  altInput: true,
});

function editDropdown(element, int) {
  const previousValue = parseInt(element.value);
  let html = "";
  for (let i = 0; i < int; i++) {
    html += `<option value="${i + 1}">${i + 1}</option>`;
  }
  if (html == "") {
    element.innerHTML = `<option value="0">0</option>`;
    element.value = Math.min(int, previousValue);
    return null;
  }
  element.innerHTML = html;
  element.value = Math.min(int, previousValue);
  return html;
}

const dates = JSON.parse(
  document.querySelector(".hidden").textContent.split("|||")[0]
);
const product = JSON.parse(
  document.querySelector(".hidden").textContent.split("|||")[1]
);

document.querySelector("form").addEventListener("submit", async (ev) => {
  console.log("here");
  ev.preventDefault();
  const startDate = new Date(document.querySelector("#start").value).setHours(
    0,
    0,
    0,
    0
  );
  const quantity = parseInt(document.querySelector("#quantity").value);
  const endDate = new Date(document.querySelector("#end").value).setHours(
    0,
    0,
    0,
    0
  );

  let listOfDates = Object.keys(dates);
  let datesInRange = listOfDates.filter((date) => {
    return date >= startDate && date <= endDate;
  });

  let quantsInRange = datesInRange.map((e) => dates[e.toString()]);

  console.log(quantsInRange);

  if (
    quantsInRange.some((e) => e - quantity > -1) ||
    quantsInRange.length < 1
  ) {
    await fetch("/checkout/", {
      method: "POST",
      body: JSON.stringify({
        productID: product.id,
        quantity,
        startDate,
        endDate,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    window.location = "/checkout";
  }
});

document.querySelectorAll(".date").forEach((ele) => {
  ele.addEventListener("change", () => {
    console.log("changed");
    let startDate = new Date(document.querySelector("#start").value).setHours(
      0,
      0,
      0,
      0
    );
    let endDate = new Date(document.querySelector("#end").value).setHours(
      0,
      0,
      0,
      0
    );
    let quantity = document.querySelector("#quantity");

    if (startDate) {
      flatpickr("#end", {
        monthSelectorType: "static",
        minDate: startDate,
        dateFormat: "Y/m/d",
        altFormat: "Y/d/m",
        altInput: true,
      });
    }

    if (startDate && endDate) {
      document.querySelector("button").disabled = false;
      let listOfDates = Object.keys(dates);
      let datesInRange = listOfDates.filter((date) => {
        return date >= startDate && date <= endDate;
      });
      let quantsInRange = datesInRange.map((e) => dates[e.toString()]);
      let maxQuantity = quantsInRange.sort(function (a, b) {
        return a - b;
      })[0];
      console.log(quantsInRange, maxQuantity, datesInRange);
      if (!editDropdown(quantity, maxQuantity ?? product.quantity)) {
        document.querySelector("button").disabled = true;
      }
    } else {
      document.querySelector("button").disabled = true;
    }
  });
});

if (document.querySelector(".delete")) {
  document
    .querySelector(".delete")
    .addEventListener("click", async function (ev) {
      ev.preventDefault();
      const deleteProduct = confirm(
        "Are you sure you would like to delete this product?"
      );
      if (deleteProduct) {
        await fetch(`/products/delete/`, {
          method: "DELETE",
          body: JSON.stringify({
            id: product.id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        window.location = "/";
      }
    });

  document
    .querySelector(".edit")
    .addEventListener("click", async function (ev) {
      ev.preventDefault();
      window.location = `products/edit/${product.id}/`;
    });
}

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

let slideIndex=0;
const slides = document.querySelectorAll(".gallery-image");

function changeSlides(n) {
  slides[slideIndex].style.display = "none";
  slideIndex = (slideIndex + n).mod(document.querySelectorAll(".gallery-image").length);
  slides[slideIndex].style.display = "inline";
}

function openGallery(n) {
  slides[slideIndex].style.display = "none";
  slideIndex = n;
  changeSlides(0);
  document.querySelector(".gallery").style.display = "grid";
}

document.querySelector(".prev").addEventListener("click", function (e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  changeSlides(-1);
});

document.querySelector(".next").addEventListener("click", function (e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  changeSlides(1);
});

document.querySelector("#image").addEventListener("click", function () {
  openGallery(0);
});

const subimages = document.querySelectorAll(".sub");

for (let i = 0; i < subimages.length; i++) {
  subimages[i].addEventListener("click", function () {
    openGallery(i + 1);
  });
}

document.querySelector(".gallery").addEventListener("click", function (e) {
  document.querySelector(".gallery").style.display = "none";
});
