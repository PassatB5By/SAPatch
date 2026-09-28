# GitHub Access Gateway для отзывов без аккаунта GitHub

Этот шлюз позволяет пользователям, у которых **нет аккаунта GitHub**, оставлять отзывы прямо на сайте [passatb5by.github.io/SAPatch](https://passatb5by.github.io/SAPatch/).

При отправке формы:
1. Пользователь обязательно указывает свой контакт: **Email**, **VK (ВКонтакте)** или **Discord**.
2. Шлюз принимает данные и через **GitHub Access Token** публикует Issue в репозиторий `PassatB5By/SAPatch` с тегом `review`.
3. GitHub Actions (`close-reviews.yml`) автоматически верифицирует его, оставляет ответ с благодарностью, закрывает тикет, и отзыв мгновенно отображается на сайте в блоке отзывов!

---

## Вариант 1: Запуск на вашем хостинге `pixelsmith.ru` (PHP 8.5) — Рекомендуется

Файл `review.php` готов к работе:
1. Создайте токен доступа GitHub:
   - Перейдите в GitHub: **Settings ➔ Developer Settings ➔ Personal access tokens ➔ Fine-grained tokens** (или обычный Tokens classic).
   - Выберите репозиторий `PassatB5By/SAPatch`.
   - В правах (Permissions) укажите: **Issues: Read and write**.
   - Нажмите **Generate token** и скопируйте его.
2. В файле `review.php`:
   - Вставьте токен в строку:
     ```php
     $GITHUB_TOKEN = getenv('GITHUB_TOKEN') ?: 'ВАШ_ТОКЕН_ЗДЕСЬ';
     ```
3. Загрузите файл на хостинг `pixelsmith.ru` по пути:
   `https://pixelsmith.ru/api/review.php`

---

## Вариант 2: Запуск через Cloudflare Workers (Бесплатно)

Если не хотите задействовать свой PHP-сервер:
1. Зарегистрируйтесь на [cloudflare.com](https://dash.cloudflare.com/) (бесплатный тариф: 100 000 запросов в день).
2. Создайте новый Worker, вставьте код из `worker.js`.
3. В **Settings ➔ Variables and Secrets** добавьте переменную `GITHUB_TOKEN` со значением вашего GitHub токена.
4. Скопируйте полученный адрес воркера (например, `https://sapatcher-reviews.yourname.workers.dev`) и укажите его в `app.js` в константе `GUEST_REVIEW_API`.
