(function () {
  var root = document.querySelector(".VisitorStats");
  if (!root) return;

  var statsUrl = root.dataset.statsUrl;
  var mapUrl = root.dataset.mapUrl;
  var total = root.querySelector("[data-stats-total]");
  var countries = root.querySelector("[data-stats-countries]");
  var updated = root.querySelector("[data-stats-updated]");
  var map = root.querySelector("[data-stats-map]");
  var list = root.querySelector("[data-stats-country-list]");

  function formatNumber(value) {
    return new Intl.NumberFormat().format(value);
  }

  function renderMap(countryStats) {
    return fetch(mapUrl)
      .then(function (response) {
        if (!response.ok) throw new Error("Map unavailable");
        return response.text();
      })
      .then(function (svgText) {
        map.innerHTML = svgText;
        var svg = map.querySelector("svg");
        var maximum = countryStats.reduce(function (value, item) {
          return Math.max(value, item.count);
        }, 0);
        var byId = {};
        countryStats.forEach(function (item) {
          byId[String(item.id).toLowerCase()] = item;
        });
        Object.keys(byId).forEach(function (id) {
          var country = svg.querySelector("#" + CSS.escape(id));
          if (!country) return;
          var count = byId[id].count;
          var intensity = maximum ? 0.3 + 0.7 * Math.sqrt(count / maximum) : 0.3;
          country.style.fill = "rgba(49, 90, 114, " + intensity.toFixed(3) + ")";
          country.dataset.visitors = count;
          country.setAttribute("title", byId[id].name + ": " + formatNumber(count));
        });
      });
  }

  fetch(statsUrl)
    .then(function (response) {
      if (!response.ok) throw new Error("Statistics unavailable");
      return response.json();
    })
    .then(function (data) {
      var countryStats = Array.isArray(data.countries) ? data.countries : [];
      total.textContent = formatNumber(data.total || 0);
      countries.textContent = formatNumber(countryStats.length);
      if (data.updated_at) {
        updated.textContent = "Updated " + new Date(data.updated_at).toLocaleDateString();
      }
      countryStats.slice(0, 5).forEach(function (item) {
        var entry = document.createElement("li");
        entry.textContent = item.name + ": " + formatNumber(item.count);
        list.appendChild(entry);
      });
      return renderMap(countryStats);
    })
    .catch(function () {
      map.innerHTML = "<p>Visitor statistics will appear after the first update.</p>";
      updated.textContent = "Statistics temporarily unavailable";
    });
})();
