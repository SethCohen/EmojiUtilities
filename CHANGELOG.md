# Changelog
## [1.22.8](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.7...v1.22.8) (2022-12-04)


### Bug Fixes

* **botinfo:** fixed total emoji value. ([453d105](https://github.com/SethCohen/EmojiUtilities/commit/453d1051ec1d890d31316a865070e75611e6601c))
* fixed `countmessages`, `countreacts`, `countselfreacts` server flags not working. ([28562c0](https://github.com/SethCohen/EmojiUtilities/commit/28562c016a82c22af64cdfeb27a6e03211f2de00))
* **leaderboard:** fixed leaderboard not showing any information ([60c5378](https://github.com/SethCohen/EmojiUtilities/commit/60c53782ed320cc562e0b3fa8cecaa5e0fbac27c))
* **random|search:** fixed `includensfw` server setting flag not working ([0ec8df9](https://github.com/SethCohen/EmojiUtilities/commit/0ec8df9829a91e65b0aea4fa93cdf0e4a6b22caa))
* **search|random|packsearch:** fixed commands crashing bot ([8e87f65](https://github.com/SethCohen/EmojiUtilities/commit/8e87f65872c0dc1c37377ef7b9415d1b059aca6a))


### Miscellaneous

* updated dependencies ([d4a5241](https://github.com/SethCohen/EmojiUtilities/commit/d4a52415474caa3798b317202d6c0cca564559df))
* updated start server script ([29b6ebb](https://github.com/SethCohen/EmojiUtilities/commit/29b6ebba0b221bb7ca4c6837194ec3db56b0f3dc))
* updated to ES6 ([de05120](https://github.com/SethCohen/EmojiUtilities/commit/de0512071ebb53bc7057455f7f60a768d7dde67a))

## [1.22.7](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.6...v1.22.7) (2022-10-13)


### Miscellaneous

* updated README.md ([44b9eab](https://github.com/SethCohen/EmojiUtilities/commit/44b9eabab6f4e9a25e0c6c3ec6e952611c904acd))

## [1.22.6](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.5...v1.22.6) (2022-10-13)


### Bug Fixes

* **dancify:** added catch for `text` input max length. ([e5f3275](https://github.com/SethCohen/EmojiUtilities/commit/e5f32751085da0fddcbfd5f6019a1814a2f4420e))
* **emojisteal:** added catch for invalid `name` input. ([8e42572](https://github.com/SethCohen/EmojiUtilities/commit/8e4257233550e11b92a4284dc603b96491c43ce3))
* **stickerfy|stickersteal:** added catch for max number of stickers reached (60) ([251abe6](https://github.com/SethCohen/EmojiUtilities/commit/251abe6950adacb5ecfdab7dc2962e74c176d342))
* **stickerfy:** added catch for invalid `name` input. ([fa271b1](https://github.com/SethCohen/EmojiUtilities/commit/fa271b1a91b9e87dfcb77e29d62bab3c7c3f3888))
* **stickerfy:** fixed error on unknown interaction ([cc62b24](https://github.com/SethCohen/EmojiUtilities/commit/cc62b2431f20a72ce7f387b80ed5470f77615210))
* **stickersteal:** fixed error on unknown interaction ([f11e2dc](https://github.com/SethCohen/EmojiUtilities/commit/f11e2dc5e5575ed134fea2d098c585d6ba9ccf9b))

## [1.22.5](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.4...v1.22.5) (2022-09-05)


### Bug Fixes

* **dbModel:** fixed issue of no guild db being created if discord api is down ([1278ec2](https://github.com/SethCohen/EmojiUtilities/commit/1278ec21f2573958a15748795db7407611ed090e))
* **stickersteal:** fixed issue on invalid `messageId` ([1e15f77](https://github.com/SethCohen/EmojiUtilities/commit/1e15f77ef90d425a9da3d948d8b9e6600a53a799))
* **stickersteal:** fixed issue on maximum number of stickers reached (30) ([8a6976b](https://github.com/SethCohen/EmojiUtilities/commit/8a6976bbe25f314fd8406cac4710c6c0fa4bf392))

## [1.22.4](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.3...v1.22.4) (2022-08-31)


### Bug Fixes

* **emojisteal:** fixed error on no emoji found/invalid value in `emoji` input. ([d67972b](https://github.com/SethCohen/EmojiUtilities/commit/d67972bd6df54d836d4c840215b3cd7be285f1b5))
* **guildCreate:** added error catching for future proofing. ([9460972](https://github.com/SethCohen/EmojiUtilities/commit/9460972c0b77088b35fe64f5757f79dd33369e46))
* **uploademoji:** fixed error of uploaded animated emojis not being animated. ([0a81e09](https://github.com/SethCohen/EmojiUtilities/commit/0a81e09397046efdd4b058e05a5f789d217afd4d))
* **uploademoji:** fixed error on invalid value in `name` ([babd066](https://github.com/SethCohen/EmojiUtilities/commit/babd066555ac10c46057367ebe58f1c6ed847c37))

## [1.22.3](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.2...v1.22.3) (2022-08-28)


### Bug Fixes

* **emojisteal:** added error catch fix on max numbers of emojis reached (250) ([89acbc5](https://github.com/SethCohen/EmojiUtilities/commit/89acbc5f326b61dc4c826e9592ed90cead45b6d2))
* **stickerfy:** fixed stickerfying gifs and animated png uploads not being animated on sticker uploading ([41aeaa5](https://github.com/SethCohen/EmojiUtilities/commit/41aeaa53f325b2b6c594977c4a8e90602b0f95e2))

## [1.22.2](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.1...v1.22.2) (2022-08-27)


### Bug Fixes

* **dbModel:** fixed error on trying to create an already existing database ([4f63358](https://github.com/SethCohen/EmojiUtilities/commit/4f633583c58867b69af580c99c15e09f908dd2e0))
* **stickersteal:** added another error catch for invalid `messageid` ([1b35300](https://github.com/SethCohen/EmojiUtilities/commit/1b35300e971d047fc4b5594ffb55718ddf6fce47))


### Code Refactoring

* **commands:** future proofing for possible errors. ([1c4daf3](https://github.com/SethCohen/EmojiUtilities/commit/1c4daf358dd7503a4a13fb8d46c50b0eb500258d))

## [1.22.1](https://github.com/SethCohen/EmojiUtilities/compare/v1.22.0...v1.22.1) (2022-08-27)


### Bug Fixes

* **guildCreate:** fixed error bot crashing on joining guild ([7d2e59e](https://github.com/SethCohen/EmojiUtilities/commit/7d2e59e3b8aefcd7e2ff50c9f032138e04daa962))

## [1.22.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.21.1...v1.22.0) (2022-08-27)


### Features

* **backupemojis:** added compression level to archiver ([418cfe0](https://github.com/SethCohen/EmojiUtilities/commit/418cfe08dec1044f7157a0dbe19c822547295067))
* **index:** added privileged intent for emoji message reading functionality ([7cf0bc3](https://github.com/SethCohen/EmojiUtilities/commit/7cf0bc33b8f2985e1a33d0e2bcd1d29e1f384106))
* **packsearch:** added page looping ([05e7d9c](https://github.com/SethCohen/EmojiUtilities/commit/05e7d9cb7ff7095a3ad092963dcebe70b6f79c2b))


### Bug Fixes

* added error catch on if Discord API is down ([a9a28ef](https://github.com/SethCohen/EmojiUtilities/commit/a9a28ef87e8e9aebd4714ede3c0af344117a1e69))
* **guildCreate:** fixed channel type check due to deprecation ([bac3bf3](https://github.com/SethCohen/EmojiUtilities/commit/bac3bf387fb9ddea830ccf897b6fe6eac9c828fc))
* **lockemoji:** fixed error on command being double deferred. ([4af67f7](https://github.com/SethCohen/EmojiUtilities/commit/4af67f723469217df2fa54661c18f599c81b25cb))
* **lockemoji:** fixed error on invalid emoji in command input ([6b708ff](https://github.com/SethCohen/EmojiUtilities/commit/6b708ff5e8c81266ccb863ef430ec6b000c76eba))
* **resetdb:** fixed error on command being double deferred. ([be9702a](https://github.com/SethCohen/EmojiUtilities/commit/be9702a212964d84bd32fda9215527a2b8de972e))
* **stickerfy:** added error catch on max numbers of stickers reached (15) ([9ca06c2](https://github.com/SethCohen/EmojiUtilities/commit/9ca06c2cb3b388c5fe48ddee87b54fc7c48232f4))
* **stickerfy:** added temp error catch "fix" for broken apng support ([bff02c6](https://github.com/SethCohen/EmojiUtilities/commit/bff02c6f24b805654a40b84ea846de6154594da7))
* **stickersteal:** added error catches on invalid `messageId` and no sticker found in message ([2f0356d](https://github.com/SethCohen/EmojiUtilities/commit/2f0356dab70bcbf3801075fb780f3f4837ae163b))


### Documentation

* **dbmodel:** Refactored JSDocs ([27febb7](https://github.com/SethCohen/EmojiUtilities/commit/27febb72482f2f0fc89f949dbdc431019ccd4f2a))


### Miscellaneous

* replaced `standard-version` with `release-please` and `github-releases-to-discord` ([d3d6108](https://github.com/SethCohen/EmojiUtilities/commit/d3d6108ba7cfae0e59e025fb85a8530f854259fd))
* updated project to discord.js v14 ([72cc35d](https://github.com/SethCohen/EmojiUtilities/commit/72cc35db04e9cfbb573316cdce13f11b2271a9d5))
* updated REST version from v9 to v10 ([1d15618](https://github.com/SethCohen/EmojiUtilities/commit/1d156185af07f136ae79c69f9dadc09872170335))


### Code Refactoring

* **listemojis:** renamed variable ([bfb5979](https://github.com/SethCohen/EmojiUtilities/commit/bfb5979baf3a28d98dd3b77d879583eff20b1b15))


### Styles

* closing bracket style changes and reduced whitespace ([7efecb9](https://github.com/SethCohen/EmojiUtilities/commit/7efecb9e7cd4b91a03f8d149349ab953b8b527ef))
* restyled closing brackets in several events ([83e4293](https://github.com/SethCohen/EmojiUtilities/commit/83e42931b621221f021f45e6da71cf9234ac1186))

## [1.21.1](https://github.com/SethCohen/EmojiUtilities/compare/v1.21.0...v1.21.1) (2022-08-14)


### Bug Fixes

* `/config` fixed command failure error due to double deferral and fully deprecated `/config togglecommand` due to discord api changes ([1eed9cb](https://github.com/SethCohen/EmojiUtilities/commit/1eed9cb6201a04c9e72d87322a1ff987a1bf83fd))
* `/emojisteal` Fixed error on invalid `name` using special characters or original emoji string. ([ffd8d59](https://github.com/SethCohen/EmojiUtilities/commit/ffd8d59860e2d3bded56efde76b61b692de68cb8))
* `/stickersteal` fixed error on unknown default emoji in `tag` field ([68127b1](https://github.com/SethCohen/EmojiUtilities/commit/68127b1cd8601cb2a7c3a72a1531ccf663e005a0))
* `/stickersteal` fixed error on unknown message ([f97ccc1](https://github.com/SethCohen/EmojiUtilities/commit/f97ccc17fcf4ecbfae115c024c92f0824db41e2c))

## [1.21.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.20.0...v1.21.0) (2022-08-10)


### Features

* deferred all commands to prevent command timeouts ([84d6ca9](https://github.com/SethCohen/EmojiUtilities/commit/84d6ca9465da5ac43ac2cd07936f879199a1b306))


### Bug Fixes

* `/emojisteal` fixed error on attempting to upload emoji over max filesize limit ([b5ada00](https://github.com/SethCohen/EmojiUtilities/commit/b5ada0017dc6acc00399c0c8d6fcf6896e516046))
* `/removeunused` added error catch on unknown emoji deletion attempt ([f397bbb](https://github.com/SethCohen/EmojiUtilities/commit/f397bbb6e03b01614acd648fc8d6b36fbb9a5d65))
* `/stickerfy` fixed error on invalid url ([591c808](https://github.com/SethCohen/EmojiUtilities/commit/591c80864e7879fe70a8421e53be7e58ed9d4472))
* `/stickersteal` fixed error on attempting to upload a sticker after max sticker slots reached ([c9759c7](https://github.com/SethCohen/EmojiUtilities/commit/c9759c79e1ea99e8698b7ca42aa5b58aa1ac5c0f))
* `/uploademoji` fixed error on over max filesize ([465d600](https://github.com/SethCohen/EmojiUtilities/commit/465d600ccd622fda20e3282c48292a4e8f48e5f3))

## [1.20.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.19.0...v1.20.0) (2022-07-01)


### Features

* `/stickerfy` added webp support and removed black background padding from resized pngs ([547be07](https://github.com/SethCohen/EmojiUtilities/commit/547be07a819481ac2972459a41231951e1384ea6))
* added `/stickersteal` ([0383755](https://github.com/SethCohen/EmojiUtilities/commit/03837558c4cf1e37cdcb8fbcec5e238b79a26013))
* renamed `/copysteal` into `/emojisteal` ([49a9391](https://github.com/SethCohen/EmojiUtilities/commit/49a93912ed20e289ce9c41622092489745ea66c9))


### Bug Fixes

* `/displaystats` Fixed uncaught Unknown Message error on deleted interaction. ([b1538fc](https://github.com/SethCohen/EmojiUtilities/commit/b1538fca1ed96e5b0b07903fac05d2f9f13b36c3))
* `/listemojis` Fixed uncaught Unknown Message error on deleted interaction. ([5606081](https://github.com/SethCohen/EmojiUtilities/commit/5606081be1c40e8948c60fd76ef2c3a5941f9d35))
* Fixed uncaught Unknown Message errors on collected deleted interactions. ([00e9413](https://github.com/SethCohen/EmojiUtilities/commit/00e9413d6c6d59afc511c8380c05070ce62b0a4f))


### Styles

* `/stickerfy` Changed descriptions ([91c9b42](https://github.com/SethCohen/EmojiUtilities/commit/91c9b42a2010932dacf3364eb8bed1bbeab92bbd))


### Code Refactoring

* `/displaystats` `/utilities` Moved pagination buttons to reusable function in `utilities.js` ([894718e](https://github.com/SethCohen/EmojiUtilities/commit/894718ee7c05dbcf5f40ba71e20e819afb78fb34))
* `/displaystats` Refactored variable names for better readability. ([99f68e3](https://github.com/SethCohen/EmojiUtilities/commit/99f68e3dce02d783b9636f5b2c4d826ba6610208))
* `/optself` `utilities.js` Moved confirmation buttons to utilities.js and refactored collectors. ([7ff32ac](https://github.com/SethCohen/EmojiUtilities/commit/7ff32ac2e56f1d771001157d3228e1f271d442ee))
* `/packsearch` Refactored for readability ([c4479d4](https://github.com/SethCohen/EmojiUtilities/commit/c4479d4b6ca07fe8455ceee12980846ababc6811))
* `/random` `/optself` /resetdb` `/search` Readability refactor. ([5ebe6cf](https://github.com/SethCohen/EmojiUtilities/commit/5ebe6cfc3500fa3fb39a825475d4af2c92e46577))

## [1.19.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.18.0...v1.19.0) (2022-06-18)


### Features

* `/displaystats` added page looping ([50b7ba4](https://github.com/SethCohen/EmojiUtilities/commit/50b7ba442a8557c9a9628f7ac7b6454b0510f557))
* `/listemojis` added page looping. ([395fe98](https://github.com/SethCohen/EmojiUtilities/commit/395fe980d0da77791f1b925caaa85510a0c4430c))
* added top.gg support ([9e71b0d](https://github.com/SethCohen/EmojiUtilities/commit/9e71b0d6690e9e5d9b41fece796307d94474eb20))


### Bug Fixes

* `/stickerfy` added error catch for invalid `name` length. ([4aa327e](https://github.com/SethCohen/EmojiUtilities/commit/4aa327ebc84103b5f5c90c457295c4dbc58819ad))
* `/stickerfy` added error catch for invalid image urls ([e638e84](https://github.com/SethCohen/EmojiUtilities/commit/e638e847e6fa79bff16ef734ddad60ef06853f6f))
* `/stickerfy` added error catch for maximum duration exceed. ([3c6a803](https://github.com/SethCohen/EmojiUtilities/commit/3c6a803d84a6815a222f3213c9c6e7c31f88b2e2))


### Styles

* '/config togglecommand' changed error message styling ([dabdd6b](https://github.com/SethCohen/EmojiUtilities/commit/dabdd6bd0fa7036b780fefbd92e7fa1d24f06c4c))
* added more descriptive error logging. ([74c6833](https://github.com/SethCohen/EmojiUtilities/commit/74c6833f32208489524fc0b4d86d540c174e01d5))

## [1.18.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.17.5...v1.18.0) (2022-05-27)


### Features

* added database encryption ([fc79df5](https://github.com/SethCohen/EmojiUtilities/commit/fc79df5703f09b3bedd4daeebd09c7ccd6fe8165))
* updated dependencies ([51ea26a](https://github.com/SethCohen/EmojiUtilities/commit/51ea26ac37a98dfa3ac726e2c4aa10e29cb7eb9d))


### Removed

* removed `/config togglecommand` due to discord api removing ability for bots to set slash command permissions. ([391ee92](https://github.com/SethCohen/EmojiUtilities/commit/391ee9225bd7d1aef98f0c3d271de2db67ff4e22))


### Code Refactoring

* `/displaystats` `/leaderboard` `/optself` `/search` fixed choices to new structure ([ac9c6bb](https://github.com/SethCohen/EmojiUtilities/commit/ac9c6bb975791929650c19285dfce2963f5e9b31))

## [1.17.5](https://github.com/SethCohen/EmojiUtilities/compare/v1.17.4...v1.17.5) (2022-05-04)


### Styles

* fixed `/config` subcommand mixed-up descriptions and changed `/config togglecommand` error response. ([02b9064](https://github.com/SethCohen/EmojiUtilities/commit/02b9064b5d43ef0a9d1f6f519a18f0910b54a988))

## [1.17.4](https://github.com/SethCohen/EmojiUtilities/compare/v1.17.3...v1.17.4) (2022-05-04)


### Bug Fixes

* temp error catch fix on `/config togglecommand` not working. ([f9f4122](https://github.com/SethCohen/EmojiUtilities/commit/f9f4122337c5f18ff823fdc7f28e94c4355ad2d6))

## [1.17.3](https://github.com/SethCohen/EmojiUtilities/compare/v1.17.2...v1.17.3) (2022-05-03)


### Bug Fixes

* fixed `/aboutemoji` error on invalid input in `emoji` field. ([2406b7a](https://github.com/SethCohen/EmojiUtilities/commit/2406b7ae7deab64a3e2fdb7f58d962c8a276a21e))

## [1.17.2](https://github.com/SethCohen/EmojiUtilities/compare/v1.17.1...v1.17.2) (2022-04-23)


### Bug Fixes

* fixed `/stickerfy` and `/uploademoji` error on user not having the right permissions. ([52441c0](https://github.com/SethCohen/EmojiUtilities/commit/52441c0cd5fe5014b4351b785bc390c8c378fd30))
* fixed `temps` filepath ([f0dd266](https://github.com/SethCohen/EmojiUtilities/commit/f0dd2664ff7b2e7e8b5ffa73016a6e12844ca4be))

## [1.17.1](https://github.com/SethCohen/EmojiUtilities/compare/v1.17.0...v1.17.1) (2022-04-23)


### Code Refactoring

* `/aboutemoji` changed Manage Emojis error catch to still allow command output. ([e9bff10](https://github.com/SethCohen/EmojiUtilities/commit/e9bff105891d1819c5a7140ab2114ac7cc43758d))
* moved `temps` folder outside of `src` folder and added check for if dir exists. ([f84ce50](https://github.com/SethCohen/EmojiUtilities/commit/f84ce50cc24a6dea4ad6a7219f1d795ab979e586))

## [1.17.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.16.0...v1.17.0) (2022-04-23)


### Features

* added NSFW-channel restriction to NSFW commands. ([e9cb882](https://github.com/SethCohen/EmojiUtilities/commit/e9cb8822f4246167b00a3cc3627f383397e64d01))


### Bug Fixes

* `/aboutemoji` fixed uncaught missing perms error ([a69a17b](https://github.com/SethCohen/EmojiUtilities/commit/a69a17bbda82ebb1f84cc4661cfc2304d23139e8))


### Styles

* updated README.md ([eede4fd](https://github.com/SethCohen/EmojiUtilities/commit/eede4fd88b9de77b6f4c970654eacbbf22ce8317))

## [1.16.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.15.0...v1.16.0) (2022-04-21)


### Features

* added `/optself` so user can now opt in/out of emoji usage logging. ([517c30d](https://github.com/SethCohen/EmojiUtilities/commit/517c30dc835801e8fdf114da2c75890c91bcf6a3))

## [1.15.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.14.1...v1.15.0) (2022-04-19)


### Features

* added emoji id and emoji name support to `/unlockemoji` ([859871a](https://github.com/SethCohen/EmojiUtilities/commit/859871ae96f8664be0b8388a243be946f88a294c))
* added pm2 config ([b76b3a5](https://github.com/SethCohen/EmojiUtilities/commit/b76b3a5c3d243268b0da90eff6b9589be18cbf00))


### Bug Fixes

* fixed `unlockemoji` error on invalid emoji input with non-server emoji. ([877eb1e](https://github.com/SethCohen/EmojiUtilities/commit/877eb1ea6ccba05d7b17049c245d9dbd8db3d77c))


### Code Refactoring

* moved databases location ([dc685fa](https://github.com/SethCohen/EmojiUtilities/commit/dc685fabcfd5329d431436d25872c15a173f0c0e))

## [1.14.1](https://github.com/SethCohen/EmojiUtilities/compare/v1.14.0...v1.14.1) (2022-04-12)


### Bug Fixes

* fixed `/config togglecommand` not properly toggling commands. ([d7d4d12](https://github.com/SethCohen/EmojiUtilities/commit/d7d4d1236142ebb028e96fad24d5ab119d5e1e93))

## [1.14.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.13.2...v1.14.0) (2022-04-12)


### Features

* added `.png` and `.jpeg` support to `/stickerfy` ([651c39c](https://github.com/SethCohen/EmojiUtilities/commit/651c39c4995a54cbb69d6deb6cbc165952f4401d))


### Bug Fixes

* fixed welcome message throwing error on no public updates channel found. ([4e3017c](https://github.com/SethCohen/EmojiUtilities/commit/4e3017c20aceef8a82f9cd2bdc5042df99550385))


### Code Refactoring

* added check for too many roles perm set ([e1cf958](https://github.com/SethCohen/EmojiUtilities/commit/e1cf958b095dac1760ca7265257231ef0b5dfea8))
* refactored stickerfy efficacy ([54785b9](https://github.com/SethCohen/EmojiUtilities/commit/54785b90e8f4774850a6b10e4cce6e038b8aa0a9))


### Removed

* removed default slash command permissions ([2f17ef7](https://github.com/SethCohen/EmojiUtilities/commit/2f17ef7ba03b3a45453fdd99bd07db25b7c5db4f))
* tinify api ([1b5a5c7](https://github.com/SethCohen/EmojiUtilities/commit/1b5a5c711dfc3460f0457be288f8111539781b39))


### Styles

* changed bot status message ([fe06ce0](https://github.com/SethCohen/EmojiUtilities/commit/fe06ce0db8d8ecde7962ab927ae2ca695a6995a2))
* removed top.gg link from bot media links. ([dd7ea7b](https://github.com/SethCohen/EmojiUtilities/commit/dd7ea7b64944d643709b0477dac7b4aa0501bbc3))

## [1.13.2](https://github.com/SethCohen/EmojiUtilities/compare/v1.13.1...v1.13.2) (2022-04-05)


### Bug Fixes

* fixed admin commands not being properly set. ([2b51ee2](https://github.com/SethCohen/EmojiUtilities/commit/2b51ee27c75461e86e59d3f8c794e5b840d8d83d))

## [1.13.1](https://github.com/SethCohen/EmojiUtilities/compare/v1.13.0...v1.13.1) (2022-04-04)


### Styles

* added additional line to welcome message. ([b0f8bed](https://github.com/SethCohen/EmojiUtilities/commit/b0f8bed05c776337894864a50caf5264c80378f5))

## [1.13.0](https://github.com/SethCohen/EmojiUtilities/compare/v1.12.1...v1.13.0) (2022-04-03)


### Features

* added /unlockemoji command ([7967857](https://github.com/SethCohen/EmojiUtilities/commit/7967857aff1ee06416a978fe961cc8f09dcb3a66))


### Bug Fixes

* fixed `/config togglecommand` missing commands ([2f3e158](https://github.com/SethCohen/EmojiUtilities/commit/2f3e158326cfe83cf323f8cf7e16bcd2714c2c4d))

## [1.12.1](https://github.com/SethCohen/EmojiUtilities/compare/v1.12.0...v1.12.1) (2022-04-03)


### Styles

* restyled changelog.md ([d33d9b9](https://github.com/SethCohen/EmojiUtilities/commit/d33d9b999dc341ca0130ea6a97648c80ecc07adc))


### Removed

* deprecated prefix ES command usage warning ([65c001c](https://github.com/SethCohen/EmojiUtilities/commit/65c001cde504358957fae1e4a4b5cab2b7cb6984))

## 1.12.0 (2022-04-03)

### Features

* added automated
  changelogging ([dba606c](https://github.com/SethCohen/EmojiStatistics/commit/dba606c52f5ac9400e1323e4dc1d5ffab77a3731))

## v1.11.0 - 2022-03-26

### Added

- `/lockemoji` Admin-only command. Restricts a specified emoji so only the specified role can use
  it. [[6a9e92a]](https://github.com/SethCohen/EmojiUtilities/commit/6a9e92a32860c50c6c719ee1cf57e46ddc3974d3)
- `/help` Prints a list of useful resources to chat, e.g. supported
  commands. [[b2c6f98]](https://github.com/SethCohen/EmojiUtilities/commit/b2c6f98fb2bef738d1c6a9dd5bf872d06812847d)

### Fixed

- `/config togglecommand` Fixed error where all perm-specific slash commands got disabled instead of just the one chosen
  command. e.g. if disabling `renameemoji`, all other Manage Emoji commands got disabled. This has been
  fixed. [[a039166]](https://github.com/SethCohen/EmojiUtilities/commit/a0391666fe268fe0cfae16968c64e57ad78be6a0)
- `guildCreate` `ready` `roleUpdate` Fixed error where slash commands perms were not properly being set to
  role. [[a039166]](https://github.com/SethCohen/EmojiUtilities/commit/a0391666fe268fe0cfae16968c64e57ad78be6a0)
- `/stickerfy` Fixed uncaught upload error max filesize exceeded error. Now throws a proper warning to user if output
  sticker apng is too large to upload to
  server. [[98cc98a]](https://github.com/SethCohen/EmojiUtilities/commit/98cc98a55d5fdb5a27622ac3d6d14c68732dd181)

## v1.10.5 - 2022-03-20

### Fixed

- `/random` Fixed uncaught Missing Permissions error if bot does not have permissions to Manage/Upload emojis to a
  server. Now properly tells user the bot is missing permission to upload
  emoji. [[050101e]](https://github.com/SethCohen/EmojiUtilities/commit/050101edd1db167a756e59a1cffd03b2042d874a)

## v1.10.4 - 2022-03-11

## Added

- `leaderboard` Added error catch for external
  emojis. [[c3a5db7]](https://github.com/SethCohen/EmojiUtilities/commit/c3a5db708e9c09b47f3ebcd44154c2e8ce6c2f5a)
- `uploademoji` Added error catch for unsupported image
  types. [[81aec8c]](https://github.com/SethCohen/EmojiUtilities/commit/81aec8ca022fd751790ca66aa504831aa71c78f6)

## Changed

- `dancify` Maximum characters in error feedback was wrong. Dancify only supports ~80 characters. Changed error feedback
  accordingly. [[099d0f0]](https://github.com/SethCohen/EmojiUtilities/commit/099d0f08604fdd30a1268cb3c81ef774461f7f38)
- Changed error logging to be more descriptive for
  debugging. [[a1ce981]](https://github.com/SethCohen/EmojiUtilities/tree/81aec8ca022fd751790ca66aa504831aa71c78f6)

## v1.10.3 - 2022-02-01

### Fixed

- `/aboutemoji` Fixed unknown error being thrown when user tries to get info about an external emoji from another
  server. [[112e2b3]](https://github.com/SethCohen/EmojiUtilities/commit/112e2b3e7da9766e032d67f88c37b80706f23f69)

## v1.10.2 - 2022-01-31

### Removed

- `guildCreate.js` Removed references to deprecated /help command in bot
  greeting [[a3a7a27]](https://github.com/SethCohen/EmojiUtilities/commit/a3a7a27a1ea2abf9ac0ade98c928fc102ed94acb)

## v1.10.1 - 2022-01-31

### Fixed

- `/stickerfy` Fixed gifsicle failing for some
  gifs [[d33afb7]](https://github.com/SethCohen/EmojiUtilities/commit/d33afb782f748c0cb432f1ab2ead945aaff30444)

## v1.10.0 - 2022-01-30

### Fixed

- `/random` `/search` Fixed error not being caught for images greater than 256kb trying to be added to a
  server. [[9d75d1c]](https://github.com/SethCohen/EmojiUtilities/commit/9d75d1ca1f863ca8b880f4f7160ca638ca7e7a81)

### Changed

- Changed `/emoji` to `/aboutemoji` to be more descriptive of what the command
  does. [[1c5516c]](https://github.com/SethCohen/EmojiUtilities/commit/1c5516c56d80447047ed9e084f80573def57a3a2)

## v1.9.5 - 2022-01-30

### Removed

- Removed managed role checks for setting command perms on admin and manage emoji
  commands. [[8e2a0db]](https://github.com/SethCohen/EmojiUtilities/commit/8e2a0dbc2654028ac789e12a09bdf92142b38180)

## v1.9.4 - 2022-01-29

### Changed

- Changed all error handling messages to be more descriptive to the
  user. [[99829da]](https://github.com/SethCohen/EmojiUtilities/commit/99829dad64e866ab953d2e086bb476d095826214)

## v1.9.3 - 2022-01-29

### Fixed

- All commands that require Manage Emojis & Stickers perms have been fixed for servers that use the booster role for
  managing
  emojis. [[6003dd9]](https://github.com/SethCohen/EmojiUtilities/commit/6003dd9a45ec21cb8397b4cbdf2ac54076959f20)

## v1.9.2 - 2022-01-18

### Changed

- `/uploadEmoji` Changed image support to support any and all image types (e.g.
  webp) [[b3557cf]](https://github.com/SethCohen/EmojiUtilities/commit/b3557cf6506bbf7f2163f692e4125cac80e89f8b)

## v1.9.1 - 2021-12-03

### Changed

- `/enlargeemoji` Allow external emojis to be enlarged.

### Fixed

- `/stickerfy` Fixed bug not uploading with a proper unicode emoji representation.

## v1.9.0 - 2021-11-29

### Added

- `/backupemojis` Sends a compressed file of all emojis in a guild.
- `/config allownsfw` Allows to search for NSFW emotes from emoji.gg.
- `/config togglecommand` Disable/Enables a specified command.

### Changed

- `/copysteal`, `/removeunused`, `/renameemoji`, `/stickerfy`, `/uploademoji` Now disabled for users without Manage
  Emoji perms.
- Changed command output responses and added media links to most commands.

### Fixed

- Fix permission checks on `/search`, `/random`, `/packsearch`, and `/removeunused`
- Fixed bug with guild databases initializing multiple identical rows in configs table. config db now set to unique
  rows.

## v1.8.1 - 2021-11-27

### Changed

- Changed `/displaystats`, `/listemojis`, `/packsearch`, `/random`, `/removeunused`, `/search` buttons to only work with
  command author.

### Fixed

- Fixed `/clapify` error on input being higher than discord character limit.
- Fixed `/dancify` bug of ignoring capitalized characters.

### Removed

- `/help`

## v1.8.0 - 2021-11-25

### Added

- `/packsearch` Searches emoji.gg for packs.

## v1.7.2 - 2021-11-24

### Changed

- `/displaystats` Now includes zero-count-used emojis.
- `/search` `/random` Added NSFW filters.
- `/removeunused` Now checks for zero-count-used emojis.

### Fixed

- `/removeunused` Fixed bug where bot would ask to remove non-least-used emojis due to sorting most-to-least-used being
  broken.

## v1.7.1 - 2021-11-24

### Fixed

- Fixed `/stickerfy` bug where gifs less than <500kb would not get converted to apngs and crash the bot.

## v1.7.0 - 2021-11-24

### Added

- `/stickerfy` Converts a gif url to an apng and uploads it to the server as a sticker.
- `/dancify` Converts your message into dancing letters.
- `/random` Gets a random emoji from emoji.gg and prompts the user if they wish to add it to their server.
- `/search` Gets an emoji from emoji.gg based on user's search parameters.
- `/removeunused` Removes the n least-used emojis in a server as specified by user.

### Changed

- Refactored `uploademoji.js`; changed compression tool to use imagemagick command line tool instead of tinify.

## v1.6.2 - 2021-10-30

### Added

- `setCommandPerm.js` Added helper function to set command perms.

### Changed

- Project structure.

### Fixed

- Fixed pathing "unknown file/directory" for new project structure.
- Fixed error handling on null message to ignore null messages.

## v1.6.1 - 2021-10-26

### Added

- `botinfo.js` Added Bot Created Date field
- `botinfo.js` Added total emoji count usage
- `guildCreate.js`, `ready.js`, `roleUpdate.js` Added command perm handlers for Manage Emoji related commands

### Changed

- `guildCreate.js`, `ready.js`, `roleUpdate.js` Refactored command perm handlers

### Fixed

- `messageDelete.js` Added check on reactions for if reaction is a guild emoji reaction.
- `uploademoji.js` Added try catch around url request

## v1.6.0 - 2021-10-24

### Added

- `/botinfo` which displays basic bot-related info such as how many servers the bots in.
- `/copysteal` which copies a given nitro emote from another server into your server.
- `/uploademoji` which uploads a given url to a server.
- `/renameemoji` which renames a given emoji to a given new name.
- `/enlargeemoji` which pastes an emoji url to chat.
- `/clapify` which puts 👏 between every word.
- `index.js` Added channel partial.

### Changed

- Removed `utilities.js` and replaced `implies` function with material implication.

## v1.5.1 - 2021-10-16

### Fixed

- `messageReactionAdd.js` `messageReactionRemove.js` `messageReactionRemoveAll.js` Fixed error catch on unicode reaction
  use.
- Fixed admin command role perms to get set on `roleUpdate` and `guildCreate` events.

## v1.5.0 - 2021-10-16

### Added

- Added two new tables, `reactsSentActivity` and `reactsReceivedActivity`; as well as support/use for them across the
  majority of files.
- Added better in-line documentation.
- Added new string option - `type` - to `leaderboard` command, can now either choose between `Sent` or `Received`
  emojis.
- Added new command `/resetdb`
- Added pm2 to keep bot up 24/7
- Added new `/emoji` command to display emoji-related info such as emoji date added.

### Changed

- `emojiActivity` table changed to `messageActivity`
- Updated `interactionCreate` failed message to include redirect to support server.
- `dbModel.js` insert and deletes to support new tables.
- discord.js updated to 13.2.0
- Renamed bot to Emoji Utilities
- `listemojis.js` Changed pagination to use Buttons and message editing to display info instead of sending multiple
  messages.
- `messageCreate.js` Changed to new bot auth link.

### Fixed

- `ready.js` Thrown errors properly caught.
- `messageUpdate.js` Thrown errors properly caught.
- `listemojis.js` Fixed error when bot cant send message to channel.
- `listemojis.js` Thrown errors properly caught.
- `leaderboard.js` Fixed hourly daterange.
- `displaystats.js` Fixed empty output if no records in databases.
- `messageCreate.js` Fixed send messages error for old command usage warning
- `leaderboard.js` Fixed displaying empty leaderboard.
- `displaystats.js` Fixed bug where displaystats tries to call a deprecated column.
- `aboutemoji.js` Fixed bug where bot can't display proper info due to missing server permissions.

## v1.4.3 - 2021-09-28

### Added

- Added another check for slash command permissions. Slash commands should now be greyed out if user doesn't have the
  proper role perms.

## v1.4.2 - 2021-09-08

### Added

- Partials support for old messages, reaction removing/add on old/uncached messages can now be tracked.
- Added catch for unicode/default emojis so only custom emojis get added to a server's db.
- Added Yearly, Daily, and Hourly daterange options to `displaystats`, `getcount`, and `leaderboard`

### Changed

- Date object format changed from `YYYY-MM-DD` to `YYYY-MM-DDTHH:mm:ss.sssZ`, Databases now store ISO date format and
  queries query with said format.

## Fixed

- Fixed getcount break on thumbnail get user's avatar.

## v1.4.1 - 2021-09-08

### Added

- insertToDb event origin console log.
- deleteFromDb event origin console log.
- `messageDeleteBulk` added insertToDb call for reactions.
- `messageDelete` added insertToDb call for reactions.
- db verbose logging to see if db queries succeed or fail.

### Changed

- `messageReactionRemoveAll` personId tracks message author now instead of reaction author (temp)
- `messageReactionRemove` persondId tracks message author now instead of reaction author (temp)
- `messageReactionAdd` persondId tracks message author now instead of reaction author (temp)

### Fixed

- `guildCreate` Fixed channel access check & welcome message creating.

### Removed

- `docountmessages.py` Removed old .py file as bot uses javascript now.

## v1.4.0 - 2021-09-08

### Added

- Added javascript events `ready.js`, `messageUpdate.js`, `messageReactionRemoveAll.js`, `messageReactionRemove.js`
  , `messageReactionAdd.js`, `messageDeleteBulk.js`, `messageDelete.js`, `messageCreate.js` basic
  implementations. [db99461][db99461]
- Added javascript commands `leaderboard.js`, `config.js` basic implementations. [db99461][db99461]
- Added basic `better-sqlite3` support with basic events implementation `getSettingFlag`, `getDisplayStats`
  , `getGetCount`, `getLeaderboard`, `insertToDb`, `deleteFromDb`, `createDatabase` [cc9d24a][cc9d24a]
- Added `serverSettings(setting TEXT, flag INTEGER)` table for server configs. [cc9d24a][cc9d24a]
- Added `insertToDb` functionality and `messageCreate` functionality. [f5cecd8][f5cecd8]
- Added `deleteFromDb` functionality and `messageDelete` and `messageBulkDelete` functionality. [bff973a][bff973a]
- Added `messageReactionAdd` functionality with `insertToDb`. [be2dad4][be2dad4]
- Added `messageReactionRemove` functionality with `deleteFromDb`. [0c3619b][0c3619b]
- Added `messageReactionRemoveAll` functionality with `deleteFromDb`. [c48a55a][c48a55a]
- Added `messageUpdate` functionality with both `insertToDb` and `deleteFromDb`. [d7037e3][d7037e3]
- Added `config` command functionality with `setSetting` implementation. [f6e2c32][f6e2c32]
- Added `listemoji` command functionality. [fe76b9b][fe76b9b]
- Added `getCount` command functionality. [225ac9a][225ac9a]
- Added `getGetCount` sqlite query functionality. [225ac9a][225ac9a]
- Added `leaderboard` command functionality. [bd0e632][bd0e632]
- Added `getLeaderboard` sqlite query functionality. [bd0e632][bd0e632]
- Added `displaystats` command functionality with Buttons. [33367fb][33367fb]
- Added `getDisplayStats` sqlite query functionality. [33367fb][33367fb]
- `displaystats.js` Added page number on footer. [a66a324][a66a324]
- `guildCreate.js` Added welcome message on bot guild join. [a66a324][a66a324]

### Changed

- Ported everything over to discord.js and javascript.
- `getSettingFlag` into `getSetting. [f6e2c32][f6e2c32]
- `config.js` command response to more readable text. [fe76b9b][fe76b9b]
- `listemoji.js` command sends plain messages instead of responses. [33367fb][33367fb]

### Fixed

- `messageReactionAdd.js` Get reaction's author instead of message author of the reaction [c48a55a][c48a55a]
- `messageReactionRemove.js` Get reaction's author instead of message author of the reaction [c48a55a][c48a55a]
- `displaystats.js` Catch invalid/undefined emoji error. [856a7a4][856a7a4]
- `leaderboard.js` Catch invalid/undefined user error. [856a7a4][856a7a4]

### Removed

- `displaystats.js` Removed Yearly daterange. [33367fb][33367fb]
- `guildCreate.js` Removed attempt to post to admin/system channel. [4c29121][4c29121]

## v1.3.9 - 2021-09-04

### Added

- `ES docountmessages` command; available flags `true` or `false`

### Changed

- `on_message` now considers do_count_messages flag when adding to db.
- `on_message_remove` now considers do_count_messages flag when adding to db.
- `ES help` Updated to include docountmessages command info.
- `ES help` Updated to fix displaystats

## v1.3.8 - 2021-09-04

### Added

- `ES doselfreact` command; available flags `true` or `false`

### Changed

- `on_reaction_add` now consider do_self_react flag when adding to db.
- `on_reaction_remove` now consider do_self_react flag when adding to db.
- `ES help` Updated to include doselfreact command info.

## v1.3.7 - 2021-06-17

### Fixed

- IDE warnings about unused parameters.

## v1.3.6 - 2021-06-16

### Changed

- `bot.py` Refactored all inserts/deletes from db to use emoji's unique id rather than full name.
- `db_model.py` Refactored get_leaderboard to query for emoji's id.
- `db_model.py` Refactored console Record Removed log to use author id rather than author name.
- `displaystats.py` Refactored embed to use emoji object rather than queried db emoji id string.

## v1.3.5 - 2021-06-13

### Changed

- `db_model.py` switched leaderboard check for if bot from bot's name to bot's unique id.
- Updated help command/`help.py`; added Support server link.
- Updated leaderboard/`leaderboard.py`; added catch for new vs old database systems. If retrieved data is a user id, get
  username. If retrieved data is a username, display as normal.

## v1.3.4 - 2021-06-12

- Fixed databases, switched from storing emoji usage by username to storing by user id for cases where the user changes
  their actual username rather than server-nick.
- Minor code cleanup; mainly removing commented out code.

## v1.3.3 - 2021-06-09

- Moved help command to its own file; `help.py`.
- Fixed bot message-on-join.
- Updated all commands and all database queries with user queries to use the user's unique ID rather than mention.

## v1.3.2 - 2021-05-26

- Even more code refactoring
- Moved more `bot.py` sqlite queries to `db_model.py`
- `create_db`, `insert_to_db`, and `delete_from_db` functions created
- `displaystats.py` edited; added automatic user reaction removal on arrow press.

## v1.3.1 - 2021-05-25

- More code refactoring
- Continuation of extension-based commands
    - Created displaystats.py
    - Created listemojis.py

## v1.3.0 - 2021-05-22

- Start of Extensions-based commands
    - Created `getcount.py`
    - Created `leaderboard.py`
- Start of separating sqlite queries into its own file
    - Created `db_model.py`
- Refactored a lot of code

## v1.2.5 - 2020-12-13

- Added help subcommand to `ES help`

## v1.2.4 - 2020-12-13

- Added position indicator to leaderboard.

## v1.2.3 - 2020-12-11

- Fix for previous changelog; NOW checks & PROPERLY removes for if bot is on leaderboad.

## v1.2.2 - 2020-12-11

- Quick fix for 'leaderboard', checks & removes for if bot is on leaderboard.

## v1.2.1 - 2020-12-11

- Added `leaderboard` command to `ES help`
- Fixed `leaderboard` inline display; set to False

## v1.2.0 - 2020-12-11

- Added `leaderboard` command
    - Displays the top ten users who use the specified emoji the most
- Fixed `getcount` error handling

## v1.1.1 - 2020-12-11

- Added error handling for `getcount` and `displaystats`

## v1.1.0 - 2020-12-11

- Added `getcount` command.
    - Displays total emoji count usage at all-time, monthly, and weekly usage; defaults to server's usage if user is not
      specified.

## v1.0.1 - 2020-12-03

- Added next/prev page reaction removal on timeout for the `displaystats` command.
- Fixed bug for next/prev page reaction removal.

## < v1.0.0 - Pre 2020-11-22

Added complete functionality

[db99461]: https://github.com/SethCohen/EmojiStatistics/commit/db99461cafb5371cc85b70f0ec0743be813f7dd6

[cc9d24a]: https://github.com/SethCohen/EmojiStatistics/commit/cc9d24ad9b942dea684aced1d741f721290ebd09

[f5cecd8]: https://github.com/SethCohen/EmojiStatistics/commit/f5cecd895348d7db500572fdb521361ce33a7173

[bff973a]: https://github.com/SethCohen/EmojiStatistics/commit/bff973a294067406f5f37b88a377e7f9b9aee9c4

[be2dad4]: https://github.com/SethCohen/EmojiStatistics/commit/be2dad4779d25d01f0a09b235b7af574436b9e7f

[0c3619b]: https://github.com/SethCohen/EmojiStatistics/commit/0c3619bb5faa151daddc11d84b87f2fc3f747c93

[c48a55a]: https://github.com/SethCohen/EmojiStatistics/commit/c48a55a04dde50a06658abfe0203cb7d0af6cd4b

[d7037e3]: https://github.com/SethCohen/EmojiStatistics/commit/d7037e3e165b0be3e3b742cb66bebb16d686bbab

[f6e2c32]: https://github.com/SethCohen/EmojiStatistics/commit/f6e2c3232c002414335e50d05302a23897de1d35

[fe76b9b]: https://github.com/SethCohen/EmojiStatistics/commit/fe76b9b800c1159ee06a940988e561cdf05ffafb

[225ac9a]: https://github.com/SethCohen/EmojiStatistics/commit/225ac9aaaf6d9590688a74f7d286d1ae8d433417

[bd0e632]: https://github.com/SethCohen/EmojiStatistics/commit/bd0e63296a4877fc9b78839711c174a0e453557c

[33367fb]: https://github.com/SethCohen/EmojiStatistics/commit/33367fb9b8eb8c7ca9249e1b23459d036d5b5532

[a66a324]: https://github.com/SethCohen/EmojiStatistics/commit/a66a3248a0237361527e5129b5132688d947706b

[856a7a4]: https://github.com/SethCohen/EmojiStatistics/commit/856a7a4c5aeee05fefed62e5a425bbfaf03f75fb

[4c29121]: https://github.com/SethCohen/EmojiStatistics/commit/4c291215672e5b99a3edc8086ce082f368e1250e
