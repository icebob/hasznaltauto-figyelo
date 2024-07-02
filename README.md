# hasznaltauto-figyelo
Ez az alkalmazás képes a hasznaltauto.hu oldalon beállított keresések találatainak figyelésére. Ha a találatok között megjelenik egy új elem, akkor arról e-mail értesítést küld a főbb adatokkal és az oldal linkjével.

## Telepítés
A telepítéshez vagy le kell klónozni ezt a tárolót
```
git clone https://github.com/icebob/hasznaltauto-figyelo.git
```
vagy letölteni [ZIP-ben](https://github.com/icebob/hasznaltauto-figyelo/archive/master.zip) és kicsomagolni.

Az alkalmazás NodeJS alapú, így szükséges [NodeJS telepítése](https://nodejs.org/en/download/package-manager/).

Telepítés után az alkalmazás mappájában ki kell adni az alábbi parancsot egy parancssorból a függőségek telepítéséhez:
```bash
npm install
```

Ha a parancs sikeresen lefutott akkor a program futtatható.

## Használat
A program futtatásához az alábbi parancsot kell kiadni parancssorban:
```bash
node index.js
```

Az első indítás során a program hibát jelezhet, hogy nem találja a `config.js` fájlt. Ez esetben a mappában található `config.example.js` fájlt át kell nevezni config.js-re és a benne lévő adatokat megváltoztatni. Ennek leírását lásd a következő részben.

## Konfigurálás
Az alkalmazás konfigurációja a `config.js` fájlban található.
A fájl szerkezete a következő:
```js
module.exports = {
	time: 10,
	dataDir: "./data",

	searches: [
		{
			id: "opel_caravan",
			name: "Opel Astra Caravan",
			url: "http://www.hasznaltauto.hu/talalatilista/auto/2G4ZLM6H4LHPDGMCKJQHZDH4T2PHATRPML46HMGZD5WYO4RCKTY1QY69R2S5GSOSA2LWHHFZA4RAMCAMTTFT3HQUMW3F0OZ9RMYDQRLYCCLDQW734RMFTH7Z2GZY31W1Y5WO6UISWJC1H9SOJT9Y8PY4YPLDTJ6905AHHT11QIF2HML0FAC2CIC9YEMGCW0W2EGOKOE9TEP0M1Q8PUF4C7FEJU22745MKGG2TY2F3F7HI5LR2EOTHH9UR2OQ499J2FM0DFAWMK9DQKHE3HZL7TG7LRAS8U1UE4II1IA5KLPZO0K6C1TS7G3ZUFOIUQK26WH61FY0Z7YT6JZRRIYE99KLOGY20WF3JJY6Y2KQAHKEJR6ZRUH970AUOMD/page1"
		}
	],

	telepulesID: 1843,
	cookie: 'cookie=cookie; talalatokszama=100; results=100;',

	email: {
		mailgunKey: "<PASTE HERE YOUR API KEY FROM MAILGUN.COM>",
		mailgunDomain: "<PASTE HERE YOUR MAILGUN.COM SANDBOX DOMAIN OR CUSTOM DOMAIN>",
		subject: "{0} új használtautó!",
		recipients: [
			"gipsz.jakab@company.com"
		]
	}
}
```

Beállítások leírása:

- **time**: a frissítési idő percekben. Ennyi időnként fut le a figyelés
- **dataDir**: munkakönyvtár. Célszerű nem megváltoztatni
- **searches**: a keresési linkeket tartalmazó tömb. Több elemet is tartalmazhat
  - **id**: keresési azonosítója. Csak latin betűket és számokat tartalmazhat szóköz nélkül. Egy egyszerű név, a program a fájlnévként használja ezt az azonosítót. Lehet fantázianév, csak legyen **egyedi**
  - **name**: a keresés beszédes fantázia neve (a parancssorban jelenik meg)
  - **url**: a keresés linkje. A hasznaltauto.hu oldalon összeállított kereséshez tartozó URL.
- **telepulesID** - a távolságszámításhoz használt település azonosító (hasznaltauto.hu oldalon lévő cookie-ból nyerhető id az adat)
- **cookie** - a kereséshez használt egyéb cookie mezők. Célszerű nem változtatni. 
- **email** - e-mail értesítéshez tartozó beállítások
  - **mailgunKey** - a program az email küldéséhez a mailgun ingyenes szolgáltatását használja. Ehhez az oldalon be kell regisztrálni az ingyenes csomagra és az ott kapott `Secret API key`-t ide bemásolni
  - **mailgunURL** - abban az esetben ha EU régiós az account akkor ide meg kell adni, hogy `https://api.eu.mailgun.net`
  - **subject** - a levél fejléce. A `{0}` rész kicserélődik a talált új autók számára
  - **recipients** - a címzettek e-mail címe. Több is megadható

## Futtatás dockerben

A docker konténer létrehozható a `docker build . -t hasznaltauto-figyelo`
paranccsal.  Ezután a következő paranccsal futtatható: `docker run --init -it
-v<config.js utvonala>:/app/config.js hasznaltauto-figyelo`.

## License
[MIT license](https://tldrlegal.com/license/mit-license).
