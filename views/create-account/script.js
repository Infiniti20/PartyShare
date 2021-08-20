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
    .createUserWithEmailAndPassword(inputs[0].value, inputs[0].value);

  console.log(userCredidential);
  console.log(await userCredidential.user.getIdToken());

  // TODO: ADD ACCOUNT DATA TO REQUEST

  await fetch("/accounts/login", {
    method: "POST",
    body: JSON.stringify({  
      idToken: await userCredidential.user.getIdToken(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
});
