/**
 * One approved display string.
 *
 * `sheetId` is a row in the generated zh-TW JSON.
 * `enHash` is the sha256 of the Forge Steel English at the moment this row
 * was approved. `scripts/l10n/check.mjs` recomputes that English from
 * upstream data and fails when the hash no longer matches.
 *
 * `stripHeading` marks a rules row whose sheet text starts with a title line
 * and a blank line. Display drops those two lines. The export keeps them.
 */
export interface MappingEntry {
	sheetId: string;
	enHash: string;
	stripHeading?: true;
}

/**
 * Forge Steel display key → approved sheet row.
 *
 * Keys:
 *   element:<id>:<field>   for example element:ancestry-orc:name
 *   enum:<Enum>:<Member>   for example enum:Characteristic:Might
 *   data:<Class>:<field>   for example data:ConditionData:bleeding
 *   ui:<id>                for example ui:library.ancestries
 */
export const mapping: Record<string, MappingEntry> = {
	'enum:ConditionType:Bleeding': { sheetId: 'term.bleeding', enHash: '68a89d8475444066a48efe8debcef05fc25306d5f950db02d9bec6cc3e61e4d4' },
	'data:ConditionData:bleeding': { sheetId: 'heroes.conditions.bleeding.rules', enHash: 'd88a981038c39238673b38ef8d5b4b46b192d0ff55c94b30f72fcb8864cbe8fd', stripHeading: true },
	'enum:ConditionType:Dazed': { sheetId: 'term.dazed', enHash: '885b940d512c1f48cb8a32d5050192046c57facff335b5f4fff97812a057ed69' },
	'data:ConditionData:dazed': { sheetId: 'heroes.conditions.dazed.rules', enHash: '7dbd60a940360411a7d173b55aae6de5625e7c99ee37a77a444fe966a68f2063', stripHeading: true },
	'enum:ConditionType:Frightened': { sheetId: 'term.frightened', enHash: '6ac39a6938218b25279d6d02792cbbf186fec0e9b44e284a7beade23d12d37c5' },
	'data:ConditionData:frightened': { sheetId: 'heroes.conditions.frightened.rules', enHash: '22313b6cda8cc7e5cf075eb06bb1c035eca64ce0c515105bbe79a4c8703841c3', stripHeading: true },
	'enum:ConditionType:Grabbed': { sheetId: 'term.grabbed', enHash: 'cdb542525944d27df3ee03f85782c77de90ede57ba80f8096dd8a475208a14eb' },
	'enum:ConditionType:Prone': { sheetId: 'term.prone', enHash: '4d99dff1fb964110812ea0fbf1dbb836fec22cd3148c5f304feec35c969e88f4' },
	'enum:ConditionType:Restrained': { sheetId: 'term.restrained', enHash: '0b83fa4760bfd0a27819b8527b904ce372cce9abeda90be4f4a2f0907b8d0f55' },
	'data:ConditionData:restrained': { sheetId: 'heroes.conditions.restrained.rules', enHash: '0ecc5f9cd7e868fd7cb9887b9f2b201cada6cdc1ccbe1f4332e7e9ae4fde4ba9', stripHeading: true },
	'enum:ConditionType:Slowed': { sheetId: 'term.slowed', enHash: '851048823b87faa3ea81132afad085f7d46c259da0ce6206e47b865018018f8a' },
	'data:ConditionData:slowed': { sheetId: 'heroes.conditions.slowed.rules', enHash: '5f3c1bcbc07244a573fdeea01fdf556851c0e7d9a393525d370a886996f25975', stripHeading: true },
	'enum:ConditionType:Taunted': { sheetId: 'term.taunted', enHash: '73a737d615833672e97a4f912ae7b6ba7804308c6275a4be329e5ed26cee2d8b' },
	'data:ConditionData:taunted': { sheetId: 'heroes.conditions.taunted.rules', enHash: 'b1b60b06498d1d2d4459c003f912ed2fc157fb6b8811c4ba0b808e2081d13dd7', stripHeading: true },
	'enum:ConditionType:Weakened': { sheetId: 'term.weakened', enHash: '2fabd8091e1d12a5db535d011eafa4581cccbc11c6179c5114e46c0075a44a9d' },
	'data:ConditionData:weakened': { sheetId: 'heroes.conditions.weakened.rules', enHash: 'ea0e2b4c0e17cecdca16fb0f1279b5794d527e79a336ead39bf69af318f0265e', stripHeading: true },
	'enum:Characteristic:Might': { sheetId: 'term.might', enHash: 'f68b032edc2230443f299ef26e02607744624f032195c026102979f51a9570ed' },
	'enum:Characteristic:Agility': { sheetId: 'term.agility', enHash: '49796694dc6770112a10ab0c588fc67e1d793ed6f4fa80184090edcaf9712a12' },
	'enum:Characteristic:Reason': { sheetId: 'term.reason', enHash: 'f81ab834de5f84918dc040b884267c2b61cb1a52d46442de10e97f35a94d0500' },
	'enum:Characteristic:Intuition': { sheetId: 'term.intuition', enHash: '680274b27b43c79375bff96cac66a9b56ccaab7eff364612faf98ada603f7a31' },
	'enum:Characteristic:Presence': { sheetId: 'term.presence', enHash: 'd6b3e8c828d3742089ed59ebbfd89492ec2ce0bc89a19294cae52a6ac233b244' },
	'element:ancestry-orc:name': { sheetId: 'heroes.ancestries.orc.name', enHash: '3907af2e3409c8737e09736dee955306c798dc0c1ce5a728d2d806278f4d8e0b' },
	'element:ancestry-orc:description': { sheetId: 'heroes.ancestries.orc.description.1', enHash: '64caf7a29d7c79c9fd22811918917a2bd2b7f0d81f00df14bc1b1aeb0679238a' },
	'element:orc-feature-1:name': { sheetId: 'heroes.ancestries.orc.signature.relentless.name', enHash: '4cf92935c62ffa8219001e1d9378d741ee32c3542b98f5aa44763529b78f90b5' },
	'element:orc-feature-1:description': { sheetId: 'heroes.ancestries.orc.signature.relentless.effect', enHash: '1de8897e5dce168566a29a8bc08c6baa2f0b5f5127f01dfaae53273e58805653' },
	'element:orc-feature-2-1:name': { sheetId: 'heroes.ancestries.orc.trait.bloodfire-rush.name', enHash: '11cadc6649cbc84b6bffd055f10e83838b88c517d8cec2e4f52b6acb1e8d045a' },
	'element:orc-feature-2-1:description': { sheetId: 'heroes.ancestries.orc.trait.bloodfire-rush.effect', enHash: 'f7a9ad12ef6c00c036003c91b46b589f1f9d79a48da52fa4299842c1312a7d1c' },
	'element:orc-feature-2-2:name': { sheetId: 'heroes.ancestries.orc.trait.grounded.name', enHash: '5b6f73f04fe1a6af2dc43bebb45478862b0bd1fe079eed12f8bc2000a59bf68c' },
	'element:orc-feature-2-2:description': { sheetId: 'heroes.ancestries.orc.trait.grounded.effect', enHash: '12c6071e953d7bc6cf67a853f37d9df766be35d98d747ce6899cc6ddd7e3dcff' },
	'element:orc-feature-2-3:name': { sheetId: 'heroes.ancestries.orc.trait.passionate-artisan.name', enHash: '023f86b9cf2cc47877cccda913e268f82302a8572c48dabaff13b286364071e7' },
	'element:orc-feature-2-3:description': { sheetId: 'heroes.ancestries.orc.trait.passionate-artisan.effect', enHash: 'dbe1797815c9f9968a8b03591ef11cd4d3e2fca9c87589cc91145da010c0d341' },
	'element:orc-feature-2-4:name': { sheetId: 'heroes.ancestries.orc.trait.glowing-recovery.name', enHash: 'e864a869ccfdd42da84894a52e15919e3f609207aacfdf324481d0bc38e9b103' },
	'element:orc-feature-2-4:description': { sheetId: 'heroes.ancestries.orc.trait.glowing-recovery.effect', enHash: '299bc3fb96b9dc79c957b1f1509dde030b6dfc4ab3717447cf0d2be3670d9331' },
	'element:orc-feature-2-5:name': { sheetId: 'heroes.ancestries.orc.trait.nonstop.name', enHash: '17c66b5564881ca3dc8886b1f825e60cd0c62364c59bfc7a5c4c648d58f0d80f' },
	'element:orc-feature-2-5:description': { sheetId: 'heroes.ancestries.orc.trait.nonstop.effect', enHash: '92505db8b47a0a6ca869319442f39774d80feb53a4c36db9910ab2b4023a83f7' },
	'element:ancestry-dwarf:name': { sheetId: 'heroes.ancestries.dwarf.name', enHash: 'b528f9d1a283287ee3e1e93968211f7e59410dd7310bd08996bc77b19523441a' },
	'element:ancestry-dwarf:description': { sheetId: 'heroes.ancestries.dwarf.description.1', enHash: '5d63686ee1dfe4acf27425ca2a2132c1d3656ddd40b301f47ac9a15dcc4927e0' },
	'element:dwarf-feature-1:name': { sheetId: 'heroes.ancestries.dwarf.signature.runic-carving.name', enHash: '4b89d4015d8d743be31f421beea9ef1d3178340086f2dfa04e8bc11696bc876d' },
	'element:dwarf-feature-1a:name': { sheetId: 'heroes.ancestries.dwarf.signature.runic-carving.detection.name', enHash: 'e3818c7886164dae9924fa5fb18ad2433eebae0564363c66912e0cfb7e25973d' },
	'element:dwarf-feature-1a:description': { sheetId: 'heroes.ancestries.dwarf.signature.runic-carving.detection.effect', enHash: 'eb8c9c0643d9dd3ab6c9fc2f05c18061f83bca86a9ca9e044c215b4f68819a21' },
	'element:dwarf-feature-1b:name': { sheetId: 'heroes.ancestries.dwarf.signature.runic-carving.light.name', enHash: 'dbcd5e7bb7a0f538810de44c3efbd813037ee3fa358747bb71fa58e157af45f7' },
	'element:dwarf-feature-1b:description': { sheetId: 'heroes.ancestries.dwarf.signature.runic-carving.light.effect', enHash: '0fb646ad0d2239ef8a98bf87b2908a7d817bdd77f713c09864b6353954176025' },
	'element:dwarf-feature-1c:name': { sheetId: 'heroes.ancestries.dwarf.signature.runic-carving.voice.name', enHash: '87bf2bc08589f0bd4a078db145c34ad5e14b8fda53c3ae65b78601294913df95' },
	'element:dwarf-feature-1c:description': { sheetId: 'heroes.ancestries.dwarf.signature.runic-carving.voice.effect', enHash: '1c980531f22b11a5f3325e0de3976309de510db2a6c2af5aa86b52ad0273296f' },
	'element:dwarf-feature-2-1:name': { sheetId: 'heroes.ancestries.dwarf.trait.grounded.name', enHash: '5b6f73f04fe1a6af2dc43bebb45478862b0bd1fe079eed12f8bc2000a59bf68c' },
	'element:dwarf-feature-2-1:description': { sheetId: 'heroes.ancestries.dwarf.trait.grounded.effect', enHash: '2655b3c6f852cfe26f9b1c378d2f844c077da754f210d6c00fde1107ff1afa06' },
	'element:dwarf-feature-2-2:name': { sheetId: 'heroes.ancestries.dwarf.trait.stand-tough.name', enHash: 'e089a14049d1c8f354f27479191cb1079be6b85b5b1b918a9f2d48a34ee1bbf3' },
	'element:dwarf-feature-2-2:description': { sheetId: 'heroes.ancestries.dwarf.trait.stand-tough.effect', enHash: 'c811f734f89b91387f07ccd3a354c4bcd919a2278b3ef904d57b73d19e973482' },
	'element:dwarf-feature-2-2a:name': { sheetId: 'heroes.ancestries.dwarf.trait.stand-tough.name', enHash: 'e089a14049d1c8f354f27479191cb1079be6b85b5b1b918a9f2d48a34ee1bbf3' },
	'element:dwarf-feature-2-2b:name': { sheetId: 'heroes.ancestries.dwarf.trait.stand-tough.name', enHash: 'e089a14049d1c8f354f27479191cb1079be6b85b5b1b918a9f2d48a34ee1bbf3' },
	'element:dwarf-feature-2-3:name': { sheetId: 'heroes.ancestries.dwarf.trait.stone-singer.name', enHash: '46b31f569c51542b7576c995df287f9b703a2d8f86c4b753118b90180ca3a301' },
	'element:dwarf-feature-2-3:description': { sheetId: 'heroes.ancestries.dwarf.trait.stone-singer.effect', enHash: 'f7ebf12778874f869a2d17fe83467f3a4e2dff8e9d340a66ce66ac48fdd8f97d' },
	'element:dwarf-feature-2-4:name': { sheetId: 'heroes.ancestries.dwarf.trait.great-fortitude.name', enHash: '81a76e0de6a53b3a0a341df977357ec593f30bd9d0b701f2563b6d48016933e8' },
	'element:dwarf-feature-2-4:description': { sheetId: 'heroes.ancestries.dwarf.trait.great-fortitude.effect', enHash: '3496fc19b72729c94d6dd55f492069160c46f77ba5303fcd8842f0dbd65835a3' },
	'element:dwarf-feature-2-5:name': { sheetId: 'heroes.ancestries.dwarf.trait.spark-off-your-skin.name', enHash: 'ee141ba3af03d857f4e453dab70e357d5450d0d9fb9c29e05915eeb7e519e819' },
	'element:dwarf-feature-2-5:description': { sheetId: 'heroes.ancestries.dwarf.trait.spark-off-your-skin.effect', enHash: '9f5767ce5d2009bd205c5452b6c60fb3bac8cea7f9a0cc1246ed70fbde7628f9' },
	'element:ancestry-hakaan:name': { sheetId: 'heroes.ancestries.hakaan.name', enHash: 'acd87b2316c931b3acccf3a78b9c3f011ed99ad5f9fa17dabd4cc9533dfb3768' },
	'element:hakaan-feature-1:name': { sheetId: 'heroes.ancestries.hakaan.signature.big.name', enHash: 'fe8e3ab241624b11a3899907bd6fd668d66f4e1be3e237e8ee1ee7c36285d23e' },
	'element:hakaan-feature-2-1:name': { sheetId: 'heroes.ancestries.hakaan.trait.all-is-a-feather.name', enHash: '87a9876e3c5a943c38bb98dda8e3e98ac0b4fc11999ec7122d8de3840a094637' },
	'element:hakaan-feature-2-2:name': { sheetId: 'heroes.ancestries.hakaan.trait.forceful.name', enHash: 'd53e547c9e8e2d9bf49357d5612411b8376c9ff66822dcd7aff945ea3e1da863' },
	'element:hakaan-feature-2-2:description': { sheetId: 'heroes.ancestries.hakaan.trait.forceful.effect', enHash: '4e0f2d0eba42be99a81e37b7839db6944e5c553b245374a2aae31b9a06825aa7' },
	'element:hakaan-feature-2-3:name': { sheetId: 'heroes.ancestries.hakaan.trait.stand-tough.name', enHash: 'e089a14049d1c8f354f27479191cb1079be6b85b5b1b918a9f2d48a34ee1bbf3' },
	'element:hakaan-feature-2-3:description': { sheetId: 'heroes.ancestries.hakaan.trait.stand-tough.effect', enHash: 'c811f734f89b91387f07ccd3a354c4bcd919a2278b3ef904d57b73d19e973482' },
	'element:hakaan-feature-2-3a:name': { sheetId: 'heroes.ancestries.hakaan.trait.stand-tough.name', enHash: 'e089a14049d1c8f354f27479191cb1079be6b85b5b1b918a9f2d48a34ee1bbf3' },
	'element:hakaan-feature-2-3b:name': { sheetId: 'heroes.ancestries.hakaan.trait.stand-tough.name', enHash: 'e089a14049d1c8f354f27479191cb1079be6b85b5b1b918a9f2d48a34ee1bbf3' },
	'element:hakaan-feature-2-4:name': { sheetId: 'heroes.ancestries.hakaan.trait.great-fortitude.name', enHash: '81a76e0de6a53b3a0a341df977357ec593f30bd9d0b701f2563b6d48016933e8' },
	'element:hakaan-feature-2-4:description': { sheetId: 'heroes.ancestries.hakaan.trait.great-fortitude.effect', enHash: '3496fc19b72729c94d6dd55f492069160c46f77ba5303fcd8842f0dbd65835a3' },
	'element:hakaan-feature-2-5:name': { sheetId: 'heroes.ancestries.hakaan.trait.doomsight.name', enHash: '3013c07a6ad2da73bf0de0bb4b4315112307d58f54176f5720bc5a4e990c6205' },
	'element:ancestry-memonek:name': { sheetId: 'heroes.ancestries.memonek.name', enHash: '0e1fd6e2ceaf92a0e06bc2784094565f7198b7041e0ddddeffdf68501cdd7cac' },
	'element:ancestry-memonek:description': { sheetId: 'heroes.ancestries.memonek.description.1', enHash: '47252c37589b87fab415fb8508659fce493485741f3522ff9a2eda38e2a631a3' },
	'element:memonek-feature-1:name': { sheetId: 'heroes.ancestries.memonek.signature.fall-lightly.name', enHash: 'f448ccf39fa6bc41efb1d86af8fe881fb8b93dd704f7f3bc6691c699dec07c7a' },
	'element:memonek-feature-1:description': { sheetId: 'heroes.ancestries.memonek.signature.fall-lightly.effect', enHash: '9d24becc6d799a0b6e50e05db58f27a385cfb8e554784c9c1a774902e58a860f' },
	'element:memonek-feature-2:name': { sheetId: 'heroes.ancestries.memonek.signature.lightweight.name', enHash: 'f1c7459c3857aff2d07017d696063bad27a0f02b7f053e9a6424c9345a4c3ffd' },
	'element:memonek-feature-2:description': { sheetId: 'heroes.ancestries.memonek.signature.lightweight.effect', enHash: '9ea2582eda3cf14c115bd486b9e5dc69f26f381f09c76353efee0adb6a55e297' },
	'element:memonek-feature-3-1:name': { sheetId: 'heroes.ancestries.memonek.trait.i-am-law.name', enHash: '540f4824d9d7c5faf9e9f098db0e817e67b107822ba58bb57baaeb06d7a09615' },
	'element:memonek-feature-3-1:description': { sheetId: 'heroes.ancestries.memonek.trait.i-am-law.effect', enHash: 'e6ec46e70b28c31b51c265a29ebcdf465f3724c1124450d9c919baeef1fce8f9' },
	'element:memonek-feature-3-2:name': { sheetId: 'heroes.ancestries.memonek.trait.systematic-mind.name', enHash: '92a1457ffeadb05882f0eaf3388328f48f41f786d021929fa9d1e5ff0a871b8e' },
	'element:memonek-feature-3-2a:name': { sheetId: 'heroes.ancestries.memonek.trait.systematic-mind.name', enHash: '92a1457ffeadb05882f0eaf3388328f48f41f786d021929fa9d1e5ff0a871b8e' },
	'element:memonek-feature-3-2a:description': { sheetId: 'heroes.ancestries.memonek.trait.systematic-mind.effect', enHash: '555360416f9258aecb1a4d6938eb07fb888d4b6c2bd60d43e62cb72b08df9e6a' },
	'element:memonek-feature-3-2b:name': { sheetId: 'heroes.ancestries.memonek.trait.systematic-mind.name', enHash: '92a1457ffeadb05882f0eaf3388328f48f41f786d021929fa9d1e5ff0a871b8e' },
	'element:memonek-feature-3-3:name': { sheetId: 'heroes.ancestries.memonek.trait.unphased.name', enHash: '4c9bba30fb790a4d9a231a8c3de81d90415ed36dd65da939588481a7335eef04' },
	'element:memonek-feature-3-3:description': { sheetId: 'heroes.ancestries.memonek.trait.unphased.effect', enHash: 'cc91fea2356c58650f30b06500ac73a9d6b70c17c6fd6b7ef1531f18c4cf9211' },
	'element:memonek-feature-3-4:name': { sheetId: 'heroes.ancestries.memonek.trait.useful-emotion.name', enHash: '10ff4a44d6c002fc5889326545a641381646d0307c3903e71b10eb47f1c49fa7' },
	'element:memonek-feature-3-4:description': { sheetId: 'heroes.ancestries.memonek.trait.useful-emotion.effect', enHash: '9067c01c9dbf57beb0fcf5e3cccea43102ce05f2e8141456eccd55067b485138' },
	'element:memonek-feature-3-6:name': { sheetId: 'heroes.ancestries.memonek.trait.lightning-nimbleness.name', enHash: '55ac4fd4cee4ca79cb2ec87cc81f583879bd43854c42c6cabb26b1927f0fc7f0' },
	'element:memonek-feature-3-6:description': { sheetId: 'heroes.ancestries.memonek.trait.lightning-nimbleness.effect', enHash: 'df420ca67f7f86cba5d6edd83e84b8b54f5bcb50103cc7f566210145b4d030d5' },
	'element:memonek-feature-3-7:name': { sheetId: 'heroes.ancestries.memonek.trait.nonstop.name', enHash: '17c66b5564881ca3dc8886b1f825e60cd0c62364c59bfc7a5c4c648d58f0d80f' },
	'element:memonek-feature-3-7:description': { sheetId: 'heroes.ancestries.memonek.trait.nonstop.effect', enHash: 'e921985d28944bde19d2ad20389b8e8e8c82cd084edaf528319033735eb46a43' }
};
