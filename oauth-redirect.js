/* GitHub Pages OAuth relay -> desktop localhost listener. */
(function () {
  // Must match WFM_XERO_LOCAL_RELAY_URI in WFMAdmin .env.
  var LOCAL_RELAY_URL = "http://127.0.0.1:8766/wfm/callback";

  function show(el, on) {
    if (el) el.style.display = on ? "block" : "none";
  }

  function decodePart(s) {
    if (s == null || s === "") return s;
    try {
      return decodeURIComponent(s.replace(/\+/g, " "));
    } catch (e) {
      return s;
    }
  }

  function parseOAuthQuery(search) {
    var q = search.charAt(0) === "?" ? search.slice(1) : search;
    var code = null;
    var state = "";
    try {
      var sp = new URLSearchParams(q);
      code = sp.get("code");
      state = sp.get("state") || "";
    } catch (e) {}
    if (!code && q.indexOf("code=") !== -1) {
      var cm = /(?:^|&)code=([^&]*)/.exec(q);
      if (cm) code = decodePart(cm[1]);
    }
    if ((!state || state === "") && q.indexOf("state=") !== -1) {
      var sm = /(?:^|&)state=([^&]*)/.exec(q);
      if (sm) state = decodePart(sm[1]) || "";
    }
    return { code: code, state: state || "" };
  }

  function run() {
    var statusEl = document.getElementById("status");
    var fallbackEl = document.getElementById("fallback");
    var fullUrlEl = document.getElementById("fullUrl");
    var copyBtn = document.getElementById("btnCopyFullUrl");
    var href = window.location.href;
    var search = window.location.search || "";

    function setStatus(msg, cls) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = cls || "muted";
    }

    function copyText(txt) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt);
      } else {
        window.prompt("Copy:", txt);
      }
    }

    function fallback(msg, cssClass) {
      setStatus(msg, cssClass || "warn");
      if (fullUrlEl) fullUrlEl.value = href;
      if (copyBtn) {
        copyBtn.onclick = function () {
          copyText(href);
          copyBtn.textContent = "Copied";
          setTimeout(function () {
            copyBtn.textContent = "Copy full URL";
          }, 1200);
        };
      }
      show(fallbackEl, true);
    }

    try {
      var parsed = parseOAuthQuery(search);
      var code = parsed.code;
      var state = parsed.state;
      if (!code && href.indexOf("code=") !== -1) {
        var qi = href.indexOf("?");
        if (qi >= 0) {
          parsed = parseOAuthQuery(href.slice(qi));
          code = parsed.code;
          state = parsed.state;
        }
      }

      if (!code) {
        fallback("No OAuth code found in redirect URL.", "err");
        return;
      }

      var relay =
        LOCAL_RELAY_URL +
        "?code=" +
        encodeURIComponent(code) +
        "&state=" +
        encodeURIComponent(state || "");
      setStatus("Handing off to desktop app…", "muted");

      // Start fallback timer in case local app listener is not available.
      setTimeout(function () {
        fallback("Could not auto-open local app callback. Ensure the app is running, then retry sign-in.", "warn");
      }, 1800);

      // Forward to local relay.
      window.location.replace(relay);
    } catch (err) {
      fallback("Script error: " + String(err), "err");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
      show(boot, false);
      var parsed = parseOAuthQuery(search);
      var code = parsed.code;
      var state = parsed.state;
      if (!code && href.indexOf("code=") !== -1) {
        var qi = href.indexOf("?");
        if (qi >= 0) {
          parsed = parseOAuthQuery(href.slice(qi));
          code = parsed.code;
          state = parsed.state;
        }
      }

      var fullUrlEl = document.getElementById("fullUrl");
      var urlRow = document.getElementById("urlRow");
      var btnFull = document.getElementById("btnFullUrl");
      if (fullUrlEl) fullUrlEl.value = href;
      show(urlRow, true);
      if (btnFull) {
        btnFull.onclick = function () {
          copy(href, btnFull, "Copied");
        };
      }

      if (!code) {
        show(bad, true);
        bad.innerHTML =
          "No <code>code</code> in URL. Use <strong>Copy full URL</strong> below → paste in the app.";
        return;
      }

      var payload = JSON.stringify({ code: code, state: state }, null, 2);
      document.getElementById("jsonPreview").textContent = payload;
      show(ok, true);

      document.getElementById("btnCopyApp").onclick = function () {
        copy(payload, this, "Copied");
      };
    } catch (err) {
      show(boot, false);
      show(bad, true);
      bad.textContent = "Script error: " + String(err);
      show(document.getElementById("urlRow"), true);
      var fu = document.getElementById("fullUrl");
      if (fu) fu.value = href;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
