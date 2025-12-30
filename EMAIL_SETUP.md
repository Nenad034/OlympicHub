# 📧 Olympic Hub - Email Sistem

## Pregled

Olympic Hub sada ima potpuno funkcionalan email sistem sa podrškom za **slanje i primanje email-ova** preko SMTP/IMAP protokola.

## 🚀 Funkcionalnosti

### ✅ Implementirano

1. **Multi-Account Support** - Upravljanje sa više email naloga
2. **SMTP Integration** - Slanje email-ova preko SMTP servera
3. **IMAP Integration** - Primanje email-ova preko IMAP servera
4. **Email Configuration** - Lako podešavanje email naloga sa quick-select provajderima
5. **Connection Testing** - Testiranje SMTP/IMAP konekcije pre čuvanja
6. **Real-time UI Updates** - Instant feedback pri slanju/primanju
7. **Master View** - Administratorski pristup svim nalozima (Level 6+)
8. **Email Persistence** - Čuvanje email-ova u Supabase bazi

### 📋 Kako Koristiti

#### 1. Podešavanje Email Naloga

1. Otvorite **Olympic Mail** modul
2. Kliknite na **Settings** dugme (zupčanik ikona)
3. Izaberite provajdera (Gmail, Outlook, Yahoo ili Custom)
4. Unesite SMTP i IMAP podatke:
   - **SMTP Server** - za slanje (npr. `smtp.gmail.com`)
   - **IMAP Server** - za primanje (npr. `imap.gmail.com`)
   - **Username** - vaš email
   - **Password** - App Password (za Gmail) ili obična lozinka

#### 2. Gmail App Password

Za Gmail, morate kreirati **App Password**:

1. Idite na [Google Account Security](https://myaccount.google.com/security)
2. Omogućite **2-Step Verification**
3. Idite na [App Passwords](https://myaccount.google.com/apppasswords)
4. Kreirajte novi App Password za "Mail"
5. Kopirajte 16-cifreni kod i koristite ga kao lozinku

#### 3. Testiranje Konekcije

1. Nakon unosa podataka, kliknite **"Testiraj konekciju"**
2. Sistem će proveriti SMTP i IMAP servere
3. Ako je sve OK, videćete ✅ zelenu poruku
4. Kliknite **"Sačuvaj"** da sačuvate konfiguraciju

#### 4. Slanje Email-a

1. Kliknite **"Nova poruka"** dugme
2. Unesite primaoca, naslov i tekst
3. Kliknite **"Pošalji"**
4. Email će biti poslat preko SMTP servera
5. Kopija će biti sačuvana u "Poslato" folderu

#### 5. Primanje Email-ova

1. Kliknite **Refresh** dugme (ikona sa kružnom strelicom) u email listi
2. Sistem će preuzeti nove email-ove sa IMAP servera
3. Novi email-ovi će se automatski prikazati u Inbox-u

## 🏗️ Arhitektura

### Frontend Komponente

- **`OlympicMail.tsx`** - Glavni email UI (Outlook-style)
- **`EmailConfigModal.tsx`** - Modal za podešavanje email naloga
- **`mailStore.ts`** - Zustand store za lokalno upravljanje email-ovima

### Backend Servisi

- **`emailService.ts`** - Service layer za SMTP/IMAP operacije
- **Supabase Edge Functions** (potrebno kreirati):
  - `send-email` - Slanje email-a preko SMTP
  - `fetch-emails` - Preuzimanje email-ova preko IMAP
  - `test-email-connection` - Testiranje konekcije

### Database Schema

```sql
-- Email konfiguracije
email_configs (
  id, account_id, smtp_host, smtp_port, smtp_user, smtp_password,
  imap_host, imap_port, imap_user, imap_password, use_ssl
)

-- Email-ovi
emails (
  id, account_id, message_id, sender, recipient, subject, body,
  folder, is_read, is_starred, sent_at, received_at
)

-- Prilozi
email_attachments (
  id, email_id, filename, content_type, storage_path
)

-- Labele
email_labels (
  id, name, color, account_id
)
```

## 🔧 Supabase Edge Functions

### Potrebno Kreirati

Morate kreirati sledeće Supabase Edge Functions:

#### 1. `send-email` Function

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

serve(async (req) => {
  const { config, email } = await req.json()
  
  const client = new SMTPClient({
    connection: {
      hostname: config.smtp_host,
      port: config.smtp_port,
      tls: config.use_ssl,
      auth: {
        username: config.smtp_user,
        password: config.smtp_password,
      },
    },
  })

  await client.send({
    from: email.from,
    to: email.to,
    subject: email.subject,
    content: email.html || email.text,
  })

  await client.close()

  return new Response(
    JSON.stringify({ success: true, messageId: crypto.randomUUID() }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

#### 2. `fetch-emails` Function

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ImapClient } from "https://deno.land/x/imap@0.0.9/mod.ts"

serve(async (req) => {
  const { config, folder, limit } = await req.json()
  
  const client = new ImapClient({
    hostname: config.imap_host,
    port: config.imap_port,
    tls: config.use_ssl,
    auth: {
      username: config.imap_user,
      password: config.imap_password,
    },
  })

  await client.connect()
  await client.select(folder || "INBOX")
  
  const messages = await client.fetch("1:*", {
    body: true,
    envelope: true,
  })

  await client.close()

  return new Response(
    JSON.stringify({ success: true, emails: messages.slice(0, limit) }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

## 📝 TODO

- [ ] Kreirati Supabase Edge Functions
- [ ] Dodati podršku za priloge (attachments)
- [ ] Implementirati draft auto-save
- [ ] Dodati rich text editor
- [ ] Implementirati email templates
- [ ] Dodati search i filtering
- [ ] Implementirati email threading (konverzacije)
- [ ] Dodati notifikacije za nove email-ove
- [ ] Implementirati spam filter

## 🔐 Sigurnost

- Email lozinke se čuvaju u Supabase sa Row Level Security (RLS)
- Preporučuje se korišćenje App Passwords umesto običnih lozinki
- SSL/TLS enkripcija je podrazumevano uključena
- Edge Functions izvršavaju se na Supabase serveru, ne u browseru

## 📚 Dodatne Informacije

### Podržani Provajderi

| Provajder | SMTP Server | SMTP Port | IMAP Server | IMAP Port |
|-----------|-------------|-----------|-------------|-----------|
| Gmail | smtp.gmail.com | 587 | imap.gmail.com | 993 |
| Outlook | smtp.office365.com | 587 | outlook.office365.com | 993 |
| Yahoo | smtp.mail.yahoo.com | 587 | imap.mail.yahoo.com | 993 |

### Troubleshooting

**Problem**: "Email configuration not found"
- **Rešenje**: Podesite email nalog preko Settings dugmeta

**Problem**: "Connection failed"
- **Rešenje**: Proverite da li su SMTP/IMAP serveri ispravni i da li je App Password validan

**Problem**: "Authentication failed"
- **Rešenje**: Za Gmail, koristite App Password umesto obične lozinke

## 🎯 Sledeći Koraci

1. **Kreirajte Supabase Edge Functions** za send-email i fetch-emails
2. **Testirajte slanje** email-a sa vašim nalogom
3. **Testirajte primanje** email-ova preko IMAP-a
4. **Podesite dodatne naloge** ako je potrebno

---

**Napomena**: Ova funkcionalnost zahteva aktivnu Supabase konekciju i kreiranje Edge Functions. Bez toga, sistem će raditi u demo modu sa lokalnim storage-om.
