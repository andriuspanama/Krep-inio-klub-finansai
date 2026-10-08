# 🏀 Krepšinio klubų finansai — Modern Design (v2)

Nauja moderni dizaino versija pagal 2025–2026 UI standartus.

## Kas pakeista

### Vizualinis stilius
- **Inter + Inter Tight** tipografija (šiuolaikiškesnė nei Barlow Condensed)
- Pilna **light / dark** tema su `localStorage` atsiminimu + sistemos preferencijų palaikymu
- Sticky header su `backdrop-blur`
- Švelnesni šešėliai, geresni radiusai, modernūs spacing’ai
- Brand spalva – šiltas oranžinis (krepšinio jausmas) + teal akcentas

### Komponentai
- Segmentuoti tab’ai su animuota active linija
- Modernūs pill filtrai (sezonai + šalys)
- **Summary cards** virš lentelės (klubų sk., didžiausias biudžetas, vid. atlyginimų dalis)
- Geresnė lentelė: sticky header + sticky klubų stulpelis, hover, gražesni progress barai
- Badge’ai šaltiniams ir pokyčiui (+ / −)
- Geresnis mobile elgesys

### Struktūra
```
design/
├── index.html      ← moderni versija (galima naudoti kaip pagrindinį)
├── styles.css      ← visas dizaino sistemos CSS
└── README.md
```

## Kaip paleisti

### Variantas 1 – greitas testas
Tiesiog atidaryk `design/index.html` naršyklėje (arba per GitHub Pages branch’ą).

### Variantas 2 – pakeisti pagrindinę svetainę
1. Nukopijuok `design/index.html` → `index.html` (arba pervadink seną į `index-old.html`)
2. Nukopijuok `design/styles.css` į root’ą arba į `css/`
3. Jei reikia – pakoreguok `<link rel="stylesheet" href="styles.css">` kelią

### Variantas 3 – atskiras branch’as
```bash
git checkout -b design-v2
# nukopijuok failus
git add design/
git commit -m "Modern design v2"
git push -u origin design-v2
```

## Pastabos

- Duomenų logika (Google Sheets) liko ta pati – viskas turėtų veikti kaip anksčiau.
- Theme toggle mygtukas yra dešinėje header’yje (🌙 / ☀️).
- Summary cards rodomi tik Biudžetų tab’e.
- Jei nori dar labiau tobulinti (pvz. club detail modalą, sparklines, card view mobilėje) – parašyk.

---

Sukurta pagal dizaino pasiūlymus 2026-10-08.
