# ---------- Build ----------
FROM node:24-alpine AS builder

WORKDIR /app

# Activer Yarn via Corepack
RUN corepack enable

# Dépendances
COPY package.json yarn.lock ./
RUN yarn install --immutable

# Code source
COPY . .

# Build Vite
RUN yarn build

# ---------- Production avec Nginx ----------
FROM nginx:alpine

# Supprimer la config par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier le build Vite dans le dossier Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier une config Nginx custom (optionnel) configuration personnalisé
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]