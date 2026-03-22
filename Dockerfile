# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json yarn.lock* ./

# Устанавливаем зависимости
RUN npm ci || yarn install

# Копируем все исходники
COPY . .

# Собираем приложение 
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Удаляем дефолтную страницу nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранные файлы из первого этапа
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем наш кастомный конфиг nginx, чтобы работал React Router (try_files)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
