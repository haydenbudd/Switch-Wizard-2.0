-- Fix image URLs: use correct CDN image IDs from scraped data
-- Corrects 159 products whose image_url used the page ID instead of the actual CDN image ID

UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/1/1-a-shadow@1200.png' WHERE id = 1; -- 41DH12
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/11/11-a-shadow@1200.png' WHERE id = 4; -- 2E-30A2-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/12/12-a-shadow@1200.png' WHERE id = 5; -- 3E-30A2-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/12/12-a-shadow@1200.png' WHERE id = 6; -- 3E-20V2-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/18/18-a-shadow@1200.png' WHERE id = 15; -- 3H-25H2-S4H
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/22/22-a-shadow@1200.png' WHERE id = 19; -- 4H-30H2-DHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/18/18-a-shadow@1200.png' WHERE id = 21; -- 3H-25H2-S4HOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/27/27-a-shadow@1200.png' WHERE id = 24; -- 511-B2A
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/27/27-a-shadow@1200.png' WHERE id = 25; -- 511-B4A
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/27/27-a-shadow@1200.png' WHERE id = 26; -- 511-B2
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/27/27-a-shadow@1200.png' WHERE id = 27; -- 511-B4
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/27/27-a-shadow@1200.png' WHERE id = 29; -- 511-B3
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/29/29-a-shadow@1200.png' WHERE id = 33; -- 511-B2GA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/29/29-a-shadow@1200.png' WHERE id = 34; -- 511-B4GA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/29/29-a-shadow@1200.png' WHERE id = 35; -- 511-B2G
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/29/29-a-shadow@1200.png' WHERE id = 36; -- 511-B4G
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/29/29-a-shadow@1200.png' WHERE id = 37; -- 511-B3G
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/48/48-a-shadow@1200.png' WHERE id = 39; -- 511-B2OXG
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/48/48-a-shadow@1200.png' WHERE id = 40; -- 511-B2OXGA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/48/48-a-shadow@1200.png' WHERE id = 41; -- 511-B3OXG
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/48/48-a-shadow@1200.png' WHERE id = 42; -- 511-B4OXG
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/48/48-a-shadow@1200.png' WHERE id = 43; -- 511-B4OXGA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/35/35-a-shadow@1200.png' WHERE id = 45; -- 511-B2OA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/35/35-a-shadow@1200.png' WHERE id = 46; -- 511-B4OA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/35/35-a-shadow@1200.png' WHERE id = 48; -- 511-B2O
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/35/35-a-shadow@1200.png' WHERE id = 49; -- 511-B4O
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/35/35-a-shadow@1200.png' WHERE id = 50; -- 511-B3O
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/42/42-a-shadow@1200.png' WHERE id = 52; -- 511-B2OXA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/42/42-a-shadow@1200.png' WHERE id = 53; -- 511-B4OXA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/42/42-a-shadow@1200.png' WHERE id = 54; -- 511-B2OX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/42/42-a-shadow@1200.png' WHERE id = 55; -- 511-B4OX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/42/42-a-shadow@1200.png' WHERE id = 56; -- 511-B3OX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/74/74-a-shadow@1200.png' WHERE id = 59; -- 971-DC38JM
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/70/70-a-shadow@1200.png' WHERE id = 63; -- 971-DC28J
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/77/77-a-shadow@1200.png' WHERE id = 82; -- 937-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/79/79-a-shadow@1200.png' WHERE id = 83; -- 937-SWHC4
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/95/95-a-shadow@1200.png' WHERE id = 85; -- 937-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/95/95-a-shadow@1200.png' WHERE id = 86; -- 937-SWNC4
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/86/86-a-shadow@1200.png' WHERE id = 88; -- 936-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/93/93-a-shadow@1200.png' WHERE id = 91; -- 936-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/93/93-a-shadow@1200.png' WHERE id = 94; -- 937-SWHOXC4
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/104/104-a-shadow@1200.png' WHERE id = 96; -- 78SN2
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/102/102-a-shadow@1200.png' WHERE id = 98; -- 78SH2
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/112/112-a-shadow@1200.png' WHERE id = 101; -- 88SN2-05
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/108/108-a-shadow@1200.png' WHERE id = 105; -- 88SH2-05
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/124/124-a-shadow@1200.png' WHERE id = 108; -- 632-DA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/124/124-a-shadow@1200.png' WHERE id = 110; -- 634-DA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/123/123-a-shadow@1200.png' WHERE id = 112; -- 632-SC3
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/124/124-a-shadow@1200.png' WHERE id = 114; -- 633-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/124/124-a-shadow@1200.png' WHERE id = 115; -- 635-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/124/124-a-shadow@1200.png' WHERE id = 116; -- 636-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/118/118-a-shadow@1200.png' WHERE id = 122; -- 642-DA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/118/118-a-shadow@1200.png' WHERE id = 124; -- 646-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/135/135-a-shadow@1200.png' WHERE id = 129; -- 492-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/141/141-a-shadow@1200.png' WHERE id = 132; -- 85-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/149/149-a-shadow@1200.png' WHERE id = 140; -- 74
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/155/155-a-shadow@1200.png' WHERE id = 142; -- 594-EX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/158/158-a-shadow@1200.png' WHERE id = 145; -- 604-EX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 159; -- 532-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 160; -- 533-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 162; -- 534-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 163; -- 535-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 164; -- 536-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 165; -- 537-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 166; -- 538-SWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 167; -- 571-DWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 168; -- 572-DWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 169; -- 573-DWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 171; -- 574-DWHD
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 172; -- 574-DWHA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 173; -- 575-DWH
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/167/167-a-shadow@1200.png' WHERE id = 174; -- 575-DWHA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 176; -- 532-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 177; -- 533-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 178; -- 534-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 179; -- 535-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 180; -- 536-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 181; -- 537-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 182; -- 538-SWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 183; -- 571-DWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 184; -- 572-DWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 185; -- 573-DWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 186; -- 574-DWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/234/234-a-shadow@1200.png' WHERE id = 187; -- 575-DWN
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 191; -- 532-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 192; -- 533-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 193; -- 534-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 194; -- 535-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 195; -- 536-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 196; -- 537-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 197; -- 538-SWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 198; -- 571-DWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 199; -- 572-DWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 200; -- 573-DWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 201; -- 574-DWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 204; -- 575-DWHO
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/192/192-a-shadow@1200.png' WHERE id = 205; -- 575-DWHOA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 207; -- 532-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 208; -- 533-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 209; -- 534-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 210; -- 535-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 211; -- 536-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 212; -- 537-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 213; -- 538-SWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 214; -- 571-DWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 215; -- 572-DWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 216; -- 573-DWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 217; -- 574-DWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 218; -- 574-DWHOXA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 219; -- 574-DWHOXD
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 220; -- 575-DWHOX
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/213/213-a-shadow@1200.png' WHERE id = 221; -- 575-DWHOXA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 222; -- 500-AH-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 223; -- 500-AH-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 225; -- 500-AH-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 228; -- 500-A2H-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 229; -- 500-A2H-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 231; -- 500-A2H-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 232; -- 500-A3H-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 233; -- 500-A3H-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 234; -- 500-A3H-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 238; -- 500-H-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 241; -- 500-AN-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 242; -- 500-AN-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 244; -- 500-AN-250
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 245; -- 500-AN-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 247; -- 500-A2N-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 248; -- 500-A2N-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 251; -- 500-N-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id = 253; -- 500-N-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/295/295-a-shadow@1200.png' WHERE id = 255; -- 500-AHO-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/295/295-a-shadow@1200.png' WHERE id = 258; -- 500-AHO-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/309/309-a-shadow@1200.png' WHERE id = 259; -- 500-A2HO-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/309/309-a-shadow@1200.png' WHERE id = 261; -- 500-A2HO-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/313/313-a-shadow@1200.png' WHERE id = 263; -- 500-HO-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/313/313-a-shadow@1200.png' WHERE id = 264; -- 500-HO-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/326/326-a-shadow@1200.png' WHERE id = 265; -- 500-A2HOX-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/326/326-a-shadow@1200.png' WHERE id = 266; -- 500-AHOX-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/326/326-a-shadow@1200.png' WHERE id = 267; -- 500-AHOX-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/326/326-a-shadow@1200.png' WHERE id = 268; -- 500-AHOX-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/326/326-a-shadow@1200.png' WHERE id = 269; -- 500-A3HOX-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/326/326-a-shadow@1200.png' WHERE id = 270; -- 500-HOX-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/326/326-a-shadow@1200.png' WHERE id = 271; -- 500-HOX-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/361/361-a-shadow@1200.png' WHERE id = 274; -- 124-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/365/365-a-shadow@1200.png' WHERE id = 276; -- WP-541-SC
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/477/477-a-shadow@1200.png' WHERE id = 281; -- SP-831-111101XA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/506/506-a-shadow@1200.png' WHERE id = 284; -- SP-831-111201XA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/506/506-a-shadow@1200.png' WHERE id = 285; -- SP-831-111302XA
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/369/369-a-shadow@1200.png' WHERE id = 288; -- SL2-S
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/421/421-a-shadow@1200.png' WHERE id = 309; -- 09ASAC-1K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/421/421-a-shadow@1200.png' WHERE id = 310; -- 09ASAC-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/427/427-a-shadow@1200.png' WHERE id = 313; -- 09ASXP-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/427/427-a-shadow@1200.png' WHERE id = 314; -- 09ASXP-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/447/447-a-shadow@1200.png' WHERE id = 317; -- OHASAB-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/453/453-a-shadow@1200.png' WHERE id = 318; -- OHASAC-10K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/453/453-a-shadow@1200.png' WHERE id = 319; -- OHASAC-5K
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/106/106-a-shadow@1200.png' WHERE id = 784; -- TWIN 88SH2-05
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/110/110-a-shadow@1200.png' WHERE id = 788; -- TWIN 88SN2-05
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/115/115-a-shadow@1200.png' WHERE id = 801; -- TWIN 635-S

-- Fix 7 products with no image at all - use series-level fallback images
-- id=64: no series, part=998-XX (unknown product, leave null)
-- id=249: no series, part=500-A2N-100 (Hercules No Shield Potentiometer variant based on part number pattern)
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png', series = 'Hercules No Shield Potentiometer' WHERE id = 249;
-- id=320: Cordsets, part=SF-515-D16 (accessory, use Varior image since SF-515 is a Varior cordset)
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/421/421-a-shadow@1200.png' WHERE id = 320;
-- id=591: Hercules Full Potentiometer (use series representative: 289)
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/289/289-a-shadow@1200.png' WHERE id = 591;
-- id=605,608: Hercules No Shield Potentiometer (use series representative: 349)
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/349/349-a-shadow@1200.png' WHERE id IN (605, 608);
-- id=678: Varior Potentiometer (use series representative: 421)
UPDATE "Stock Switches" SET image_url = 'https://linemaster.com/cdn/images/products/421/421-a-shadow@1200.png' WHERE id = 678;

-- Fix bad Link values
UPDATE "Stock Switches" SET "Link" = NULL WHERE "Link" IN ('#', 'ra', '');
-- Fix Links that contain image URLs instead of product page URLs
UPDATE "Stock Switches" SET "Link" = NULL WHERE "Link" LIKE '%/cdn/images/%';
