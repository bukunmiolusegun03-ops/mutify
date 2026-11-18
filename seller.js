
(() => {
  const db = window.mutifySupabase;

  if (!db) {
    console.error("Mutify: Supabase is not connected.");
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    #mutify-seller-button {
      background:#e8f5ec;
      color:#16834a;
      border:1px solid #16834a;
      border-radius:25px;
      padding:10px 14px;
      font-weight:bold;
      cursor:pointer;
      margin:4px;
    }
    #mutify-seller-overlay {
      display:none;
      position:fixed;
      inset:0;
      z-index:1000000;
      background:#0009;
      align-items:center;
      justify-content:center;
      padding:16px;
    }
    #mutify-seller-box {
      background:white;
      color:#17251c;
      width:100%;
      max-width:430px;
      max-height:90vh;
      overflow:auto;
      padding:24px;
      border-radius:18px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
    }
    #mutify-seller-box input,
    #mutify-seller-box textarea {
      display:block;
      width:100%;
      box-sizing:border-box;
      padding:13px;
      margin:10px 0;
      border:1px solid #ddd;
      border-radius:9px;
      font:inherit;
    }
    #mutify-seller-box textarea {
      min-height:100px;
      resize:vertical;
    }
    #mutify-seller-submit {
      width:100%;
      background:#16834a;
      color:white;
      border:0;
      padding:14px;
      border-radius:9px;
      font-weight:bold;
      cursor:pointer;
    }
    #mutify-seller-close {
      float:right;
      border:0;
      background:#eee;
      padding:8px 12px;
      border-radius:8px;
      cursor:pointer;
    }
    #mutify-seller-message {
      font-size:14px;
      line-height:1.5;
    }
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.id = "mutify-seller-button";
  button.textContent = "Become a Seller";

  const overlay = document.createElement("div");
  overlay.id = "mutify-seller-overlay";
  overlay.innerHTML = `
    <div id="mutify-seller-box">
      <button type="button" id="mutify-seller-close">✕</button>
      <h2>Open your Mutify shop</h2>
      <p>Apply to become a seller. Mutify reviews applications before shops can sell.</p>

      <form id="mutify-seller-form">
        <label for="mutify-shop-name">Shop name</label>
        <input id="mutify-shop-name" maxlength="60"
          placeholder="e.g. Bukunmi's Store" required>

        <label for="mutify-shop-description">What will your shop sell?</label>
        <textarea id="mutify-shop-description" maxlength="500"
          placeholder="Describe your shop and products" required></textarea>

        <label for="mutify-shop-email">Contact email</label>
        <input id="mutify-shop-email" type="email"
          placeholder="Shop contact email" required>

        <button id="mutify-seller-submit" type="submit">
          Submit application
        </button>
      </form>

      <p id="mutify-seller-message" aria-live="polite"></p>
    </div>
  `;

  document.body.appendChild(overlay);

  const header = document.querySelector(".header-actions");
  const accountButton = document.getElementById("mutify-account");

  if (header) {
    if (accountButton && accountButton.parentElement === header) {
      accountButton.insertAdjacentElement("afterend", button);
    } else {
      header.appendChild(button);
    }
  } else {
    button.style.position = "fixed";
    button.style.top = "58px";
    button.style.right = "12px";
    button.style.zIndex = "99998";
    document.body.appendChild(button);
  }

  const form = document.getElementById("mutify-seller-form");
  const submit = document.getElementById("mutify-seller-submit");
  const message = document.getElementById("mutify-seller-message");

  function showMessage(text, error = false) {
    message.textContent = text;
    message.style.color = error ? "#c62828" : "#16834a";
  }

  button.addEventListener("click", () => {
    overlay.style.display = "flex";
    showMessage("");
  });

  document.getElementById("mutify-seller-close").addEventListener("click", () => {
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.style.display = "none";
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    submit.disabled = true;
    submit.textContent = "Submitting...";

    try {
      const { data: userData, error: userError } = await db.auth.getUser();

      if (userError || !userData.user) {
        showMessage("Please create an account or sign in before applying.", true);
        return;
      }

      const user = userData.user;

      const { data: existing, error: lookupError } = await db
        .from("shops")
        .select("shop_name,status")
        .eq("owner_id", user.id);

      if (lookupError) throw lookupError;

      const activeApplication = (existing || []).find(shop =>
        ["pending", "approved", "suspended"].includes(shop.status)
      );

      if (activeApplication) {
        showMessage(
          activeApplication.status === "pending"
            ? "Your application is already awaiting review."
            : activeApplication.status === "approved"
              ? "You already have an approved Mutify shop."
              : "Your shop is currently suspended. Please contact Mutify support."
        );
        return;
      }

      const shopName = document.getElementById("mutify-shop-name").value.trim();
      const description = document.getElementById("mutify-shop-description").value.trim();
      const contactEmail = document.getElementById("mutify-shop-email").value.trim();

      const slugBase = shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);

      const slug = `${slugBase}-${user.id.slice(0, 8)}`;

      const { error: insertError } = await db
        .from("shops")
        .insert({
          owner_id: user.id,
          shop_name: shopName,
          slug,
          description,
          contact_email: contactEmail,
          status: "pending"
        });

      if (insertError) throw insertError;

      form.reset();
      showMessage("Application submitted! Your shop is pending admin approval.");
    } catch (error) {
      console.error("Seller application error:", error);
      showMessage(error.message || "We couldn't submit your application. Please try again.", true);
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit application";
    }
  });
})();
