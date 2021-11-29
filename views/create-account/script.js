const firebaseConfig = {
  apiKey: "AIzaSyClUYzNkCx7Yo5lDbUZacTGbLOtspW6l5k",
  authDomain: "partyshare-2e5c5.firebaseapp.com",
  projectId: "partyshare-2e5c5",
  appId: "1:175286295892:web:d138909c85992d2da5bcc1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

function showError(element, message) {
  element.nextElementSibling.style.display = "block";
  element.nextElementSibling.textContent = message;
  element.style.borderColor = "var(--error)";
  element.animate(
    [{ left: "0" }, { left: "-5px" }, { left: "0" }, { left: "5px" }],
    { duration: 100, iterations: 2 }
  );

  setTimeout(() => {
    resetError(element);
  }, 8000);
}

function resetError(element) {
  element.nextElementSibling.style.display = "none";
  element.style.borderColor = "var(--light)";
}

const firebaseCodes = {
  "auth/invalid-email": ["email", "Invalid email"],
  "auth/email-already-in-use": ["email", "This email is already in use"],
  "auth/weak-password": ["password", "Weak password"],
};

document.querySelector("form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  let inputs = document.querySelectorAll("input");

  let userCredidential = await firebase
    .auth()
    .createUserWithEmailAndPassword(inputs[1].value, inputs[2].value)
    .catch((error) => {
      let code = firebaseCodes[error.code];
      showError(document.getElementById(code[0]), code[1]);
      toggleLoading();
    });

  console.log(userCredidential);

  toggleLoading();
  await fetch("/accounts/create", {
    method: "POST",
    body: JSON.stringify({
      idToken: await userCredidential.user.getIdToken(),
      name: inputs[0].value,
      email: inputs[1].value,
      location: inputs[3].value,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  setTimeout(() => {
    toggleLoading();
    window.location = "/";
  }, 1000);
});
