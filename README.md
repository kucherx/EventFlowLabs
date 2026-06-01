# EventFlow Manager

Навчальний вебдодаток з теми "Івент-менеджмент".

## Локальний запуск через XAMPP

1. Скопіювати папку `EventFlowSite` у `C:\xampp\htdocs`.
2. Запустити Apache в XAMPP.
3. Відкрити `http://localhost/EventFlowSite/`.

## Локальний запуск через BAT

Запустити файл `start_site.bat` і відкрити `http://localhost:8080/`.

## Docker

```bash
docker build -t eventflow-site .
docker run --rm -p 8080:80 eventflow-site
```

Після запуску сайт буде доступний за адресою `http://localhost:8080/`.

## Дані

Сайт не потребує MySQL. Демонстраційні дані зберігаються у `data.js`, а зміни користувача - у `localStorage`.
