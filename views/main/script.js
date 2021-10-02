document.querySelectorAll(".product").forEach((product) => {
  product.addEventListener("click", () => {
    location = "/products/" + product.id;
  });
});

const searchParams = new URL(window.location).searchParams;
document.querySelector("input").value = searchParams.get("query") || "";

const checkbox = document.querySelector(
  `input#${searchParams.get("category")}`
);
if (checkbox) {
  checkbox.checked = true;
  checkbox.classList.add("selected")
}
if(searchParams.get("query")){
  const searchResultMessage = document.querySelector("#search-results")
  const numberOfProducts = document.querySelectorAll('.product').length
  searchResultMessage.textContent = `${numberOfProducts} ${numberOfProducts < 2 ? 'result': 'results'} for `
  searchResultMessage.nextElementSibling.textContent = `'${searchParams.get("query")}'`
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
