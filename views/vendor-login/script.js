const firebaseConfig = {
  apiKey: "AIzaSyClUYzNkCx7Yo5lDbUZacTGbLOtspW6l5k",
  authDomain: "partyshare-2e5c5.firebaseapp.com",
  projectId: "partyshare-2e5c5",
  appId: "1:175286295892:web:d138909c85992d2da5bcc1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

function showError(element, message){
  element.nextElementSibling.style.display = "block";
  element.nextElementSibling.textContent = message
  element.style.borderColor="var(--error)"
  element.animate([{left:"0"},{left:"-5px"},{left:"0"},{left:"5px"}],{duration:100,iterations:2})

  setTimeout(()=>{resetError(element)}, 8000)
}

function resetError(element){
  element.nextElementSibling.style.display = "none";
  element.style.borderColor="var(--light)"

}

const firebaseCodes = {
  "auth/invalid-email": ["email", "Invalid email"],
  "auth/user-disabled": ["email", "This account was disabled"],
  "auth/user-not-found": ["email", "There is no account with this email"],
  "auth/wrong-password": ["password", "Wrong password"],
  "auth/too-many-requests": ["email", "Too many login attempts. Try again later"]
}

const signInForm = document.querySelector("#form-container form")
document.querySelector("p").addEventListener("click", ()=>{
  document.querySelector("#form-container").style.display = "none"
  document.querySelector("#reset-password").style.display = "block"
})

signInForm.addEventListener("submit", async (ev)=>{
  ev.preventDefault()
  const user = await firebase.auth().signInWithEmailAndPassword(signInForm.children[1].value, signInForm.children[4].value).catch((error)=>{
    let code = firebaseCodes[error.code]
    showError(document.getElementById(code[0]), code[1])
    toggleLoading()
  })

  toggleLoading()
  await fetch("/accounts/login", {
    method: "POST",
    body: JSON.stringify({  
      idToken: await user.user.getIdToken(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  toggleLoading()
  window.location = "/"
})