FROM node:18-alpine

WORKDIR /app

# Install dependencies terlebih dahulu (memanfaatkan cache layer)
COPY package*.json ./
RUN npm install

# Copy seluruh source code backend
COPY . .

# Jika Anda menggunakan Prisma, pastikan client digenerate saat build image
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]