# Используем официальный bun образ (последняя версия)
FROM oven/bun:latest

WORKDIR /app

# Копируем package.json, bun.lock и остальные файлы
COPY package.json ./
COPY bun.lock ./

# Устанавливаем зависимости через bun
RUN bun install

# Генерируем призму через bunx
RUN bunx prisma generate

# Копируем весь проект
COPY . .

# Собираем проект, если есть сборка (если не нужен - можно убрать)
RUN bun run build

# Открываем порт 3000
EXPOSE 3000

# Запускаем в dev режиме (замени команду, если нужно)
CMD ["bun", "run", "dev"]
