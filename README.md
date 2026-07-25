# Pidro – poängräknare

En liten React Native/Expo-app för att hålla koll på poängen när ni spelar Pidro (4 spelare, 2 lag om 2).

## Regler appen bygger på

- 14 poäng per giv: Ess (1p), Kneckt (1p), Tian (1p), Tvåan (1p), samt de två Pedrorna (femmorna i trumf-färgerna) á 5p vardera.
- Budgivning 6–14. Given kan ta 14 över någon annans 14-bud (kryssa i det valet när det gäller) — missar given det budet blir det -28 istället för -14.
- Laget som bjöd och missar sitt bud går bakåt med lika många poäng som budet.
- Det andra laget får alltid sina erövrade poäng, oavsett vad som händer med budlaget.
- Första laget till 62 poäng vinner.

Om er variant skiljer sig (t.ex. annat målpoäng eller andra poängkort) är det enkelt att justera i `lib/types.ts` och `lib/scoring.ts`.

## Kom igång

Det här är fullständig källkod för en Expo-app, men den är inte färdigbyggd/installerad än (paketen är inte hämtade). Så här kör du igång den på din egen dator:

1. Installera [Node.js](https://nodejs.org) (18+) om du inte redan har det.
2. Packa upp zip-filen någonstans på din dator.
3. Öppna en terminal i mappen `pidro-app` och kör:

   ```bash
   npm install
   npx expo install --fix
   ```

   (`expo install --fix` ser till att alla paket har versioner som matchar exakt den Expo SDK-version som finns installerad — det är det säkraste sättet att undvika versionskrångel.)

4. Starta appen:

   ```bash
   npx expo start
   ```

5. Ladda ner appen **Expo Go** på din iPhone/Android-telefon (finns i App Store/Google Play), och skanna QR-koden som visas i terminalen. Appen öppnas direkt på telefonen — ingen App Store-publicering behövs för att testa.

### Om ni vill ha en riktig, installerbar app senare

När ni är nöjda kan ni bygga en riktig app-fil (utan Expo Go) via Expos molntjänst:

```bash
npx eas build --platform android   # för Android (.apk/.aab)
npx eas build --platform ios       # för iOS (kräver Apple Developer-konto, 99 USD/år)
```

Detta kräver ett (gratis) Expo-konto.

## Struktur

- `app/` – skärmarna (start, ny match, matchvy, historik), routing via `expo-router`.
- `lib/scoring.ts` – all poängräkningslogik.
- `lib/storage.ts` – sparar aktiv match + historik lokalt på enheten (`AsyncStorage`), inget internet krävs.
- `components/` – återanvändbara UI-delar.

All data sparas bara lokalt på telefonen, inget skickas till någon server.
