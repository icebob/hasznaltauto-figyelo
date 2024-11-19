var async = require("async");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var mkdir = require("mkdirp");
var scrape = require("scrape-it");
var cheerio = require("cheerio");
var request = require("request");
var colors = require("colors");
var Mustache = require("mustache");
const scrapingbee = require("scrapingbee");
const zr = require("zenrows");

if (!fs.existsSync("./config.js")) {
  console.error(
    colors.bgRed(
      "A config.js fájl nem található. Nevezze át a mappában található " +
        colors.bold("config.example.js") +
        " fájlt " +
        colors.bold("config.js") +
        " fájlra és módosítsa a tartalmát. Adja meg a keresési linkeket, illetve az e-mail küldéshez szükséges adatokat."
    )
  );
  process.exit(1);
  return;
}

var html_template;
if (fs.existsSync("./html.template")) {
  html_template = fs.readFileSync("./html.template", "utf8");
}

var config = require("./config");

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
var mg = mailgun.client({
  username: "api",
  key: config.email.mailgunKey ? config.email.mailgunKey : null,
  url: config.email.mailgunURL ? config.email.mailgunURL : null,
});

var dataDir = path.join(__dirname, config.dataDir || "./data");
mkdir(dataDir);

var format = function (format) {
  if (arguments.length >= 2)
    for (i = 1; i < arguments.length; i++)
      format = format.replace(/\{\d+?\}/, arguments[i]);
  return format;
};

/**
 * parse all pages in loop until empty page found
 *
 * @param url
 * @param page
 * @param ret
 * @param resolve
 */
function listCarsForAllPages(url, page, ret, resolve) {
  if (page > 1) {
    url += "/page" + page;
  }

  listCars(url, function (err, list) {
    if (err !== null) {
      return resolve(err);
    }
    // utolsó lap, nincs találat
    if (list.cars.length === 0) {
      return resolve(null, ret);
    }

    list.cars.forEach(function (car) {
      ret.cars.push(car);
    });

    // next page - recursion
    listCarsForAllPages(url, page + 1, ret, resolve);
  });
}

function get({ url, headers }) {
  if (config.scrapingBee && config.scrapingBee.apiKey) {
    const client = new scrapingbee.ScrapingBeeClient(config.scrapingBee.apiKey);
    return client
      .get({
        url: url,
        params: config.scrapingBee.params,
        headers,
      })
      .then((response) => {
        var decoder = new TextDecoder();
        var body = decoder.decode(response.data);
        return body;
      });
  }
  else if (config.zenrows && config.zenrows.apiKey) {
    const client = new zr.ZenRows(config.zenrows.apiKey);
    return client
      .get(
        url,
        Object.assign({ custom_headers: true }, config.zenrows.params),
        { headers }
      )
      .then((response) => {
        if (response.status >= 400) {
          console.error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
      });
  } else {
    return new Promise((resolve) => {
      request(
        {
          url,
          headers,
          strictSSL: false,
          rejectUnauthorized: false,
        },
        function (err, response, body) {
          if (err) {
            console.error(err.message);
          } else if (response.statusCode >= 400) {
            console.error(
              `HTTP ${response.statusCode}: ${response.statusMessage}`
            );
          }

          resolve(body);
        }
      );
    });
  }
}

function listCars(url, done) {
  var cookie = config.cookie || "";
  if (config.telepulesID != null)
    cookie +=
      "telepules_id_user=" +
      config.telepulesID +
      "; telepules_saved=1; visitor_telepules=" +
      config.telepulesID +
      ";";

  get({
    url: url,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      Cookie: cookie,
    },
  })
    .then((body) => {
      //console.log(body);
      fs.writeFileSync("response.html", body);

      $ = cheerio.load(body);
      var page = scrape.scrapeHTML($, {
        cars: {
          listItem: ".row.talalati-sor",
          data: {
            id: {
              selector: ".cim-kontener h3 a",
              attr: "href",
              convert: function (s) {
                const url = new URL(s);
                return url.pathname.split("-").pop();
              },
            },
            link: {
              selector: ".cim-kontener h3 a",
              attr: "href",
            },
            title: ".cim-kontener h3 a",
            description: ".talalatisor-infokontener .hidden-xs",
            image: {
              selector: ".talalatisor-kep img",
              attr: "src",
            },
            price: ".price-fields-desktop .pricefield-primary",
            extraData: ".talalatisor-info.adatok .info",
            distance: ".talalatisor-info tavolsaginfo .tavolsag_talalati",
          },
        },
      });

      console.log("A keresés " + page.cars.length + " autót talált.\n");

      done(null, page);
    })
    .catch((err) => {
      if (err.response && err.response.data) {
        if (err.response.status == 404) {
          return done(null, { cars: [] });
        }

        // var decoder = new TextDecoder();
        // var text = decoder.decode(err.response.data);
        // console.error(text);
      }

      return done(err);
    });
}

function loadLists() {
  if (config.searches && config.searches.length > 0) {
    async.eachSeries(config.searches, function (item, done) {
      console.log("A(z) " + item.name.bold + " lista betöltése fájlból...");

      var fName = path.join(dataDir, item.id + ".json");
      if (fs.existsSync(fName)) {
        fs.readFile(fName, function (err, data) {
          if (err) return done();
          try {
            item.lastResult = JSON.parse(data);
          } catch (e) {
            console.log("Fájl formátum hiba!");
          }
          //console.log(item.lastResult);

          done();
        });
      } else {
        done();
      }
    });
  }
}

function doWork() {
  console.log(
    "\n------------------ " +
      new Date().toLocaleString() +
      " -------------------\n"
  );

  var newCars = [];

  if (config.searches && config.searches.length > 0) {
    async.eachSeries(
      config.searches,
      function (item, done) {
        console.log(item.name.bold + " keresés figyelése...");

        // for recursion
        const ret = {
          cars: [],
        };

        listCarsForAllPages(item.url, 1, ret, function (err, list) {
          if (err) return console.error(err);

          fs.writeFileSync(
            path.join(dataDir, item.id + ".json"),
            JSON.stringify(list, null, 4)
          );

          // Diff
          list.cars.forEach(function (car) {
            var oldItem;
            if (item.lastResult && item.lastResult.cars) {
              oldItem = _.find(item.lastResult.cars, function (item) {
                return item.id == car.id;
              });
            }

            if (!oldItem) {
              console.log("Új autót találtam!".bgGreen.white);

              console.log(
                car.title.bold +
                  "\n" +
                  car.description +
                  "\n" +
                  "Ár: " +
                  car.price +
                  "\n" +
                  "Távolság: " +
                  car.distance +
                  "\n" +
                  "Link: " +
                  car.link +
                  "\n"
              );

              //console.log(car);
              newCars.push(car);
            }
          });

          item.lastResult = list;

          done();
        });
      },
      function () {
        if (newCars.length > 0) {
          var txt = [];
          var html = [];

          newCars.forEach(function (car) {
            if (html_template) {
              html.push(Mustache.render(html_template, car));
            }

            txt.push(car.title);
            txt.push(car.description);
            txt.push("Ár: " + car.price);
            txt.push("Link: " + car.link);
            txt.push("Távolság: " + car.distance);
            txt.push("Infó: " + car.extraData);
            txt.push("Fotó: " + car.image);
            txt.push("ID: " + car.id);

            txt.push("---------------------");
            txt.push(" ");

            if (config.slackWebHook) {
              request(
                {
                  method: "POST",
                  url: config.slackWebHook,

                  json: {
                    text:
                      car.title +
                      "\n" +
                      car.description +
                      "\n" +
                      "Ár: " +
                      car.price +
                      "\n" +
                      "Link: " +
                      car.link +
                      "\n" +
                      "Távolság: " +
                      car.distance +
                      "\n" +
                      "ID: " +
                      car.id,
                  },
                },
                function (err, response, body) {
                  if (err) {
                    return console.error(err);
                  }

                  console.log("Slack-re továbbítva.");
                }
              );
            }
          });

          if (
            config.email &&
            config.email.recipients &&
            config.email.recipients.length > 0
          ) {
            const data = {
              from: "hasznaltauto-figyelo@mail.com",
              to: config.email.recipients,
              subject: format(
                config.email.subject || "{0} új használtautó!",
                newCars.length
              ),
              text: txt.join("\r\n"),
              html: html_template ? html.join("\r\n") : undefined,
            };
            mg.messages
              .create(
                config.email.mailgunDomain ? config.email.mailgunDomain : null,
                data
              )
              .then(() => {
                console.log(
                  "Email kiküldve az alábbi címekre: " +
                    config.email.recipients.join(", ").bold
                );
              })
              .catch((err) => {
                return console.error("Email küldési hiba!", err);
              });
          }
        }

        if (newCars.length > 0)
          console.log(
            colors.white(
              colors.bold(newCars.length) +
                " új autót találtam! Várakozás a következő frissítésre...\n"
            )
          );
        else
          console.log(
            colors.yellow(
              "Nem találtam új autót. Várakozás a következő frissítésre...\n"
            )
          );
      }
    );
  }
}

setInterval(function () {
  doWork();
}, (config.time || 5) * 60 * 1000);

console.log(
  colors.bold(
    "\n\nFigyelő indítása... Frissítési idő: " + (config.time || 10) + " perc"
  )
);
console.log("------------------\n");

loadLists();

setTimeout(function () {
  doWork();
}, 1 * 1000);
