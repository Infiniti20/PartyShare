var firebaseConfig = {
  apiKey: "AIzaSyCX81B-1etrrNgZTbt3qtBFCcC09kkgEYM",
  authDomain: "partyshare-47d15.firebaseapp.com",
  projectId: "partyshare-47d15",
  appId: "1:850103630383:web:002de45e99c31ff51b64da",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

document.querySelector("form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  let inputs = document.querySelectorAll("input");

  let userCredidential = await firebase
    .auth()
    .createUserWithEmailAndPassword(inputs[1].value, inputs[2].value);

  console.log(userCredidential);

  

  toggleLoading()
  await fetch("/accounts/create", {
    method: "POST",
    body: JSON.stringify({  
      idToken: await userCredidential.user.getIdToken(),
      name: inputs[0].value,
      email: inputs[1].value,
      location: inputs[3].value
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  toggleLoading()
  window.location = "/"
});
