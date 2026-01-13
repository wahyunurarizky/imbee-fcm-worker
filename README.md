# Imbee FCM Worker

FCM Worker adalah service berbasis **Node.js + TypeScript** yang berfungsi untuk:

- Menerima message dari **RabbitMQ** (FCM queue)
- Melakukan **validasi payload**
- Mengirim push notification (FCM)
- Mencatat hasil delivery ke **database**
- Mengirim event **`notification.done`** ke RabbitMQ

Service ini dibuat **mengikuti spesifikasi PDF test** yang diberikan.

---

## 🚀 Recommended: Run with Docker Compose

**Docker Compose sangat direkomendasikan** karena:

- RabbitMQ & MySQL otomatis tersedia
- Environment konsisten
- Mudah direview
- Mendukung End-to-End (E2E) testing
- Menghindari konflik port lokal

### Prerequisite

- Docker
- Docker Compose

### Menjalankan Aplikasi

```bash
docker compose up --build
```

Service yang akan berjalan:

- `app` → FCM Worker
- `mysql` → Database
- `rabbitmq` → Message broker

---

## 📦 Environment Variables

| Variable                 | Keterangan                               |
| ------------------------ | ---------------------------------------- |
| `RABBITMQ_URL`           | URL koneksi RabbitMQ                     |
| `RABBITMQ_FCM_QUEUE`     | Queue untuk menerima FCM job             |
| `RABBITMQ_DONE_EXCHANGE` | Exchange untuk event `notification.done` |
| `MOCK_FCM`               | Mode mock FCM (`true / false`)           |
| `DB_HOST`                | Host MySQL                               |
| `DB_PORT`                | Port MySQL                               |
| `DB_USER`                | User DB                                  |
| `DB_PASSWORD`            | Password DB                              |
| `DB_NAME`                | Nama database                            |

---

## 🧪 MOCK_FCM Mode

### Apa itu `MOCK_FCM`?

Jika:

```env
MOCK_FCM=true
```

Maka:

- **Tidak benar-benar mengirim FCM ke Firebase**
- Worker akan **mensimulasikan pengiriman berhasil**

Jika:

```env
MOCK_FCM=false
```

Maka:

- Akan menggunakan **Firebase Admin SDK**
- Membutuhkan credential Firebase yang valid

---

## 🧱 Message Format (Sesuai PDF)

Message yang dikirim ke queue `notification.fcm`:

```json
{
  "identifier": "fcm-msg-a1beff5ac",
  "type": "device",
  "deviceId": "string",
  "text": "Notification message"
}
```

### Validasi Message

Worker akan:

1. Decode JSON
2. Memastikan **4 field wajib ada** dan bertipe `string`
3. **ACK dilakukan setelah validasi sukses**
   (sesuai instruksi PDF)

---

## 📤 Event Output: `notification.done`

Jika proses berhasil:

- Worker akan publish ke exchange **`notification.done`**
- Exchange bertipe **fanout**
- Payload:

```json
{
  "identifier": "fcm-msg-a1beff5ac",
  "deliverAt": "2026-01-13T16:30:21.123Z"
}
```

Semua queue yang bind ke exchange ini akan menerima event.

---

## 🗄️ Database Persistence

Tabel: **`fcm_jobs`**

| Column       | Keterangan                  |
| ------------ | --------------------------- |
| `id`         | Primary key                 |
| `identifier` | Identifier notification     |
| `deliverAt`  | Timestamp delivery berhasil |

---

## 🔍 Cara Review & Validasi (Manual via Docker CLI)

### 1️⃣ Cek Queue RabbitMQ

```bash
docker compose exec rabbitmq rabbitmqctl list_queues
```

Pastikan:

- Queue `notification.fcm` ada

---

### 2️⃣ Publish Message Manual

```bash
docker compose exec rabbitmq rabbitmqadmin publish \
  routing_key=notification.fcm \
  payload='{"identifier":"manual-test-1","type":"device","deviceId":"mock","text":"Hello"}'
```

---

### 3️⃣ Validasi Event `notification.done`

Cek binding exchange:

```bash
docker compose exec rabbitmq rabbitmqctl list_bindings
```

Pastikan exchange `notification.done` memiliki binding ke queue.

---

### 4️⃣ Cek Database (MySQL)

Masuk ke container MySQL:

```bash
docker compose exec mysql mysql -u root -p"secret"
```

Pilih database:

```sql
USE imbee;
```

Cek data:

```sql
SELECT * FROM fcm_job ORDER BY deliverAt DESC;
```

Jika data muncul → **end-to-end flow sukses**

---

## 🧪 End-to-End Test (E2E)

### Menjalankan E2E Test

```bash
docker compose exec app npm run test:e2e
```

Test akan:

- Publish message ke RabbitMQ
- Menunggu worker memproses
- Memastikan data tersimpan di database

---

## 🖥️ Menjalankan Tanpa Docker (Manual)

⚠️ **Tidak direkomendasikan**, tapi memungkinkan.

### Prerequisite

- Node.js ≥ 18
- MySQL
- RabbitMQ

### Langkah Manual

1. Install dependency

```bash
npm install
```

2. Buat `.env`

```env
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_FCM_QUEUE=notification.fcm
RABBITMQ_DONE_EXCHANGE=notification.done
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=imbee
MOCK_FCM=true
```

3. Build & run

```bash
npm run build
npm start
```
