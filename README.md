# Гайд по шаблону

## 🚀 Быстрый старт

Склонируйте репозиторий и установите зависимости:

```bash
# 1. Клонировать репозиторий
git clone <ссылка_на_ваш_репозиторий>

# 2. Перейти в папку проекта
cd hackathon-frontend-template-v3

# 3. Установить зависимости
npm install

# 4. Запустить проект в режиме разработки
npm run dev
```

## Как поменять хост backend

Хост задается как константа в `vite.config.ts`:

- `__API__`: базовый URL backend
- `__API_LOGGING__`: включение логирования API

Измените значение `__API__` и перезапустите dev-сервер.

## Методология

В проекте используется FSD-подобная структура: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.

### App

`app` — глобальные конструкции приложения: провайдеры, роутинг, темы, глобальные стили, типы.

```text
app/
  providers/
    ErrorBoundary/
    StoreProvider/
    router/
  styles/
    providers/
    themes/
    globalStyles.ts
  types/
```

#### Providers

- `ErrorBoundary` — перехват ошибок в React-дереве.
- `StoreProvider` — настройка Redux Toolkit и RTK Query middleware.
- `router` — конфигурация маршрутов и защита приватных роутов.

#### Styles

- `styled-components` темы (`light`, `dark`, `baseTheme`).
- глобальные стили приложения.

### Pages

Страницы приложения (`Login`, `Register`, `MainPage`, `NotFoundPage`).

### Widgets

Крупные переиспользуемые блоки:

- `Page` — обертка страницы с сохранением скролла.
- `PageLoader` — индикатор загрузки страницы.
- `PageError` — отображение критической ошибки.

### Features

Функциональные пользовательские возможности:

- `LanguageSwitcher`
- `ThemeSwitcher`
- `UI` (тема + scroll state)

### Entities

Доменные сущности (сейчас в основном `User`):

- `api/` — endpoints для RTK Query
- `model/` — types + slice
- `lib/` — токен-хелперы (`authToken.ts`)

### Shared

Общие модульные зависимости проекта:

```text
shared/
  api/
  config/
    i18n/
  consts/
  lib/
    components/DynamicModuleLoader/
    hooks/
    logger/
    store/
  types/
  ui/
    AppImage/
    Loader/
    Portal/
    Stack/
```

#### i18n

Локализация уже настроена (`public/locales/en`, `public/locales/ru`).

#### lib

- `DynamicModuleLoader` — динамическая подгрузка reducers.
- `hooks` — `useAppDispatch`, `useAppSelector`, `useDebounce`, `useThrottling`, `useInfiniteScroll`, `useHover`, `useDispatchedActions`.
- `store` — `buildSlice` и `buildSelector`.
- `logger` — централизованный логгер API.

#### UI

Базовые компоненты UI-kit:

- `AppImage`
- `Loader`
- `Portal`
- `Stack` (`Flex`, `HStack`, `VStack`)

## Что уже реализовано для хакатона

- Реальные API-запросы для auth вместо заглушек.
- `Authorization` заголовок в централизованном API-слое.
- Авто-logout и редирект на `/login` при `401`.
- Запрос данных главной страницы (`GET /main`).
- Логирование всех API-запросов и ответов (RTK Query + Axios).

## Команды

```bash
npm run dev
npm run build
npm run lint
```

## Документация

- `docs/BACKEND_INTEGRATION_SPEC.md` — полный контракт для backend.
- `docs/API_MIGRATION_CHECKLIST.md` — чеклист миграции API и ручной проверки.
- `docs/ARCHITECTURE_REVIEW.md` — обзор архитектуры и рекомендации.
- `docs/FIGMA_AI_SETUP.md` — как использовать Figma AI под эту заготовку.
