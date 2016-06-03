var async = require("async");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var mkdir = require("mkdirp");
var scrape = require("scrape-it");
var cheerio = require("cheerio");
var request = require("request");
var colors = require("colors");

if (!fs.existsSync("./config.js")) {
	console.error(colors.bgRed("A config.js fájl nem található. Nevezze át a mappában található " + colors.bold("config.example.js") + " fájlt " + colors.bold("config.js") + " fájlra és módosítsa a tartalmát. Adja meg a keresési linkeket, illetve az e-mail küldéshez szükséges adatokat."));
	process.exit(1);
	return;
}

var config = require("./config");

var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(config.email && config.email.mailgunKey ? config.email.mailgunKey : null);

var dataDir = path.join(__dirname, config.dataDir || "./data"); 
mkdir(dataDir);

var format = function(format) {
	if (arguments.length >= 2)
		for (i=1; i < arguments.length; i++)
			format = format.replace(/\{\d+?\}/, arguments[i]);
	return format;
};

function listCars(url, done) {

	var cookie = config.cookie || '';
	if (config.telepulesID != null) 
		cookie += "telepules_id_user=" + config.telepulesID + "; telepules_saved=1; visitor_telepules=" + config.telepulesID + ";";

	request({
		url: url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
			'Cookie': cookie
		}
	}, function(err, response, body ) {
		if (err) {
			return done(err);
		}

		$ = cheerio.load(body);
		var page = scrape.scrapeHTML($, {
			cars: {
				listItem: ".talalati_lista",
				data: {
					id: {
						selector: ".talalati_lista_head a",
						attr: "href",
						convert: function(s) {
							return s.split("-").pop();
						}
					},
					link: {
						selector: ".talalati_lista_head a",
						attr: "href"
					},
					title: ".talalati_lista_head a",
					description: ".talalati_lista_infosor",
					image: {
						selector: ".talalati_lista_kep img",
						attr: "src"
					},
					price: ".talalati_lista_vetelar strong",
					distance: ".tavolsag_talalati"
				}
			}
		});

		console.log("A keresés " + page.cars.length + " autót talált.\n");

		done(null, page);
	});
}

function loadLists() {

	if (config.searches && config.searches.length > 0) {

		async.eachSeries(config.searches, function(item, done) {

			console.log("A(z) " + item.name.bold + " lista betöltése fájlból...");

			var fName = path.join(dataDir, item.id + ".json");
			if (fs.existsSync(fName)) {
				fs.readFile(fName, function(err, data) {
					if (err) return done();
					try {
						item.lastResult = JSON.parse(data);
					} catch(e) {
						console.log("Fájl formátum hiba!");
					}
					//console.log(item.lastResult);

					done();
				});
			}
			else
				done();
		});
	}
}

function doWork() {
	console.log("\n------------------ " + (new Date().toLocaleString()) + " -------------------\n");

	var newCars = [];

	if (config.searches && config.searches.length > 0) {

		async.eachSeries(config.searches, function(item, done) {

			console.log(item.name.bold + " keresés figyelése...");

			listCars(item.url, function(err, list) {

				if (err)
					return console.error(err);

				fs.writeFile(path.join(dataDir, item.id + ".json"), JSON.stringify(list, null, 4));

				// Diff
				list.cars.forEach(function(car) {

					var oldItem;
					if (item.lastResult && item.lastResult.cars) {
						 oldItem = _.find(item.lastResult.cars, function(item) {
							return item.id == car.id;
						});
					}

					if (!oldItem) {
						console.log("Új autót találtam!".bgGreen.white);

						console.log(
							car.title.bold + "\n" +
							car.description + "\n" +
							"Ár: " + car.price + "\n" +
							"Távolság: " + car.distance + "\n" +
							"Link: " + car.link + "\n"
						);

						//console.log(car);
						newCars.push(car);
					}
				});

				item.lastResult = list;

				done();
			});

		}, function() {
			if (newCars.length > 0) {

				var txt = [];

				newCars.forEach(function(car) {
					txt.push(car.title);
					txt.push(car.description);
					txt.push("Ár: " + car.price);
					txt.push("Link: " + car.link);
					txt.push("Távolság: " + car.distance);
					txt.push("ID: " + car.id);

					txt.push("---------------------");
					txt.push(" ");
				});

				if (config.email && config.email.recipients && config.email.recipients.length > 0) {
					var subject = format(config.email.subject || "{0} új használtautó!", newCars.length);

					mg.sendText("hasznaltauto-figyelo@mail.com", config.email.recipients, subject, txt.join("\r\n"), function(err) {
						if (err)
							return console.error("Email küldési hiba!", err);

						console.log("Email kiküldve az alábbi címekre: " + config.email.recipients.join(", ").bold);
					});
				}
			}

			if (newCars.length > 0)
				console.log(colors.white(colors.bold(newCars.length) + " új autót találtam! Várakozás a következő frissítésre...\n"));
			else
				console.log(colors.yellow("Nem találtam új autót. Várakozás a következő frissítésre...\n"));
		});
	}

}


setInterval(function() {
	doWork();
}, (config.time || 5) * 60 * 1000);

console.log(colors.bold("\n\nFigyelő indítása... Frissítési idő: " + (config.time || 10) + " perc"));
console.log("------------------\n");

loadLists();


setTimeout(function() {
	doWork();
}, 1 * 1000);
