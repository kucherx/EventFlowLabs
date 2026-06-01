window.EVENT_DATA = {
  venues: [
    { id: "v1", name: "КВЦ Парковий", city: "Київ", capacity: 900 },
    { id: "v2", name: "!FESTrepublic", city: "Львів", capacity: 1200 },
    { id: "v3", name: "UNIT.City Hall", city: "Київ", capacity: 420 },
    { id: "v4", name: "Одеська кіностудія", city: "Одеса", capacity: 650 }
  ],
  organizers: [
    { id: "o1", name: "Анна Клименко", role: "Координатор" },
    { id: "o2", name: "Максим Бондар", role: "Продюсер" },
    { id: "o3", name: "Софія Левчук", role: "PR-менеджер" }
  ],
  clients: [
    { id: "c1", name: "NovaTech", contact: "events@novatech.ua" },
    { id: "c2", name: "Green Future NGO", contact: "hello@greenfuture.ua" },
    { id: "c3", name: "Urban Culture Hub", contact: "hub@urban.ua" }
  ],
  events: [
    {
      id: "e1",
      title: "Tech Leadership Forum",
      type: "Конференція",
      date: "2026-06-12",
      venueId: "v1",
      organizerId: "o1",
      clientId: "c1",
      budget: 185000,
      status: "Планується",
      guests: 520
    },
    {
      id: "e2",
      title: "Green City Weekend",
      type: "Фестиваль",
      date: "2026-06-20",
      venueId: "v2",
      organizerId: "o2",
      clientId: "c2",
      budget: 240000,
      status: "У роботі",
      guests: 980
    },
    {
      id: "e3",
      title: "Creative Networking Night",
      type: "Нетворкінг",
      date: "2026-06-27",
      venueId: "v3",
      organizerId: "o3",
      clientId: "c3",
      budget: 78000,
      status: "Підтверджено",
      guests: 260
    },
    {
      id: "e4",
      title: "Cinema Brand Launch",
      type: "Презентація",
      date: "2026-07-04",
      venueId: "v4",
      organizerId: "o1",
      clientId: "c1",
      budget: 132000,
      status: "Планується",
      guests: 410
    }
  ]
};
