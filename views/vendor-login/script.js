var firebaseConfig = {
  apiKey: "AIzaSyCX81B-1etrrNgZTbt3qtBFCcC09kkgEYM",
  authDomain: "partyshare-47d15.firebaseapp.com",
  projectId: "partyshare-47d15",
  appId: "1:850103630383:web:002de45e99c31ff51b64da",
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