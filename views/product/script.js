document.querySelector(".product-image").addEventListener("click", () => {
  console.log("File opener");
  document.querySelector("input[type=file]").click();
});

document.querySelector("input[type=file]").addEventListener("change", () => {
  const file = document.querySelector("input[type=file]").files[0];
  if (file == undefined) {
    document.querySelector(".product-image").outerHTML =
      '<div class="product-image">Upload Image</div>';
  } else {
    document.querySelector(".product-image").outerHTML =
      '<img class="product-image" alt=""/>';
  }

  document.querySelector(".product-image").addEventListener("click", () => {
    document.querySelector("input[type=file]").click();
  });

  let preview = document.querySelector(".product-image");

  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      preview.src = reader.result;
    },
    false
  );

  if (file) {
    reader.readAsDataURL(file);
  }
});

document.querySelector(".cost").addEventListener("keydown", function (ev) {
  let self = document.querySelector(".cost");
  let val = self.value;
  if (isNaN(parseInt(ev.key)) && ev.key != "." && ev.key.length < 2) {
    ev.preventDefault();
  }
  self.value = val.startsWith("$") ? val : "$" + val;
});


document.querySelector("form").addEventListener("submit", async (ev) => {
  ev.preventDefault();

  toggleLoading();
  await fetch(`/products/${document.querySelector(".edit") ? `edit/${ev.target.id}` : "create"}`, {
    method: "POST",
    body: new FormData(document.querySelector("form")),
  });
  setTimeout(() => {
    toggleLoading();
    window.location = "/";
  }, 1000);
});
