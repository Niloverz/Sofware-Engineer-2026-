## 🔑 Cara Mendapatkan Kredensial

### 1. Google OAuth

**Langkah-langkah:**

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru (atau pilih project yang sudah ada)
3. Di sidebar kiri, klik **APIs & Services** → **Credentials**
4. Klik **+ Create Credentials** → **OAuth Client ID**
5. Pilih **Web application**
6. Isi:
   - **Name**: `OAuth Demo` (atau terserah)
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/auth/callback`
7. Klik **Create**
8. Copy **Client ID** dan **Client Secret**

> **Catatan:** Untuk Google, redirect URI menggunakan `/auth/callback` (tanpa `/google`).

---

### 2. GitHub OAuth

**Langkah-langkah:**

1. Buka GitHub → Klik foto profil (kanan atas) → **Settings**
2. Scroll ke bawah → **Developer settings** (di bagian kiri)
3. Klik **OAuth Apps** → **New OAuth App**
4. Isi:
   - **Application name**: `OAuth Demo`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
5. Klik **Register application**
6. Copy **Client ID** dan **Client Secret** (klik **Generate new client secret**)

> **Catatan:** Simpan Client Secret di tempat aman, karena hanya muncul sekali.

---

### 3. Facebook OAuth

**Langkah-langkah:**

1. Buka [Facebook Developers](https://developers.facebook.com/)
2. Klik **My Apps** → **Create App**
3. Pilih **Consumer** → klik **Next**
4. Isi:
   - **App Name**: `OAuth Demo`
   - **App Contact Email**: email Anda
5. Klik **Create App**
6. Setelah masuk dashboard, di sidebar kiri pilih **Kasus penggunaan** (Use Cases)
7. Pilih **Autentikasi dan minta data dari pengguna dengan Facebook Login**
8. Di halaman pengaturan, pastikan:
   - **Client OAuth Login** = ON
   - **Web OAuth Login** = ON
   - **Valid OAuth Redirect URIs** = **KOSONGKAN** (localhost otomatis diizinkan)
9. Kembali ke **Settings** → **Basic**
10. Copy **App ID** dan **App Secret**

> **Catatan:** Facebook otomatis mengizinkan redirect ke `localhost` dalam mode pengembangan, jadi tidak perlu menambahkan URI apapun.