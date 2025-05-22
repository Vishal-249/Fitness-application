// Fake authentication with localStorage

function signup() {
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const message = document.getElementById("auth-message");

  if (!username || !password) {
    message.textContent = "Please enter username and password.";
    return;
  }

  if (localStorage.getItem("user_" + username)) {
    message.textContent = "Username already taken.";
    return;
  }

  // Save user as JSON string: {username, password}
  localStorage.setItem("user_" + username, JSON.stringify({ username, password }));

  message.style.color = "green";
  message.textContent = "Sign up successful! You can now log in.";

  // Clear signup inputs
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-password").value = "";
}

function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const message = document.getElementById("auth-message");

  if (!username || !password) {
    message.style.color = "red";
    message.textContent = "Please enter username and password.";
    return;
  }

  const userStr = localStorage.getItem("user_" + username);
  if (!userStr) {
    message.style.color = "red";
    message.textContent = "User not found. Please sign up first.";
    return;
  }

  const user = JSON.parse(userStr);
  if (user.password !== password) {
    message.style.color = "red";
    message.textContent = "Incorrect password.";
    return;
  }

  // Successful login - save logged in user in localStorage
  localStorage.setItem("loggedInUser", username);

  // Hide auth screen, show main app
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("main-app").style.display = "block";

  message.textContent = "";
  
  // Load saved data or reset
  loadUserData(username);
}

function logout() {
  localStorage.removeItem("loggedInUser");
  location.reload();
}

// Check if user is already logged in on page load
window.onload = function() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    document.getElementById("auth-screen").style.display = "none";
    document.getElementById("main-app").style.display = "block";
    loadUserData(loggedInUser);
  }
};

// Fitness Tracker Logic with data persistence per user

let calorieTotal = 0;
let waterTotal = 0;
let burnedCalories = 0;
let currentWorkout = "-";

function saveUserData(username) {
  const data = {
    calorieTotal,
    waterTotal,
    burnedCalories,
    currentWorkout,
    calorieItems: [...document.getElementById("calorie-list").children].map(li => li.textContent)
  };
  localStorage.setItem("fitnessData_" + username, JSON.stringify(data));
}

function loadUserData(username) {
  // Update username in summary
  document.getElementById("summary-username").textContent = username;

  const dataStr = localStorage.getItem("fitnessData_" + username);
  if (!dataStr) {
    resetData();
    return;
  }
  const data = JSON.parse(dataStr);
  calorieTotal = data.calorieTotal || 0;
  waterTotal = data.waterTotal || 0;
  burnedCalories = data.burnedCalories || 0;
  currentWorkout = data.currentWorkout || "-";

  // Update UI elements
  document.getElementById("calorie-total").textContent = calorieTotal;
  document.getElementById("water-total").textContent = waterTotal;
  document.getElementById("summary-calories").textContent = calorieTotal;
  document.getElementById("summary-water").textContent = waterTotal;
  document.getElementById("summary-burned").textContent = burnedCalories;
  document.getElementById("summary-workout").textContent = currentWorkout;

  // Rebuild calorie list
  const list = document.getElementById("calorie-list");
  list.innerHTML = "";
  if (data.calorieItems && data.calorieItems.length) {
    data.calorieItems.forEach(itemText => {
      const li = document.createElement("li");
      li.textContent = itemText;
      list.appendChild(li);
    });
  }
}

function resetData() {
  calorieTotal = 0;
  waterTotal = 0;
  burnedCalories = 0;
  currentWorkout = "-";

  document.getElementById("calorie-total").textContent = "0";
  document.getElementById("water-total").textContent = "0";
  document.getElementById("summary-calories").textContent = "0";
  document.getElementById("summary-water").textContent = "0";
  document.getElementById("summary-burned").textContent = "0";
  document.getElementById("summary-workout").textContent = "-";
  document.getElementById("calorie-list").innerHTML = "";
}

function addCalories() {
  const food = document.getElementById("food").value.trim();
  const cal = parseInt(document.getElementById("calories").value);
  const username = localStorage.getItem("loggedInUser");

  if (food && !isNaN(cal)) {
    const list = document.getElementById("calorie-list");
    const item = document.createElement("li");
    item.textContent = `${food}: ${cal} cal`;
    list.appendChild(item);

    calorieTotal += cal;
    document.getElementById("calorie-total").textContent = calorieTotal;
    document.getElementById("summary-calories").textContent = calorieTotal;

    document.getElementById("food").value = "";
    document.getElementById("calories").value = "";

    saveUserData(username);
  }
}

function addWater() {
  const ml = parseInt(document.getElementById("water").value);
  const username = localStorage.getItem("loggedInUser");

  if (!isNaN(ml)) {
    waterTotal += ml;
    document.getElementById("water-total").textContent = waterTotal;
    document.getElementById("summary-water").textContent = waterTotal;

    document.getElementById("water").value = "";

    saveUserData(username);
  }
}

function calculateBurn() {
  const type = document.getElementById("workout-type").value;
  const minutes = parseInt(document.getElementById("minutes").value);
  const username = localStorage.getItem("loggedInUser");

  if (isNaN(minutes) || minutes <= 0) {
    alert("Enter valid minutes");
    return;
  }

  const burnRates = {
    "Running": 10,
    "Cycling": 8,
    "Yoga": 4,
    "Weight Lifting": 6
  };

  burnedCalories = burnRates[type] * minutes;
  currentWorkout = type;

  document.getElementById("burned").textContent = `You burned approx. ${burnedCalories} calories!`;
  document.getElementById("summary-workout").textContent = type;
  document.getElementById("summary-burned").textContent = burnedCalories;

  saveUserData(username);
}
