
(() => {
  const supabase = window.mutifySupabase;

  if (!supabase) {
    console.error("Mutify: Supabase connection not found.");
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    #mutify-account {
      background:#16834a;color:white;border:0;border-radius:25px;
      padding:11px 20px;font-weight:bold;cursor:pointer;
    }
    #mutify-auth-overlay {
      position:fixed;inset:0;background:#0009;z-index:99999;
      display:none;align-items:center;justify-content:center;padding:20px;
    }
    #mutify-auth-box {
      background:white;color:#17251c;width:100%;max-width:380px;
      padding:25px;border-radius:18px;font-family:Arial,sans-serif;
      box-sizing:border-box;
    }
    #mutify-auth-box input {
      width:100%;padding:13px;margin:8px 0;
      border:1px solid #ddd;border-radius:9px;box-sizing:border-box;
    }
    #mutify-auth-box button {
      padding:12px;border:0;border-radius:9px;cursor:pointer;
      margin-top:10px;font-weight:bold;
    }
    #mutify-auth-submit {background:#16834a;color:white;width:100%;}
    #mutify-auth-switch {background:#e9f5ed;color:#16834a;width:100%;}
    #mutify-auth-close {float:right;background:#eee;}
    #mutify-auth-message {font-size:13px;line-height:1.5;margin-top:12px;}
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.id = "mutify-account";
  button.textContent = "My Account";

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
          placeholder="Password (at least 6 characters)"
          minlength="6" required>
        <button id="mutify-auth-submit" type="submit">Sign In</button>
      </form>
      <button id="mutify-auth-switch">Create an account</button>
      <p id="mutify-auth-message" aria-live="polite"></p>
    </div>
  `;

  document.body.append(button, overlay);

  let signupMode = false;

  const title = document.getElementById("mutify-auth-title");
  const description = document.getElementById("mutify-auth-description");
  const submit = document.getElementById("mutify-auth-submit");
  const switchButton = document.getElementById("mutify-auth-switch");
  const message = document.getElementById("mutify-auth-message");
  const form = document.getElementById("mutify-auth-form");

  function showMessage(text, error = false) {
    message.textContent = text;
    message.style.color = error ? "#c62828" : "#16834a";
  }

  function updateMode() {
    title.textContent = signupMode ? "Create your Mutify account" : "Welcome to Mutify";
    description.textContent = signupMode
      ? "Join Mutify to shop and discover products."
      : "Sign in to continue.";
    submit.textContent = signupMode ? "Create Account" : "Sign In";
    switchButton.textContent = signupMode
      ? "Already have an account? Sign in"
      : "Create an account";
    showMessage("");
  }

  button.addEventListener("click", async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      showMessage("Signed in as " + data.user.email);
      signupMode = false;
      updateMode();
      title.textContent = "Your Mutify account";
      description.textContent = data.user.email;
      submit.style.display = "none";
      form.style.display = "none";
      switchButton.textContent = "Sign Out";
      switchButton.onclick = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) return showMessage(error.message, true);
        location.reload();
      };
    } else {
      signupMode = false;
      updateMode();
      form.style.display = "block";
      submit.style.display = "block";
      switchButton.onclick = null;
    }

    overlay.style.display = "flex";
  });

  document.getElementById("mutify-auth-close").addEventListener("click", () => {
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.style.display = "none";
  });

  switchButton.addEventListener("click", () => {
    if (switchButton.textContent === "Sign Out") return;
    signupMode = !signupMode;
    form.style.display = "block";
    submit.style.display = "block";
    switchButton.onclick = null;
    updateMode();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("mutify-auth-email").value.trim();
    const password = document.getElementById("mutify-auth-password").value;

    submit.disabled = true;
    submit.textContent = "Please wait...";
    showMessage("");

    const result = signupMode
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    submit.disabled = false;
    submit.textContent = signupMode ? "Create Account" : "Sign In";

    if (result.error) {
      showMessage(result.error.message, true);
      return;
    }

    if (signupMode && !result.data.session) {
      showMessage("Account created! Check your email to confirm your account.");
      return;
    }

    showMessage("Successfully signed in!");
    setTimeout(() => location.reload(), 1000);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    button.textContent = session ? "My Account ✓" : "My Account";
  });
})();
          
