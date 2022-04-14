document.querySelectorAll(".product").forEach((product) => {
  product.addEventListener("click", () => {
    location = "/product/" + product.id;
  });
});

const searchParams = new URL(window.location).searchParams;
document.querySelector("input").value = searchParams.get("query") || "";

const checkbox = document.querySelector(
  `input#${searchParams.get("category")}`
);
if (checkbox) {
  checkbox.checked = true;
  checkbox.classList.add("selected");
}
if (searchParams.get("query")) {
  const searchResultMessage = document.querySelector("#search-results");
  const numberOfProducts = document.querySelectorAll(".product").length;
  searchResultMessage.textContent = `${numberOfProducts} ${
    numberOfProducts < 2 && numberOfProducts > 0 ? "result" : "results"
  } for `;
  searchResultMessage.nextElementSibling.textContent = `'${searchParams.get(
    "query"
  )}'`;
}

const productPerRow = window
  .getComputedStyle(document.querySelector("#product-bar"))
  .getPropertyValue("grid-template-columns")
  .split(" ").length;

// const productPerRow = 1;
if (
  window.matchMedia("(min-width:768px)").matches &&
  document.querySelectorAll(".product").length < productPerRow
) {
  document.querySelector("#product-bar").style.display = "block";
}

document.addEventListener("click", (ev) => {
  const input = ev.target;
  if (input.type != "radio") {
    return;
  }
  console.log(input);
  if (input.classList.contains("selected")) {
    //see if it has the selected class
    input.checked = false;
    input.classList.remove("selected");
    return;
  }
  const previousSelected = document.querySelector("input.selected");
  previousSelected ? previousSelected.classList.remove("selected") : null;
  input.classList.add("selected");
  console.log(input, input.children)
  window.location = encodeURI(
    `/search?query=${document.querySelector("input").value}${
      input ? `&category=${input.nextElementSibling.textContent}` : ""
    }`
  );
});

document.querySelector("form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const tagValue = document.querySelector("input:checked ~ .tag");

  window.location = encodeURI(
    `/search?query=${document.querySelector("input").value}${
      tagValue ? `&category=${tagValue.textContent}` : ""
    }`
  );
});
