module.exports = {
	time: 10,
	dataDir: "./data",

	searches: [
		{
			id: "opel_caravan",
			name: "Opel Astra Caravan",
			url: "https://www.hasznaltauto.hu/talalatilista/PDNG2VC3R2RTAEF4RNHRASFSTF2T4R22NF7XEBOULENOFODNI63ECE2GXH53NAKETDERPLNKPZKD6DGINUU37AZMJIUTIRDMTVLXBQS6DQMSXJAIAMNKIO3U2GG5ATQKUDOPCNHDC7SWXDAYPKUCCDHCPCLJWOKJZ4YIDL4MWIU4SRQKWFTOA26J5SS4BTSXLHOOSHMRYJPPLONKAWFNKFN45HDDYUQU4P3SARILD3WD6BNEYINYOMTVBLSOYG4ONOPNCI25GC5DP5FLOP3QPLQRVYYCXYS6DILMTM7YLO5RSK263CRKOJPY5SDQK6YMDXCZA2VQXJRDGFX3LCH7SM7YMYFGDSUA25IKSOVZNZJ4YGHUTMEVOI6RZSYOBQ7GMMX2NGFINZO3QIUJVHVCPD5JA755YD7W3QYMIN43PMY5TZRYQNLL3CSTX2TTX23P7CAGFVDGTUU2HMSUFS56HYYDPODTNLYAIRYHGUI4IHXOLN42ZZWFZB4SYVSJPSJOE55ZX3HNMTXZFPM3NSPMBAYND3KAK3MLX3ZT76WMXH6EMOID57N6TCQPY7AKVJ4OGDQE7CT34JIRHGWB5ESL6GG7DZXSDPJPAMI6NS3253GYKMDIXY633RD7JGQYE26U24JCYGCFIIO32MZOKRYCNSECKIG6V6GOVRNME7G3TKKIDFLLIRZUW6VSBLRRWQO7VNATW67PS4OM6CODNUS3456WLWOHO3MWQX34OOOQ3YYVJDPTFWIMSFA5U2PYFH3POBCB7D77OU7G7BA"
		},
		{
			id: "opel_zafira",
			name: "Opel Zafira B",
			url: "https://www.hasznaltauto.hu/talalatilista/PDNG2VCZR2RTAEF5RNHRASGSRPZTTUSI6OJSXIGKKAIMOS2FWZAR2WVZPOLYCTTDHJPZJXVL4XKWEQDOJP4RSZCRJKQSCYSLL3ARC63RMCWJAIQMNDI5ZIELGRBDWKOA4SHMOGJ7FNPWHRGQIMGWCEEHSPOMYSL2QYG7RSRKS6JGZJAQNMDD5FWMLYFOY7EVYUOZ6EJJ5RIZ7KZ2GCY3VAFX3WMEPCTC7S7EVUMCA73V7AKR4GEUHGJ2AVB64COHGVH6RUM4GHJBH6WRHH6YKS4EBPGIVOEXQZC7ELH62U2GHRIDLP2LIBF77NQ4CHSDM5REQNKYLWYRTC55VXD7YJ7YMYFGDSUC25IKSOVZNZJ4YGHUZYCNK2GMZSYOBN7S4VOUYMKRLW5XAQNTLIGPNXBJYQTSW6ZQ3HFFRMCWXWFHSIQW33YOLRFI5U5FGRTFVFMG7R2XA7XAM3K6AGGICK2FOEALTF47NK5K64IPJILJGXJGXOOOY3NSW6J32S7WN2ZPPYTQM6BSO5CG26RO77FPHZZS4P2OZ3AIWJS56HCVQWHV2QMQZ6E34KPHRRQG5VADVSJPYZD4PY2PB7FUFBHZUS7BORRBBSNI6TRP6ELSSVFAIZ6SZQMCKE2KRIZHJOQYFE4BFQUNKMA5D6MFGS4YR5NBWZLB4UNNCXUTT2WMF6BY2D3WVUHEN36ZFYZZMG4K5RHX4TUEZHW2FQF67D3TUC5WDKA26IWRRGZJPKO74BX4JJ75B675BPER43GG"
		}
	],

	telepulesID: 1843,
	cookie: 'cookie=cookie; talalatokszama=100; results=100;',

	slackWebHook: "",

	scrapingBee: {
		apiKey: "<PASTE HERE YOUR API KEY FROM SCRAPINGBEE.COM>",
		params: {
			render_js: true,
			premium_proxy: true,
			// stealth_proxy: true,
		}
	},

	email: {
		mailgunKey: "<PASTE HERE YOUR API KEY FROM MAILGUN.COM>",
		mailgunDomain: "<PASTE HERE YOUR MAILGUN SANDBOX DOMAIN>",
		subject: "{0} új használtautó!",
		recipients: [
			"gipsz.jakab@company.com"
		]
	}
}
