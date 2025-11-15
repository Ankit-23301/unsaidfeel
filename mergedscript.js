// ✅ Modular Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBuljGimP55Q0c90SjVib7a3uXxnkr84Q4",
  authDomain: "unsaid-feel.firebaseapp.com",
  projectId: "unsaid-feel",
  storageBucket: "unsaid-feel.appspot.com",
  messagingSenderId: "104391126896",
  appId: "1:104391126896:web:9673b6906c6469ae2069b5",
  measurementId: "G-QCSM3EH7MT"
};

// ✅ Initialize App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Login
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
  } catch (e) {
    alert("Login failed: " + e.message);
  }
};

// ✅ Signup
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");
  } catch (e) {
    alert("Signup failed: " + e.message);
  }
};

// ✅ Logout
window.logout = async function () {
  try {
    await signOut(auth);
    alert("Logged out!");
  } catch (e) {
    alert("Logout failed: " + e.message);
  }
};

// ✅ Auth State Check
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("userInfo");
  if (user) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    userInfo.innerText = `Logged in as: ${user.email}`;
  } else {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
    userInfo.innerText = "";
  }
});


// ✅ Daily Challenge
const challenges = [
  "Write something you never told anyone.",
  "Describe your day in one word.",
  "Write a letter to your future self.",
  "What’s something you regret but never admitted?",
  "Write about someone you miss right now.",
  "What's the one truth you’re scared to say aloud?"
];
document.getElementById("dailyChallenge").innerText = challenges[new Date().getDate() % challenges.length];
window.useChallenge = function () {
  document.getElementById("text").value = document.getElementById("dailyChallenge").innerText;
};

// ✅ Submit Feeling
window.submitFeeling = async function () {
  const emoji = document.getElementById("emoji").value;
  const text = document.getElementById("text").value.trim();
  const anon = document.getElementById("anon").checked;
  if (!emoji || !text) return alert("Please fill all fields");
  try {
    await addDoc(collection(db, "feelings"), {
      mood: emoji,
      text,
      anon,
      uid: auth.currentUser ? auth.currentUser.uid : null,
      timestamp: new Date()
    });
    alert("Feeling shared anonymously ❤️");
    document.getElementById("text").value = "";
  } catch (e) {
    alert("Failed to submit: " + e.message);
  }
};

// ✅ Stranger Message
window.sendStrangerMessage = async function () {
  const msg = document.getElementById("strangerMessage").value.trim();
  if (!msg) return alert("Write something");
  try {
    await addDoc(collection(db, "messages_from_strangers"), {
      text: msg,
      timestamp: new Date()
    });
    alert("Thanks for spreading kindness 💌");
    document.getElementById("strangerMessage").value = "";
  } catch (e) {
    alert("Failed to send message: " + e.message);
  }
};

// ✅ Post to Circle
window.submitToCircle = async function () {
  const circle = document.getElementById("circleSelect").value;
  const post = document.getElementById("circlePost").value.trim();
  if (!post) return alert("Write something");
  try {
    const ref = collection(db, `unsaidCircles/${circle}/posts`);
    await addDoc(ref, { text: post, timestamp: new Date() });
    alert(`Posted to ${circle} circle!`);
    document.getElementById("circlePost").value = "";
    loadCirclePosts();
  } catch (e) {
    alert("Error posting to circle: " + e.message);
  }
};

// ✅ Load Circle Posts
async function loadCirclePosts() {
  const circle = document.getElementById("circleSelect").value;
  const feed = document.getElementById("circleFeed");
  feed.innerHTML = "<p>Loading...</p>";
  try {
    const ref = collection(db, `unsaidCircles/${circle}/posts`);
    const q = query(ref, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    feed.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      const div = document.createElement("div");
      div.innerText = '📝 ' + d.text;
      div.style.margin = "10px 0";
      feed.appendChild(div);
    });
  } catch (e) {
    feed.innerHTML = "<p>Error loading posts.</p>";
  }
}
document.getElementById("circleSelect").addEventListener("change", loadCirclePosts);

// ✅ Shareable Card
window.generateCard = function () {
  const text = document.getElementById("cardText").value.trim();
  if (!text) return alert("Write something");
  const card = document.getElementById("cardPreview");
  card.innerText = `“${text}”\n\n– UnsaidFeel`;
  document.getElementById("cardOutput").style.display = 'block';
};
window.downloadCard = function () {
  html2canvas(document.getElementById("cardPreview")).then(canvas => {
    const link = document.createElement('a');
    link.download = 'unsaidfeel_card.png';
    link.href = canvas.toDataURL();
    link.click();
  });
};

// ✅ Admin UID Search
const uidForm = document.getElementById("uidSearchForm");
uidForm.addEventListener("submit", async e => {
  e.preventDefault();
  const uid = document.getElementById("uidInput").value.trim();
  if (!uid) return;
  try {
    const q = query(collection(db, "feelings"), where("uid", "==", uid));
    const snap = await getDocs(q);
    const list = document.getElementById("uidResults");
    list.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      const li = document.createElement("li");
      li.innerText = `${d.mood || ""} ${d.text}`;
      list.appendChild(li);
    });
  } catch (e) {
    alert("Failed to fetch entries: " + e.message);
  }
});
