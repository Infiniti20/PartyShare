flatpickr(".date", {
  monthSelectorType: "static",
  minDate: "today",
  dateFormat: "Y/m/d",
  altFormat: "Y/d/m",
  altInput: true,
});

function editDropdown(element, int) {
  const previousValue = parseInt(element.value)
  let html = "";
  for (let i = 1; i <= int; i++) {
    html += `<option value="${i}">${i}</option>`;
  }
  element.innerHTML = html;
  element.value = Math.min(int, previousValue)
}

const dates = JSON.parse(
  document.querySelector(".hidden").textContent.split("|||")[0]
);
const product = JSON.parse(
  document.querySelector(".hidden").textContent.split("|||")[1]
);

document.querySelector("form").addEventListener("submit", async (ev) => {
  ev.preventDefault()
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

  if (quantsInRange.some((e) => e - quantity > -1) || quantsInRange.length < 1) {
    await fetch("/checkout/", {
      method: "POST",
      body: JSON.stringify({productID: product.id, quantity, startDate, endDate}),
      headers: {
        "Content-Type": "application/json",
      },
    });
    window.location="/checkout"
  }
});

document.querySelectorAll(".date").forEach((ele) => {
  ele.addEventListener("change", () => {
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
      let listOfDates = Object.keys(dates);
      let datesInRange = listOfDates.filter((date) => {
        return date >= startDate && date <= endDate;
      });
      let quantsInRange = datesInRange.map((e) => dates[e.toString()]);
      let maxQuantity = quantsInRange.sort(function (a, b) {
        return a - b;
      })[0];
      console.log(quantsInRange, maxQuantity, datesInRange);
      editDropdown(quantity, maxQuantity || product.quantity);
    }
  });
});
