const PRODUCT_URLS = [
  {
    "part_number": "41DH12",
    "url": "https://linemaster.com/product/2/air-seal-maintained/"
  },
  {
    "part_number": "41SH12",
    "url": "https://linemaster.com/product/1/Air-Seal-Maintained/41SH12/"
  },
  {
    "part_number": "2E-20V2-S",
    "url": "https://linemaster.com/product/11/airval-classic/"
  },
  {
    "part_number": "2E-30A2-S",
    "url": "https://linemaster.com/product/12/Airval-Classic/2E-30A2-S/"
  },
  {
    "part_number": "3E-30A2-S",
    "url": "https://linemaster.com/product/13/Airval-Classic/3E-30A2-S/"
  },
  {
    "part_number": "3E-20V2-S",
    "url": "https://linemaster.com/product/14/Airval-Classic/3E-20V2-S/"
  },
  {
    "part_number": "2C-30A2-S",
    "url": "https://linemaster.com/product/8/airval-clipper-single/"
  },
  {
    "part_number": "3C-30A2-S",
    "url": "https://linemaster.com/product/9/Airval-Clipper-Single/3C-30A2-S/"
  },
  {
    "part_number": "4C-30F2-S",
    "url": "https://linemaster.com/product/10/Airval-Clipper-Single/4C-30F2-S/"
  },
  {
    "part_number": "Twin 3C-30A2-S",
    "url": "https://linemaster.com/product/6/airval-clipper-twin/"
  },
  {
    "part_number": "3L-30A2-S",
    "url": "https://linemaster.com/product/7/airval-clipper-wide-treadle/"
  },
  {
    "part_number": "3B-30A2-S",
    "url": "https://linemaster.com/product/4/airval-compact-single/"
  },
  {
    "part_number": "2B-30A2-S",
    "url": "https://linemaster.com/product/5/Airval-Compact-Single/2B-30A2-S/"
  },
  {
    "part_number": "Twin 3B-30A2-S",
    "url": "https://linemaster.com/product/3/airval-compact-twin/"
  },
  {
    "part_number": "3H-25H2-S4H",
    "url": "https://linemaster.com/product/17/airval-hercules-full-shield/"
  },
  {
    "part_number": "3H-25H2-D4H",
    "url": "https://linemaster.com/product/18/Airval-Hercules-Full-Shield/3H-25H2-D4H/"
  },
  {
    "part_number": "4H-30H2-DH",
    "url": "https://linemaster.com/product/19/Airval-Hercules-Full-Shield/4H-30H2-DH/"
  },
  {
    "part_number": "4H-30H2-SH",
    "url": "https://linemaster.com/product/21/Airval-Hercules-Full-Shield/4H-30H2-SH/"
  },
  {
    "part_number": "4H-30H2-DHOX",
    "url": "https://linemaster.com/product/20/airval-hercules-ox-shield/"
  },
  {
    "part_number": "4H-30H2-SHOX",
    "url": "https://linemaster.com/product/22/Airval-Hercules-Ox-Shield/4H-30H2-SHOX/"
  },
  {
    "part_number": "3H-25H2-S4HOX",
    "url": "https://linemaster.com/product/490/Airval-Hercules-Ox-Shield/3H-25H2-S4HOX/"
  },
  {
    "part_number": "2P-30A2-S",
    "url": "https://linemaster.com/product/15/airval-premier/"
  },
  {
    "part_number": "3P-30A2-S",
    "url": "https://linemaster.com/product/16/Airval-Premier/3P-30A2-S/"
  },
  {
    "part_number": "511-B2A",
    "url": "https://linemaster.com/product/23/anti-trip-hercules-full-shield/"
  },
  {
    "part_number": "511-B4A",
    "url": "https://linemaster.com/product/24/Anti-Trip-Hercules-Full-Shield/511-B4A/"
  },
  {
    "part_number": "511-B2",
    "url": "https://linemaster.com/product/25/Anti-Trip-Hercules-Full-Shield/511-B2/"
  },
  {
    "part_number": "511-B4",
    "url": "https://linemaster.com/product/26/Anti-Trip-Hercules-Full-Shield/511-B4/"
  },
  {
    "part_number": "511-B",
    "url": "https://linemaster.com/product/27/Anti-Trip-Hercules-Full-Shield/511-B/"
  },
  {
    "part_number": "511-B3",
    "url": "https://linemaster.com/product/28/Anti-Trip-Hercules-Full-Shield/511-B3/"
  },
  {
    "part_number": "511-BG",
    "url": "https://linemaster.com/product/29/anti-trip-hercules-gated-o-shield/"
  },
  {
    "part_number": "511-B2GA",
    "url": "https://linemaster.com/product/30/Anti-Trip-Hercules-Gated-O-Shield/511-B2GA/"
  },
  {
    "part_number": "511-B4GA",
    "url": "https://linemaster.com/product/31/Anti-Trip-Hercules-Gated-O-Shield/511-B4GA/"
  },
  {
    "part_number": "511-B2G",
    "url": "https://linemaster.com/product/32/Anti-Trip-Hercules-Gated-O-Shield/511-B2G/"
  },
  {
    "part_number": "511-B4G",
    "url": "https://linemaster.com/product/33/Anti-Trip-Hercules-Gated-O-Shield/511-B4G/"
  },
  {
    "part_number": "511-B3G",
    "url": "https://linemaster.com/product/34/Anti-Trip-Hercules-Gated-O-Shield/511-B3G/"
  },
  {
    "part_number": "511-BOXG",
    "url": "https://linemaster.com/product/48/anti-trip-hercules-gated-ox-shield/"
  },
  {
    "part_number": "511-B2OXG",
    "url": "https://linemaster.com/product/49/Anti-Trip-Hercules-Gated-Ox-Shield/511-B2OXG/"
  },
  {
    "part_number": "511-B2OXGA",
    "url": "https://linemaster.com/product/50/Anti-Trip-Hercules-Gated-Ox-Shield/511-B2OXGA/"
  },
  {
    "part_number": "511-B3OXG",
    "url": "https://linemaster.com/product/51/Anti-Trip-Hercules-Gated-Ox-Shield/511-B3OXG/"
  },
  {
    "part_number": "511-B4OXG",
    "url": "https://linemaster.com/product/52/Anti-Trip-Hercules-Gated-Ox-Shield/511-B4OXG/"
  },
  {
    "part_number": "511-B4OXGA",
    "url": "https://linemaster.com/product/53/Anti-Trip-Hercules-Gated-Ox-Shield/511-B4OXGA/"
  },
  {
    "part_number": "511-BO",
    "url": "https://linemaster.com/product/35/anti-trip-hercules-o-shield/"
  },
  {
    "part_number": "511-B2OA",
    "url": "https://linemaster.com/product/36/Anti-Trip-Hercules-O-Shield/511-B2OA/"
  },
  {
    "part_number": "511-B4OA",
    "url": "https://linemaster.com/product/37/Anti-Trip-Hercules-O-Shield/511-B4OA/"
  },
  {
    "part_number": "511-B2OAC2",
    "url": "https://linemaster.com/product/38/Anti-Trip-Hercules-O-Shield/511-B2OAC2/"
  },
  {
    "part_number": "511-B2O",
    "url": "https://linemaster.com/product/39/Anti-Trip-Hercules-O-Shield/511-B2O/"
  },
  {
    "part_number": "511-B4O",
    "url": "https://linemaster.com/product/40/Anti-Trip-Hercules-O-Shield/511-B4O/"
  },
  {
    "part_number": "511-B3O",
    "url": "https://linemaster.com/product/41/Anti-Trip-Hercules-O-Shield/511-B3O/"
  },
  {
    "part_number": "511-BOX",
    "url": "https://linemaster.com/product/42/anti-trip-hercules-ox-shield/"
  },
  {
    "part_number": "511-B2OXA",
    "url": "https://linemaster.com/product/43/Anti-Trip-Hercules-Ox-Shield/511-B2OXA/"
  },
  {
    "part_number": "511-B4OXA",
    "url": "https://linemaster.com/product/44/Anti-Trip-Hercules-Ox-Shield/511-B4OXA/"
  },
  {
    "part_number": "511-B2OX",
    "url": "https://linemaster.com/product/45/Anti-Trip-Hercules-Ox-Shield/511-B2OX/"
  },
  {
    "part_number": "511-B4OX",
    "url": "https://linemaster.com/product/46/Anti-Trip-Hercules-Ox-Shield/511-B4OX/"
  },
  {
    "part_number": "511-B3OX",
    "url": "https://linemaster.com/product/47/Anti-Trip-Hercules-Ox-Shield/511-B3OX/"
  },
  {
    "part_number": "971-DC3JM",
    "url": "https://linemaster.com/product/73/aquiline-maintained-metal/"
  },
  {
    "part_number": "971-DC36JM",
    "url": "https://linemaster.com/product/74/Aquiline-Maintained-Metal/971-DC36JM/"
  },
  {
    "part_number": "971-DC38JM",
    "url": "https://linemaster.com/product/75/Aquiline-Maintained-Metal/971-DC38JM/"
  },
  {
    "part_number": "971-DJM",
    "url": "https://linemaster.com/product/76/Aquiline-Maintained-Metal/971-DJM/"
  },
  {
    "part_number": "971-DC26J",
    "url": "https://linemaster.com/product/70/aquiline-maintained-polymeric/"
  },
  {
    "part_number": "971-DC26J",
    "url": "https://linemaster.com/product/70/Aquiline-Maintained-Polymeric/971-DC26J/"
  },
  {
    "part_number": "971-DC28J",
    "url": "https://linemaster.com/product/71/Aquiline-Maintained-Polymeric/971-DC28J/"
  },
  {
    "part_number": "971-DC3J",
    "url": "https://linemaster.com/product/72/Aquiline-Maintained-Polymeric/971-DC3J/"
  },
  {
    "part_number": "TWIN 971-SMC48",
    "url": "https://linemaster.com/product/66/aquiline-metal-twin-momentary/"
  },
  {
    "part_number": "971-SM",
    "url": "https://linemaster.com/product/65/Aquiline-Metal-Twin-Momentary/971-SM/"
  },
  {
    "part_number": "972-S",
    "url": "https://linemaster.com/product/67/Aquiline-Metal-Momentary/972-S/"
  },
  {
    "part_number": "974-SM",
    "url": "https://linemaster.com/product/68/Aquiline-Momentary-Metal/974-SM/"
  },
  {
    "part_number": "971-S",
    "url": "https://linemaster.com/product/54/aquiline-momentary-polymeric/"
  },
  {
    "part_number": "971-SA",
    "url": "https://linemaster.com/product/55/Aquiline-Momentary-Polymeric/971-SA/"
  },
  {
    "part_number": "971-SB",
    "url": "https://linemaster.com/product/56/Aquiline-Momentary-Polymeric/971-SB/"
  },
  {
    "part_number": "971-SC26",
    "url": "https://linemaster.com/product/57/Aquiline-Momentary-Polymeric/971-SC26/"
  },
  {
    "part_number": "971-SC26A",
    "url": "https://linemaster.com/product/58/Aquiline-Momentary-Polymeric/971-SC26A/"
  },
  {
    "part_number": "971-SWNO210",
    "url": "https://linemaster.com/product/59/Aquiline-Momentary-Polymeric/971-SWNO210/"
  },
  {
    "part_number": "971-SWNO210A",
    "url": "https://linemaster.com/product/60/Aquiline-Momentary-Polymeric/971-SWNO210A/"
  },
  {
    "part_number": "971-SY",
    "url": "https://linemaster.com/product/61/Aquiline-Momentary-Polymeric/971-SY/"
  },
  {
    "part_number": "974-S",
    "url": "https://linemaster.com/product/62/Aquiline-Momentary-Polymeric/974-S/"
  },
  {
    "part_number": "971-SO",
    "url": "https://linemaster.com/product/64/Aquiline-Momentary-Polymeric/971-SO/"
  },
  {
    "part_number": "936-SWH",
    "url": "https://linemaster.com/product/77/atlas-full-shield/"
  },
  {
    "part_number": "936-SWHC4",
    "url": "https://linemaster.com/product/79/Atlas-Full-Shield/936-SWHC4/"
  },
  {
    "part_number": "937-SWH",
    "url": "https://linemaster.com/product/81/Atlas-Full-Shield/937-SWH/"
  },
  {
    "part_number": "937-SWHC4",
    "url": "https://linemaster.com/product/82/Atlas-Full-Shield/937-SWHC4/"
  },
  {
    "part_number": "936-SWN",
    "url": "https://linemaster.com/product/95/atlas-no-shield/"
  },
  {
    "part_number": "937-SWN",
    "url": "https://linemaster.com/product/98/Atlas-No-Shield/937-SWN/"
  },
  {
    "part_number": "937-SWNC4",
    "url": "https://linemaster.com/product/492/Atlas-No-Shield/937-SWNC4/"
  },
  {
    "part_number": "936-SWNC4",
    "url": "https://linemaster.com/product/510/Atlas-No-Shield/936-SWNC4/"
  },
  {
    "part_number": "936-SWHO",
    "url": "https://linemaster.com/product/83/atlas-oversized-shield/"
  },
  {
    "part_number": "937-SWHO",
    "url": "https://linemaster.com/product/86/Atlas-Oversized-Shield/937-SWHO/"
  },
  {
    "part_number": "937-SWHOC4",
    "url": "https://linemaster.com/product/87/Atlas-Oversized-Shield/937-SWHOC4/"
  },
  {
    "part_number": "936-SWHOX",
    "url": "https://linemaster.com/product/89/atlas-ox-shield/"
  },
  {
    "part_number": "936-SWHOXC4",
    "url": "https://linemaster.com/product/90/Atlas-Ox-Shield/936-SWHOXC4/"
  },
  {
    "part_number": "937-SWHOX",
    "url": "https://linemaster.com/product/93/Atlas-Ox-Shield/937-SWHOX/"
  },
  {
    "part_number": "937-SWHOXC4",
    "url": "https://linemaster.com/product/94/Atlas-Ox-Shield/937-SWHOXC4/"
  },
  {
    "part_number": "78SN1",
    "url": "https://linemaster.com/product/104/classic-ii/"
  },
  {
    "part_number": "78SN2",
    "url": "https://linemaster.com/product/105/Classic-Ii/78SN2/"
  },
  {
    "part_number": "78SH1",
    "url": "https://linemaster.com/product/102/Classic-Ii/78SH1/"
  },
  {
    "part_number": "78SH2",
    "url": "https://linemaster.com/product/103/Classic-Ii-Shielded/78SH2/"
  },
  {
    "part_number": "88SN1-05",
    "url": "https://linemaster.com/product/112/classic-iv/"
  },
  {
    "part_number": "88SN1B-05",
    "url": "https://linemaster.com/product/113/Classic-Iv/88SN1B-05/"
  },
  {
    "part_number": "88SN2-05",
    "url": "https://linemaster.com/product/114/Classic-Iv/88SN2-05/"
  },
  {
    "part_number": "TWIN 88SH1-05",
    "url": "https://linemaster.com/product/106/classic-iv-guarded/"
  },
  {
    "part_number": "TWIN 88SH2-05",
    "url": "https://linemaster.com/product/107/Classic-Iv-Guarded/TWIN%2088SH2-05/"
  },
  {
    "part_number": "88SH1-05",
    "url": "https://linemaster.com/product/108/Classic-Iv-Guarded/88SH1-05/"
  },
  {
    "part_number": "88SH2-05",
    "url": "https://linemaster.com/product/109/Classic-Iv-Guarded/88SH2-05/"
  },
  {
    "part_number": "TWIN 88SN1-05",
    "url": "https://linemaster.com/product/110/Classic-Iv/TWIN%2088SN1-05/"
  },
  {
    "part_number": "TWIN 88SN2-05",
    "url": "https://linemaster.com/product/111/Classic-Iv-Twin/TWIN%2088SN2-05/"
  },
  {
    "part_number": "632-DA",
    "url": "https://linemaster.com/product/122/clipper-single-maintained/"
  },
  {
    "part_number": "632-DC3A",
    "url": "https://linemaster.com/product/123/Clipper-Single-Maintained/632-DC3A/"
  },
  {
    "part_number": "634-DA",
    "url": "https://linemaster.com/product/128/Clipper-Single-Momentary/634-DA/"
  },
  {
    "part_number": "632-S",
    "url": "https://linemaster.com/product/124/Clipper-Single-Maintained/632-S/"
  },
  {
    "part_number": "632-SC3",
    "url": "https://linemaster.com/product/125/Clipper-Single-Momentary/632-SC3/"
  },
  {
    "part_number": "632-SC36",
    "url": "https://linemaster.com/product/126/Clipper-Single-Momentary/632-SC36/"
  },
  {
    "part_number": "633-S",
    "url": "https://linemaster.com/product/127/Clipper-Single-Momentary/633-S/"
  },
  {
    "part_number": "635-S",
    "url": "https://linemaster.com/product/129/Clipper-Single-Momentary/635-S/"
  },
  {
    "part_number": "636-S",
    "url": "https://linemaster.com/product/130/Clipper-Single-Momentary/636-S/"
  },
  {
    "part_number": "638-SC38",
    "url": "https://linemaster.com/product/132/Clipper-Single-Momentary/638-SC38/"
  },
  {
    "part_number": "911-SZA",
    "url": "https://linemaster.com/product/493/clipper-ii/"
  },
  {
    "part_number": "TWIN 632-S",
    "url": "https://linemaster.com/product/115/clipper-twin-momentary/"
  },
  {
    "part_number": "TWIN 635-S",
    "url": "https://linemaster.com/product/116/Clipper-Twin-Momentary/TWIN%20635-S/"
  },
  {
    "part_number": "642-DA",
    "url": "https://linemaster.com/product/117/clipper-wide-treadle-maintained/"
  },
  {
    "part_number": "642-S",
    "url": "https://linemaster.com/product/118/Clipper-Wide-Treadle-Maintained/642-S/"
  },
  {
    "part_number": "646-S",
    "url": "https://linemaster.com/product/121/Clipper-Wide-Treadle-Momentary/646-S/"
  },
  {
    "part_number": "491-S",
    "url": "https://linemaster.com/product/135/compact/"
  },
  {
    "part_number": "491-SC3",
    "url": "https://linemaster.com/product/136/Compact/491-SC3/"
  },
  {
    "part_number": "491-SC36",
    "url": "https://linemaster.com/product/137/Compact/491-SC36/"
  },
  {
    "part_number": "491-SC36MP",
    "url": "https://linemaster.com/product/138/Compact/491-SC36MP/"
  },
  {
    "part_number": "492-S",
    "url": "https://linemaster.com/product/139/Compact/492-S/"
  },
  {
    "part_number": "TWIN 491-S",
    "url": "https://linemaster.com/product/133/Compact/TWIN%20491-S/"
  },
  {
    "part_number": "81-S",
    "url": "https://linemaster.com/product/141/deluxe/"
  },
  {
    "part_number": "85-S",
    "url": "https://linemaster.com/product/142/Deluxe/85-S/"
  },
  {
    "part_number": "D42-SNO28",
    "url": "https://linemaster.com/product/147/dolphin/"
  },
  {
    "part_number": "476-S",
    "url": "https://linemaster.com/product/148/duplex/"
  },
  {
    "part_number": "982-SC3",
    "url": "https://linemaster.com/product/486/electronic-ac-speed-control/"
  },
  {
    "part_number": "982-SC36",
    "url": "https://linemaster.com/product/487/Electronic-Ac-Speed-Control/982-SC36/"
  },
  {
    "part_number": "72",
    "url": "https://linemaster.com/product/149/executive/"
  },
  {
    "part_number": "74",
    "url": "https://linemaster.com/product/150/Executive/74/"
  },
  {
    "part_number": "592-EX",
    "url": "https://linemaster.com/product/155/explosion-proof-industrial-500/"
  },
  {
    "part_number": "594-EX",
    "url": "https://linemaster.com/product/156/Explosion-Proof-Industrial-500/594-EX/"
  },
  {
    "part_number": "597-EX",
    "url": "https://linemaster.com/product/157/Explosion-Proof-Industrial-500/597-EX/"
  },
  {
    "part_number": "602-EX",
    "url": "https://linemaster.com/product/158/explosion-proof-industrial-600/"
  },
  {
    "part_number": "604-EX",
    "url": "https://linemaster.com/product/159/Explosion-Proof-Industrial-600/604-EX/"
  },
  {
    "part_number": "607-EX",
    "url": "https://linemaster.com/product/160/Explosion-Proof-Industrial-600/607-EX/"
  },
  {
    "part_number": "591-EX",
    "url": "https://linemaster.com/product/151/explosion-proof-medical-500/"
  },
  {
    "part_number": "596-EX",
    "url": "https://linemaster.com/product/152/Explosion-Proof-Medical-500/596-EX/"
  },
  {
    "part_number": "601-EX",
    "url": "https://linemaster.com/product/153/explosion-proof-medical-600/"
  },
  {
    "part_number": "606-EX",
    "url": "https://linemaster.com/product/154/Explosion-Proof-Medical-600/606-EX/"
  },
  {
    "part_number": "GEM-V2",
    "url": "https://linemaster.com/product/161/gem-v/"
  },
  {
    "part_number": "GEM-V3",
    "url": "https://linemaster.com/product/162/Gem-V/GEM-V3/"
  },
  {
    "part_number": "GEM-V36",
    "url": "https://linemaster.com/product/163/Gem-V/GEM-V36/"
  },
  {
    "part_number": "GEM-VCEA",
    "url": "https://linemaster.com/product/164/Gem-V/GEM-VCEA/"
  },
  {
    "part_number": "GEM-VK3",
    "url": "https://linemaster.com/product/165/Gem-V/GEM-VK3/"
  },
  {
    "part_number": "GEM-VK36",
    "url": "https://linemaster.com/product/166/Gem-Vk/GEM-VK36/"
  },
  {
    "part_number": "531-SWH",
    "url": "https://linemaster.com/product/167/hercules-full-shield/"
  },
  {
    "part_number": "531-SWHC2",
    "url": "https://linemaster.com/product/168/Hercules-Full-Shield/531-SWHC2/"
  },
  {
    "part_number": "532-SWH",
    "url": "https://linemaster.com/product/170/Hercules-Full-Shield/532-SWH/"
  },
  {
    "part_number": "533-SWH",
    "url": "https://linemaster.com/product/171/Hercules-Full-Shield/533-SWH/"
  },
  {
    "part_number": "533-SWHC2",
    "url": "https://linemaster.com/product/172/Hercules-Full-Shield/533-SWHC2/"
  },
  {
    "part_number": "534-SWH",
    "url": "https://linemaster.com/product/173/Hercules-Full-Shield/534-SWH/"
  },
  {
    "part_number": "535-SWH",
    "url": "https://linemaster.com/product/174/Hercules-Full-Shield/535-SWH/"
  },
  {
    "part_number": "536-SWH",
    "url": "https://linemaster.com/product/175/Hercules-Full-Shield/536-SWH/"
  },
  {
    "part_number": "537-SWH",
    "url": "https://linemaster.com/product/176/Hercules-Full-Shield/537-SWH/"
  },
  {
    "part_number": "538-SWH",
    "url": "https://linemaster.com/product/177/Hercules-Full-Shield/538-SWH/"
  },
  {
    "part_number": "571-DWH",
    "url": "https://linemaster.com/product/178/Hercules-Full-Shield/571-DWH/"
  },
  {
    "part_number": "572-DWH",
    "url": "https://linemaster.com/product/179/Hercules-Full-Shield/572-DWH/"
  },
  {
    "part_number": "573-DWH",
    "url": "https://linemaster.com/product/180/Hercules-Full-Shield/573-DWH/"
  },
  {
    "part_number": "573-DWHC2",
    "url": "https://linemaster.com/product/181/Hercules-Full-Shield/573-DWHC2/"
  },
  {
    "part_number": "574-DWHD",
    "url": "https://linemaster.com/product/184/Hercules-Full-Shield/574-DWHD/"
  },
  {
    "part_number": "574-DWHA",
    "url": "https://linemaster.com/product/183/Hercules-Full-Shield/574-DWHA/"
  },
  {
    "part_number": "575-DWH",
    "url": "https://linemaster.com/product/185/Hercules-Full-Shield/575-DWH/"
  },
  {
    "part_number": "575-DWHA",
    "url": "https://linemaster.com/product/186/Hercules-Full-Shield/575-DWHA/"
  },
  {
    "part_number": "531-SWN",
    "url": "https://linemaster.com/product/234/hercules-no-shield/"
  },
  {
    "part_number": "532-SWN",
    "url": "https://linemaster.com/product/235/Hercules-No-Shield/532-SWN/"
  },
  {
    "part_number": "533-SWN",
    "url": "https://linemaster.com/product/236/Hercules-No-Shield/533-SWN/"
  },
  {
    "part_number": "534-SWN",
    "url": "https://linemaster.com/product/237/Hercules-No-Shield/534-SWN/"
  },
  {
    "part_number": "535-SWN",
    "url": "https://linemaster.com/product/238/Hercules-No-Shield/535-SWN/"
  },
  {
    "part_number": "536-SWN",
    "url": "https://linemaster.com/product/239/Hercules-No-Shield/536-SWN/"
  },
  {
    "part_number": "537-SWN",
    "url": "https://linemaster.com/product/240/Hercules-No-Shield/537-SWN/"
  },
  {
    "part_number": "538-SWN",
    "url": "https://linemaster.com/product/241/Hercules-No-Shield/538-SWN/"
  },
  {
    "part_number": "571-DWN",
    "url": "https://linemaster.com/product/242/Hercules-No-Shield/571-DWN/"
  },
  {
    "part_number": "572-DWN",
    "url": "https://linemaster.com/product/243/Hercules-No-Shield/572-DWN/"
  },
  {
    "part_number": "573-DWN",
    "url": "https://linemaster.com/product/244/Hercules-No-Shield/573-DWN/"
  },
  {
    "part_number": "574-DWN",
    "url": "https://linemaster.com/product/245/Hercules-No-Shield/574-DWN/"
  },
  {
    "part_number": "575-DWN",
    "url": "https://linemaster.com/product/246/Hercules-No-Shield/575-DWN/"
  },
  {
    "part_number": "531-SWHOC2",
    "url": "https://linemaster.com/product/497/hercules-o-shield/"
  },
  {
    "part_number": "532-SWHOC2",
    "url": "https://linemaster.com/product/512/Hercules-O-Shield/532-SWHOC2/"
  },
  {
    "part_number": "531-SWHO",
    "url": "https://linemaster.com/product/192/Hercules-O-Shield/531-SWHO/"
  },
  {
    "part_number": "532-SWHO",
    "url": "https://linemaster.com/product/193/Hercules-Oversized-Shield/532-SWHO/"
  },
  {
    "part_number": "533-SWHO",
    "url": "https://linemaster.com/product/194/Hercules-Oversized-Shield/533-SWHO/"
  },
  {
    "part_number": "534-SWHO",
    "url": "https://linemaster.com/product/195/Hercules-Oversized-Shield/534-SWHO/"
  },
  {
    "part_number": "535-SWHO",
    "url": "https://linemaster.com/product/196/Hercules-Oversized-Shield/535-SWHO/"
  },
  {
    "part_number": "536-SWHO",
    "url": "https://linemaster.com/product/197/Hercules-Oversized-Shield/536-SWHO/"
  },
  {
    "part_number": "537-SWHO",
    "url": "https://linemaster.com/product/198/Hercules-Oversized-Shield/537-SWHO/"
  },
  {
    "part_number": "538-SWHO",
    "url": "https://linemaster.com/product/199/Hercules-Oversized-Shield/538-SWHO/"
  },
  {
    "part_number": "571-DWHO",
    "url": "https://linemaster.com/product/200/Hercules-Oversized-Shield/571-DWHO/"
  },
  {
    "part_number": "572-DWHO",
    "url": "https://linemaster.com/product/201/Hercules-Oversized-Shield/572-DWHO/"
  },
  {
    "part_number": "573-DWHO",
    "url": "https://linemaster.com/product/202/Hercules-Oversized-Shield/573-DWHO/"
  },
  {
    "part_number": "574-DWHO",
    "url": "https://linemaster.com/product/203/Hercules-Oversized-Shield/574-DWHO/"
  },
  {
    "part_number": "575-DWHO",
    "url": "https://linemaster.com/product/206/Hercules-Oversized-Shield/575-DWHO/"
  },
  {
    "part_number": "575-DWHOA",
    "url": "https://linemaster.com/product/207/Hercules-Oversized-Shield/575-DWHOA/"
  },
  {
    "part_number": "531-SWHOX",
    "url": "https://linemaster.com/product/213/hercules-ox-shield/"
  },
  {
    "part_number": "532-SWHOX",
    "url": "https://linemaster.com/product/214/Hercules-Ox-Shield/532-SWHOX/"
  },
  {
    "part_number": "533-SWHOX",
    "url": "https://linemaster.com/product/215/Hercules-Ox-Shield/533-SWHOX/"
  },
  {
    "part_number": "534-SWHOX",
    "url": "https://linemaster.com/product/216/Hercules-Ox-Shield/534-SWHOX/"
  },
  {
    "part_number": "535-SWHOX",
    "url": "https://linemaster.com/product/217/Hercules-Ox-Shield/535-SWHOX/"
  },
  {
    "part_number": "536-SWHOX",
    "url": "https://linemaster.com/product/218/Hercules-Ox-Shield/536-SWHOX/"
  },
  {
    "part_number": "537-SWHOX",
    "url": "https://linemaster.com/product/219/Hercules-Ox-Shield/537-SWHOX/"
  },
  {
    "part_number": "538-SWHOX",
    "url": "https://linemaster.com/product/220/Hercules-Ox-Shield/538-SWHOX/"
  },
  {
    "part_number": "571-DWHOX",
    "url": "https://linemaster.com/product/221/Hercules-Ox-Shield/571-DWHOX/"
  },
  {
    "part_number": "572-DWHOX",
    "url": "https://linemaster.com/product/222/Hercules-Ox-Shield/572-DWHOX/"
  },
  {
    "part_number": "573-DWHOX",
    "url": "https://linemaster.com/product/223/Hercules-Ox-Shield/573-DWHOX/"
  },
  {
    "part_number": "574-DWHOX",
    "url": "https://linemaster.com/product/224/Hercules-Ox-Shield/574-DWHOX/"
  },
  {
    "part_number": "574-DWHOXA",
    "url": "https://linemaster.com/product/225/Hercules-Ox-Shield/574-DWHOXA/"
  },
  {
    "part_number": "574-DWHOXD",
    "url": "https://linemaster.com/product/226/Hercules-Ox-Shield/574-DWHOXD/"
  },
  {
    "part_number": "575-DWHOX",
    "url": "https://linemaster.com/product/227/Hercules-Ox-Shield/575-DWHOX/"
  },
  {
    "part_number": "575-DWHOXA",
    "url": "https://linemaster.com/product/228/Hercules-Ox-Shield/575-DWHOXA/"
  },
  {
    "part_number": "500-AH-1K",
    "url": "https://linemaster.com/product/250/hercules-potentiometer-full-shield/"
  },
  {
    "part_number": "500-AH-10K",
    "url": "https://linemaster.com/product/252/Hercules-Potentiometer-Full-Shield/500-AH-10K/"
  },
  {
    "part_number": "500-AH-5K",
    "url": "https://linemaster.com/product/261/Hercules-Potentiometer-Full-Shield/500-AH-5K/"
  },
  {
    "part_number": "500-A2H-1K",
    "url": "https://linemaster.com/product/265/hercules-potentiometer-full-shield/"
  },
  {
    "part_number": "500-A2H-10K",
    "url": "https://linemaster.com/product/266/Hercules-Potentiometer-Full-Shield/500-A2H-10K/"
  },
  {
    "part_number": "500-A2H-5K",
    "url": "https://linemaster.com/product/270/Hercules-Potentiometer-Full-Shield/500-A2H-5K/"
  },
  {
    "part_number": "500-A3H-10K",
    "url": "https://linemaster.com/product/274/Hercules-Potentiometer-Full-Shield/500-A3H-10K/"
  },
  {
    "part_number": "500-A3H-5K",
    "url": "https://linemaster.com/product/276/Hercules-Potentiometer-Full-Shield/500-A3H-5K/"
  },
  {
    "part_number": "500-A3H-1K",
    "url": "https://linemaster.com/product/273/hercules-potentiometer-full-shield/"
  },
  {
    "part_number": "500-H-10K",
    "url": "https://linemaster.com/product/282/Hercules-Potentiometer-Full-Shield/500-H-10K/"
  },
  {
    "part_number": "500-H-5K",
    "url": "https://linemaster.com/product/289/Hercules-Potentiometer-Full-Shield/500-H-5K/"
  },
  {
    "part_number": "500-AN-1K",
    "url": "https://linemaster.com/product/327/hercules-potentiometer-no-shield/"
  },
  {
    "part_number": "500-AN-10K",
    "url": "https://linemaster.com/product/329/Hercules-Potentiometer-No-Shield/500-AN-10K/"
  },
  {
    "part_number": "500-AN-250",
    "url": "https://linemaster.com/product/336/Hercules-Potentiometer-No-Shield/500-AN-250/"
  },
  {
    "part_number": "500-AN-5K",
    "url": "https://linemaster.com/product/338/Hercules-Potentiometer-No-Shield/500-AN-5K/"
  },
  {
    "part_number": "500-A2N-10K",
    "url": "https://linemaster.com/product/344/hercules-potentiometer-no-shield/"
  },
  {
    "part_number": "500-A2N-5K",
    "url": "https://linemaster.com/product/346/Hercules-Potentiometer-No-Shield/500-A2N-5K/"
  },
  {
    "part_number": "500-N-10K",
    "url": "https://linemaster.com/product/349/Hercules-Potentiometer-No-Shield/500-N-10K/"
  },
  {
    "part_number": "500-N-1K",
    "url": "https://linemaster.com/product/348/Hercules-Potentiometer-No-Shield/500-N-1K/"
  },
  {
    "part_number": "500-N-5K",
    "url": "https://linemaster.com/product/355/Hercules-Potentiometer-No-Shield/500-N-5K/"
  },
  {
    "part_number": "500-A3HO-5K",
    "url": "https://linemaster.com/product/279/hercules-potentiometer-o-shield/"
  },
  {
    "part_number": "500-AHO-1K",
    "url": "https://linemaster.com/product/293/hercules-potentiometer-o-shield/"
  },
  {
    "part_number": "500-AHO-5K",
    "url": "https://linemaster.com/product/304/Hercules-Potentiometer-O-Shield/500-AHO-5K/"
  },
  {
    "part_number": "500-A2HO-1K",
    "url": "https://linemaster.com/product/308/hercules-potentiometer-o-shield/"
  },
  {
    "part_number": "500-A2HO-10K",
    "url": "https://linemaster.com/product/309/Hercules-Potentiometer-O-Shield/500-A2HO-10K/"
  },
  {
    "part_number": "500-A2HO-5K",
    "url": "https://linemaster.com/product/310/Hercules-Potentiometer-O-Shield/500-A2HO-5K/"
  },
  {
    "part_number": "500-HO-1K",
    "url": "https://linemaster.com/product/313/hercules-potentiometer-o-shield/"
  },
  {
    "part_number": "500-HO-10K",
    "url": "https://linemaster.com/product/314/Hercules-Potentiometer-O-Shield/500-HO-10K/"
  },
  {
    "part_number": "500-HO-5K",
    "url": "https://linemaster.com/product/316/Hercules-Potentiometer-O-Shield/500-HO-5K/"
  },
  {
    "part_number": "500-A2HOX-10K",
    "url": "https://linemaster.com/product/311/hercules-potentiometer-ox-shield/"
  },
  {
    "part_number": "500-AHOX-1K",
    "url": "https://linemaster.com/product/318/hercules-potentiometer-ox-shield/"
  },
  {
    "part_number": "500-AHOX-10K",
    "url": "https://linemaster.com/product/319/Hercules-Potentiometer-Ox-Shield/500-AHOX-10K/"
  },
  {
    "part_number": "500-AHOX-5K",
    "url": "https://linemaster.com/product/320/Hercules-Potentiometer-Ox-Shield/500-AHOX-5K/"
  },
  {
    "part_number": "500-A3HOX-10K",
    "url": "https://linemaster.com/product/322/hercules-potentiometer-ox-shield/"
  },
  {
    "part_number": "500-HOX-1K",
    "url": "https://linemaster.com/product/323/hercules-potentiometer-ox-shield/"
  },
  {
    "part_number": "500-HOX-10K",
    "url": "https://linemaster.com/product/324/Hercules-Potentiometer-Ox-Shield/500-HOX-10K/"
  },
  {
    "part_number": "500-HOX-5K",
    "url": "https://linemaster.com/product/326/Hercules-Potentiometer-Ox-Shield/500-HOX-5K/"
  },
  {
    "part_number": "121-S",
    "url": "https://linemaster.com/product/361/junior/"
  },
  {
    "part_number": "124-S",
    "url": "https://linemaster.com/product/362/Junior/124-S/"
  },
  {
    "part_number": "L-2-S",
    "url": "https://linemaster.com/product/363/lektro-lok/"
  },
  {
    "part_number": "WP-541-SC",
    "url": "https://linemaster.com/product/364/nautilus/"
  },
  {
    "part_number": "P31-SC3",
    "url": "https://linemaster.com/product/366/premier/"
  },
  {
    "part_number": "P31-SC36",
    "url": "https://linemaster.com/product/367/Premier/P31-SC36/"
  },
  {
    "part_number": "P32-S",
    "url": "https://linemaster.com/product/368/Premier/P32-S/"
  },
  {
    "part_number": "SP-831-111000XA",
    "url": "https://linemaster.com/product/475/radio-frequency-wireless-hercules/"
  },
  {
    "part_number": "SP-831-111101XA",
    "url": "https://linemaster.com/product/476/Radio-Frequency-Wireless-Hercules/SP-831-111101XA/"
  },
  {
    "part_number": "SP-831-111202XA",
    "url": "https://linemaster.com/product/477/Radio-Frequency-Wireless-Hercules/SP-831-111202XA/"
  },
  {
    "part_number": "SP-831-111100XA",
    "url": "https://linemaster.com/product/506/rf-wireless-hercules-with-handle/"
  },
  {
    "part_number": "SP-831-111201XA",
    "url": "https://linemaster.com/product/507/Rf-Wireless-Hercules-With-Handle/SP-831-111201XA/"
  },
  {
    "part_number": "SP-831-111302XA",
    "url": "https://linemaster.com/product/508/Rf-Wireless-Hercules-With-Handle/SP-831-111302XA/"
  },
  {
    "part_number": "SL1-S",
    "url": "https://linemaster.com/product/369/slim-line/"
  },
  {
    "part_number": "SL1-SWBNO210",
    "url": "https://linemaster.com/product/370/Slim-Line/SL1-SWBNO210/"
  },
  {
    "part_number": "SL2-S",
    "url": "https://linemaster.com/product/371/Slim-Line/SL2-S/"
  },
  {
    "part_number": "SL2-SWBNO410",
    "url": "https://linemaster.com/product/372/Slim-Line/SL2-SWBNO410/"
  },
  {
    "part_number": "T-91-PS",
    "url": "https://linemaster.com/product/377/treadlite-ii/"
  },
  {
    "part_number": "T-91-S",
    "url": "https://linemaster.com/product/378/Treadlite-Ii/T-91-S/"
  },
  {
    "part_number": "T-91-SCE",
    "url": "https://linemaster.com/product/379/Treadlite-Ii/T-91-SCE/"
  },
  {
    "part_number": "T-91-SCEA",
    "url": "https://linemaster.com/product/380/Treadlite-Ii/T-91-SCEA/"
  },
  {
    "part_number": "T-91-SC3",
    "url": "https://linemaster.com/product/381/Treadlite-Ii/T-91-SC3/"
  },
  {
    "part_number": "T-91-SC3A",
    "url": "https://linemaster.com/product/382/Treadlite-Ii/T-91-SC3A/"
  },
  {
    "part_number": "T-91-SC36",
    "url": "https://linemaster.com/product/383/Treadlite-Ii/T-91-SC36/"
  },
  {
    "part_number": "T-91-SC36A",
    "url": "https://linemaster.com/product/384/Treadlite-Ii/T-91-SC36A/"
  },
  {
    "part_number": "T-91-SE",
    "url": "https://linemaster.com/product/385/Treadlite-Ii/T-91-SE/"
  },
  {
    "part_number": "T-91-PSNC",
    "url": "https://linemaster.com/product/501/Treadlite-Ii/T-91-PSNC/"
  },
  {
    "part_number": "TWIN T-91-S",
    "url": "https://linemaster.com/product/386/Treadlite-Ii/TWIN%20T-91-S/"
  },
  {
    "part_number": "TWIN T-91-SC48",
    "url": "https://linemaster.com/product/387/Treadlite-Ii/TWIN%20T-91-SC48/"
  },
  {
    "part_number": "T-91-SWANOS",
    "url": "https://linemaster.com/product/388/treadlite-ii-stainless-steel/"
  },
  {
    "part_number": "T-91-SWANO3S",
    "url": "https://linemaster.com/product/389/Treadlite-Ii-Stainless-Steel/T-91-SWANO3S/"
  },
  {
    "part_number": "T-91-SWANO38S",
    "url": "https://linemaster.com/product/390/Treadlite-Ii-Stainless-Steel/T-91-SWANO38S/"
  },
  {
    "part_number": "81DH12",
    "url": "https://linemaster.com/product/392/vanguard-maintained/"
  },
  {
    "part_number": "81SH12",
    "url": "https://linemaster.com/product/391/Vanguard-Momentary/81SH12/"
  },
  {
    "part_number": "PBSH12",
    "url": "https://linemaster.com/product/393/Vanguard-Momentary/PBSH12/"
  },
  {
    "part_number": "09ASAC-1K",
    "url": "https://linemaster.com/product/407/varior-potentiometer/"
  },
  {
    "part_number": "09ASAC-10K",
    "url": "https://linemaster.com/product/409/Varior-Potentiometer/09ASAC-10K/"
  },
  {
    "part_number": "09ASAC-5K",
    "url": "https://linemaster.com/product/421/Varior-Potentiometer/09ASAC-5K/"
  },
  {
    "part_number": "09ASXP-1K",
    "url": "https://linemaster.com/product/427/varior-potentiometer/"
  },
  {
    "part_number": "09ASXP-10K",
    "url": "https://linemaster.com/product/429/Varior-Potentiometer/09ASXP-10K/"
  },
  {
    "part_number": "09ASXP-5K",
    "url": "https://linemaster.com/product/439/Varior-Potentiometer/09ASXP-5K/"
  },
  {
    "part_number": "OHASAB-10K",
    "url": "https://linemaster.com/product/448/varior-potentiometer/"
  },
  {
    "part_number": "OHASAC-10K",
    "url": "https://linemaster.com/product/451/varior-potentiometer/"
  },
  {
    "part_number": "OHASAC-5K",
    "url": "https://linemaster.com/product/452/Varior-Potentiometer/OHASAC-5K/"
  }
];
