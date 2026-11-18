
(() => {
  const db = window.mutifySupabase;

  if (!db) {
    console.error("Mutify Supabase connection is missing.");
    return;
  }

  const css = document.createElement("style");
  css.textContent = `
    #mutify-account {
      background:#16834a;
      color:white;
      border:0;
      border-radius:25px;
      padding:11px 17px;
      font-weight:bold;
      cursor:pointer;
      white-space:nowrap;
      font-size:14px;
      margin:0 5px;
    }
    #mutify-auth-overlay {
      position:fixed;
      inset:0;
      background:#0009;
      z-index:999999;
      display:none;
      align-items:center;
      justify-content:center;
      padding:18px;
    }
    #mutify-auth-box {
      background:white;
      color:#17251c;
      width:100%;
      max-width:390px;
      padding:25px;
      border-radius:20px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    }
    #mutify-auth-box input {
      width:100%;
      box-sizing:border-box;
      padding:14px;
      margin:8px 0;
      border:1px solid #ddd;
      border-radius:10px;
    }
    #mutify-auth-box button {
      padding:13px;
      border:0;
      border-radius:10px;
      cursor:pointer;
      font-weight:bold;
    }
    #mutify-auth-submit {
      width:100%;
      background:#16834a;
      color:white;
      margin-top:12px;
    }
    #mutify-auth-switch {
      width:100%;
      background:#e9f5ed;
      color:#16834a;
      margin-top:10px;
    }
    #mutify-auth-close {
      float:right;
      background:#eee;
    }
    #mutify-auth-message {
      font-size:13px;
      line-height:1.5;
    }
  `;
  document.head.appendChild(css);

  const account = document.createElement("button");
  account.id = "mutify-account";
  account.textContent = "My Account";

  const overlay = document.createElement("div");
  overlay.id = "mutify-auth-overlay";
  overlay.innerHTML = `
    <div id="mutify-auth-box">
      <button id="mutify-auth-close">✕</button>
      <h2 id="mutify-auth-title">Welcome to Mutify</h2>
      <p id="mutify-auth-description">Sign in to your account.</p>

      <form id="mutify-auth-form">
        <input id="mutify-auth-email" type="email"
          placeholder="Email address" required>
        <input id="mutify-auth-password" type="password"
          placeholder="Password (minimum 6 characters)"
          minlength="6" required>
        <button id="mutify-auth-submit" type="submit">Sign In</button>
      </form>

      <button id="mutify-auth-switch">Create an account</button>
      <p id="mutify-auth-message"></p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Put the account button in the website's top navigation.
  function placeAccountButton() {
    const selectors = [
      ".header-actions",
      ".nav-actions",
      ".navbar-actions",
      ".header-right",
      ".nav-right",
      ".nav-links",
      "header nav",
      "header .container",
      "header",
      "nav"
    ];

    let target = null;

    for (const selector of selectors) {
      const found = document.querySelector(selector);
      if (found && found !== account && !found.closest("#mutify-auth-box")) {
        target = found;
        break;
      }
    }

    if (target) {
      target.appendChild(account);
      account.style.display = "inline-block";
    } else {
      account.style.position = "fixed";
      account.style.top = "12px";
      account.style.right = "12px";
      account.style.zIndex = "99998";
      document.body.appendChild(account);
    }
  }

  placeAccountButton();

  let signup = false;

  const title = document.getElementById("mutify-auth-title");
  const description = document.getElementById("mutify-auth-description");
  const form = document.getElementById("mutify-auth-form");
  const submit = document.getElementById("mutify-auth-submit");
  const switchButton = document.getElementById("mutify-auth-switch");
  const message = document.getElementById("mutify-auth-message");

  function say(text, error = false) {
    message.textContent = text;
    message.style.color = error ? "#c62828" : "#16834a";
  }

  function setMode() {
    title.textContent = signup ? "Create your Mutify account" : "Welcome to Mutify";
    description.textContent = signup
      ? "Create an account to shop on Mutify."
      : "Sign in to continue shopping.";
    submit.textContent = signup ? "Create Account" : "Sign In";
    switchButton.textContent = signup
      ? "Already registered? Sign In"
      : "Create an account";
    say("");
  }

  account.addEventListener("click", async () => {
    const { data, error } = await db.auth.getUser();

    if (error) {
      say(error.message, true);
    } else if (data.user) {
      signup = false;
      form.style.display = "none";
      submit.style.display = "none";
      title.textContent = "Your Mutify Account";
      description.textContent = data.user.email;
      switchButton.textContent = "Sign Out";
      say("You are signed in.");
    } else {
      form.style.display = "block";
      submit.style.display = "block";
      setMode();
    }

    overlay.style.display = "flex";
  });

  document.getElementById("mutify-auth-close").onclick = () => {
    overlay.style.display = "none";
  };

  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.style.display = "none";
  });

  switchButton.addEventListener("click", async () => {
    if (switchButton.textContent === "Sign Out") {
      const { error } = await db.auth.signOut();
      if (error) return say(error.message, true);
      location.reload();
      return;
    }

    signup = !signup;
    form.style.display = "block";
    submit.style.display = "block";
    setMode();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("mutify-auth-email").value.trim();
    const password = document.getElementById("mutify-auth-password").value;

    submit.disabled = true;
    submit.textContent = "Please wait...";

    let result;

    if (signup) {
      result = await db.auth.signUp({ email, password });
    } else {
      result = await db.auth.signInWithPassword({ email, password });
    }

    submit.disabled = false;
    submit.textContent = signup ? "Create Account" : "Sign In";

    if (result.error) {
      say(result.error.message, true);
      return;
    }

    if (signup && !result.data.session) {
      say("Account created! Please check your email to confirm your account.");
      return;
    }

    say("Successfully signed in!");
    setTimeout(() => location.reload(), 1000);
  });

  db.auth.onAuthStateChange((_event, session) => {
    account.textContent = session ? "My Account ✓" : "My Account";
  });

  db.auth.getUser().then(({ data }) => {
    account.textContent = data.user ? "My Account ✓" : "My Account";
  });
})();
  
