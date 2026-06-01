(function () {
  const root = document.getElementById("app");
  const data = window.EVENT_DATA;
  const savedUser = JSON.parse(localStorage.getItem("eventflow_user") || "null");
  const savedEvents = JSON.parse(localStorage.getItem("eventflow_events") || "null");

  const state = {
    page: "home",
    user: savedUser,
    venues: data.venues,
    organizers: data.organizers,
    clients: data.clients,
    events: savedEvents || data.events,
    selectedEventId: null,
    message: "",
    planner: {
      guests: 120,
      staff: 12
    },
    filters: {
      city: "",
      status: "",
      search: "",
      sort: "date"
    }
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("uk-UA") + " грн";
  }

  function findById(list, id) {
    return list.find((item) => item.id === id) || {};
  }

  function eventView(event) {
    const venue = findById(state.venues, event.venueId);
    const organizer = findById(state.organizers, event.organizerId);
    const client = findById(state.clients, event.clientId);

    return {
      ...event,
      venue: venue.name || event.venueId,
      city: venue.city || "",
      organizer: organizer.name || event.organizerId,
      client: client.name || event.clientId
    };
  }

  function setPage(page) {
    state.page = page;
    state.message = "";
    render();
  }

  function saveEvents() {
    localStorage.setItem("eventflow_events", JSON.stringify(state.events));
  }

  function render() {
    root.innerHTML = `
      <header class="topbar">
        <div class="brand">EventFlow Manager</div>
        <nav class="nav">
          ${navButton("home", "Головна")}
          ${navButton("events", "Події")}
          ${navButton("edit", "Редагування")}
        </nav>
        <div class="user-panel">
          ${state.user
            ? `<span class="muted">${escapeHtml(state.user.name)}</span><button data-action="logout">Вийти</button>`
            : `<button class="primary" data-page="login">Увійти</button>`}
        </div>
      </header>
      <main class="layout">${pageHtml()}</main>
    `;
    bindEvents();
  }

  function navButton(page, label) {
    return `<button class="${state.page === page ? "active" : ""}" data-page="${page}">${label}</button>`;
  }

  function pageHtml() {
    if (state.page === "events") return eventsPage();
    if (state.page === "edit") return editPage();
    if (state.page === "login") return loginPage();
    return homePage();
  }

  function homePage() {
    const totalBudget = state.events.reduce((sum, event) => sum + Number(event.budget || 0), 0);
    const totalCapacity = state.planner.guests + state.planner.staff;

    return `
      <div class="hero">
        <section>
          <h1>SPA для управління подіями</h1>
          <p class="muted">Система допомагає планувати заходи, контролювати майданчики, клієнтів, бюджети та відповідальних організаторів.</p>
          <div class="stats">
            ${stat(state.events.length, "Події")}
            ${stat(state.venues.length, "Майданчики")}
            ${stat(state.organizers.length, "Організатори")}
            ${stat(formatMoney(totalBudget), "Бюджет")}
          </div>
          <p><button class="primary" data-page="events">Перейти до подій</button></p>
        </section>
        <section>
          <h2>Компонент із власним станом</h2>
          <p class="muted">Мінікалькулятор рахує приблизну місткість залу для події.</p>
          <div class="counter">
            <div class="counter-output">
              <span class="muted">Потрібна місткість</span>
              <strong>${totalCapacity}</strong>
              <span>гостей і персоналу</span>
            </div>
            <button data-action="guests-minus">-10 гостей</button>
            <button data-action="guests-plus">+10 гостей</button>
            <button data-action="staff-plus">+2 персонал</button>
          </div>
        </section>
      </div>
    `;
  }

  function stat(value, label) {
    return `<div class="stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
  }

  function eventsPage() {
    const rows = state.events
      .map(eventView)
      .filter((event) => !state.filters.city || event.city === state.filters.city)
      .filter((event) => !state.filters.status || event.status === state.filters.status)
      .filter((event) => {
        const haystack = Object.values(event).join(" ").toLowerCase();
        return !state.filters.search || haystack.includes(state.filters.search.toLowerCase());
      })
      .sort((a, b) => String(a[state.filters.sort]).localeCompare(String(b[state.filters.sort]), "uk"));

    const cities = [...new Set(state.venues.map((venue) => venue.city))];
    const statuses = [...new Set(state.events.map((event) => event.status))];

    return `
      <section class="section">
        <div class="toolbar">
          <div>
            <h2>Події</h2>
            <p class="muted">Пошук, фільтрація та перегляд пов'язаних даних.</p>
          </div>
          <button class="primary" data-action="new-event">Нова подія</button>
        </div>
        <div class="grid" style="margin-bottom: 16px;">
          ${selectHtml("city", "Місто", cities, state.filters.city, "Усі")}
          ${selectHtml("status", "Статус", statuses, state.filters.status, "Усі")}
          <div>
            <label>Пошук</label>
            <input data-filter="search" value="${escapeHtml(state.filters.search)}" placeholder="Назва, клієнт, майданчик">
          </div>
          <div>
            <label>Сортування</label>
            <select data-filter="sort">
              ${option("date", "За датою", state.filters.sort)}
              ${option("title", "За назвою", state.filters.sort)}
              ${option("budget", "За бюджетом", state.filters.sort)}
              ${option("status", "За статусом", state.filters.sort)}
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Назва</th>
                <th>Тип</th>
                <th>Дата</th>
                <th>Місто</th>
                <th>Майданчик</th>
                <th>Організатор</th>
                <th>Клієнт</th>
                <th>Бюджет</th>
                <th>Статус</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows.map(eventRow).join("") : `<tr><td colspan="10">Подій не знайдено</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function selectHtml(name, label, values, selected, emptyLabel) {
    return `
      <div>
        <label>${label}</label>
        <select data-filter="${name}">
          <option value="">${emptyLabel}</option>
          ${values.map((value) => option(value, value, selected)).join("")}
        </select>
      </div>
    `;
  }

  function option(value, label, selected) {
    return `<option value="${escapeHtml(value)}" ${String(value) === String(selected) ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function eventRow(event) {
    return `
      <tr>
        <td>${escapeHtml(event.title)}</td>
        <td>${escapeHtml(event.type)}</td>
        <td>${escapeHtml(event.date)}</td>
        <td>${escapeHtml(event.city)}</td>
        <td>${escapeHtml(event.venue)}</td>
        <td>${escapeHtml(event.organizer)}</td>
        <td>${escapeHtml(event.client)}</td>
        <td>${escapeHtml(formatMoney(event.budget))}</td>
        <td><span class="badge">${escapeHtml(event.status)}</span></td>
        <td><button data-action="edit-event" data-id="${escapeHtml(event.id)}">Редагувати</button></td>
      </tr>
    `;
  }

  function loginPage() {
    return `
      <div class="auth-wrap">
        <form class="auth-card" data-form="login">
          <h1>Авторизація</h1>
          <p class="muted">Навчальний вхід: достатньо ввести будь-який логін і пароль.</p>
          <label>Логін</label>
          <input name="name" placeholder="manager">
          <label>Пароль</label>
          <input name="password" type="password" placeholder="1234">
          <p><button class="primary" type="submit">Увійти</button></p>
        </form>
      </div>
    `;
  }

  function editPage() {
    if (!state.user) {
      return `
        <section class="section">
          <h2>Редагування</h2>
          <div class="notice">Для редагування подій потрібно авторизуватись.</div>
          <button class="primary" data-page="login">Увійти</button>
        </section>
      `;
    }

    const event = state.events.find((item) => item.id === state.selectedEventId) || {
      id: "e" + Date.now(),
      title: "",
      type: "Конференція",
      date: "2026-07-10",
      venueId: state.venues[0].id,
      organizerId: state.organizers[0].id,
      clientId: state.clients[0].id,
      budget: 50000,
      status: "Планується",
      guests: 100
    };

    return `
      <section class="form-card">
        <h2>${state.selectedEventId ? "Редагування події" : "Нова подія"}</h2>
        ${state.message ? `<div class="notice success">${escapeHtml(state.message)}</div>` : ""}
        <form data-form="event" data-id="${escapeHtml(event.id)}">
          <div class="form-grid">
            ${input("title", "Назва події", event.title)}
            ${input("type", "Тип", event.type)}
            ${input("date", "Дата", event.date, "date")}
            ${input("budget", "Бюджет", event.budget, "number")}
            ${input("guests", "Кількість гостей", event.guests, "number")}
            ${formSelect("status", "Статус", ["Планується", "У роботі", "Підтверджено", "Завершено"], event.status)}
            ${formSelect("venueId", "Майданчик", state.venues.map((item) => [item.id, item.name]), event.venueId)}
            ${formSelect("organizerId", "Організатор", state.organizers.map((item) => [item.id, item.name]), event.organizerId)}
            ${formSelect("clientId", "Клієнт", state.clients.map((item) => [item.id, item.name]), event.clientId)}
          </div>
          <div class="actions">
            <button class="primary" type="submit">Зберегти</button>
            <button type="button" data-page="events">До списку</button>
            ${state.selectedEventId ? `<button class="danger" type="button" data-action="delete-event" data-id="${escapeHtml(event.id)}">Видалити</button>` : ""}
          </div>
        </form>
      </section>
    `;
  }

  function input(name, label, value, type = "text") {
    return `
      <div>
        <label>${label}</label>
        <input name="${name}" type="${type}" value="${escapeHtml(value)}">
      </div>
    `;
  }

  function formSelect(name, label, values, selected) {
    return `
      <div>
        <label>${label}</label>
        <select name="${name}">
          ${values.map((item) => {
            const value = Array.isArray(item) ? item[0] : item;
            const text = Array.isArray(item) ? item[1] : item;
            return option(value, text, selected);
          }).join("")}
        </select>
      </div>
    `;
  }

  function bindEvents() {
    root.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => setPage(button.dataset.page));
    });

    root.querySelectorAll("[data-filter]").forEach((field) => {
      field.addEventListener("input", () => {
        state.filters[field.dataset.filter] = field.value;
        render();
      });
      field.addEventListener("change", () => {
        state.filters[field.dataset.filter] = field.value;
        render();
      });
    });

    root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => handleAction(button));
    });

    const loginForm = root.querySelector('[data-form="login"]');
    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin);
    }

    const eventForm = root.querySelector('[data-form="event"]');
    if (eventForm) {
      eventForm.addEventListener("submit", handleEventSave);
    }
  }

  function handleAction(element) {
    const action = element.dataset.action;
    if (action === "logout") {
      localStorage.removeItem("eventflow_user");
      state.user = null;
      state.page = "home";
    }
    if (action === "guests-minus") {
      state.planner.guests = Math.max(0, state.planner.guests - 10);
    }
    if (action === "guests-plus") {
      state.planner.guests += 10;
    }
    if (action === "staff-plus") {
      state.planner.staff += 2;
    }
    if (action === "edit-event") {
      state.selectedEventId = element.dataset.id;
      state.page = "edit";
    }
    if (action === "new-event") {
      state.selectedEventId = null;
      state.page = "edit";
    }
    if (action === "delete-event") {
      state.events = state.events.filter((event) => event.id !== element.dataset.id);
      state.selectedEventId = null;
      state.message = "Подію видалено";
      saveEvents();
      state.page = "events";
    }
    render();
  }

  function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!name || !password) {
      alert("Заповніть логін і пароль");
      return;
    }

    state.user = { name };
    localStorage.setItem("eventflow_user", JSON.stringify(state.user));
    state.page = "events";
    render();
  }

  function handleEventSave(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextEvent = {
      id: form.dataset.id,
      title: String(formData.get("title") || "").trim(),
      type: String(formData.get("type") || "").trim(),
      date: String(formData.get("date") || ""),
      venueId: String(formData.get("venueId") || ""),
      organizerId: String(formData.get("organizerId") || ""),
      clientId: String(formData.get("clientId") || ""),
      budget: Number(formData.get("budget") || 0),
      status: String(formData.get("status") || "Планується"),
      guests: Number(formData.get("guests") || 0)
    };

    if (!nextEvent.title) {
      alert("Назва події обов'язкова");
      return;
    }

    const exists = state.events.some((item) => item.id === nextEvent.id);
    state.events = exists
      ? state.events.map((item) => item.id === nextEvent.id ? nextEvent : item)
      : [...state.events, nextEvent];
    state.selectedEventId = nextEvent.id;
    state.message = "Дані події збережено";
    saveEvents();
    render();
  }

  render();
})();
