# ROSA Cockpit Desktop (Electron)

Готовая обертка, которая открывает ваш локальный Cockpit (`https://192.168.122.247:9090`) как desktop-приложение.

## Что это делает

- запускает окно Electron с вашим Cockpit;
- разрешает self-signed TLS сертификат **только** для `https://192.168.122.247:9090`;
- блокирует навигацию на посторонние URL внутри окна (открывает их во внешнем браузере);
- умеет собрать установочные пакеты Linux (`AppImage`, `rpm`, `deb`).

## 1) Установка зависимостей

```bash
npm install
```

## 2) Локальный запуск

```bash
npm run start
```

Если Cockpit на другом адресе, передайте URL через переменную окружения:

```bash
COCKPIT_URL="https://10.0.0.5:9090" npm run start
```

## 3) Сборка установщика

```bash
npm run dist
```

Результат будет в `dist/`.

## 4) Установка Cockpit на сервере (если нужно)

Проверьте, что сервис активен:

```bash
sudo systemctl enable --now cockpit.socket
sudo systemctl status cockpit.socket
```

## Безопасность

- По умолчанию включено доверие к self-signed сертификату **только** для `192.168.122.247:9090`.
- Чтобы запретить любые исключения сертификатов, запускайте:

```bash
ALLOW_INSECURE_LOCAL_CERT=0 npm run start
```

- Если после логина Cockpit делает редирект на hostname (например `rosa-sm2qtm:9090`), можно явно разрешить хосты:

```bash
COCKPIT_EXTRA_ALLOWED_HOSTS="192.168.122.247,rosa-sm2qtm" npm run start
```

- Если у вас нестандартный порт Cockpit:

```bash
COCKPIT_PORT=9090 npm run start
```

## Типовой workflow для вашего случая

1. Администрируете сервер как обычно через Cockpit в Electron-окне.
2. Логин/пароль остается штатным (как в браузере).
3. Все модули Cockpit (Storage, Network, Services, Podman и т.д.) открываются так же, как в браузере.

## Если после авторизации белый экран

Обычно это из-за слишком строгой фильтрации URL в desktop-обертке. В этой версии исправлено:
- разрешены `https://*/:9090` и внутренние `about:/data:/blob:` переходы;
- убрана лишняя модификация security headers;
- добавлен вывод `did-fail-load` в консоль Electron для диагностики.
