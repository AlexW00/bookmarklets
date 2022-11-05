javascript: (function inject() {
	console.log("loaded bookmarklet");
	const readingIndex = prompt("Enter reading index: ", "1");
	const readingListElement = getReadingListElement(readingIndex);

	console.log("readingListElement: ", readingListElement);

	function findByContent(content) {
		return Array.from(document.querySelectorAll("*")).filter(function (
			element
		) {
			return element.textContent === content;
		});
	}

	function getReadingListElement(readingIndex) {
		const readingHeader = findByContent("Reading ")[0];
		const readingContainer = readingHeader.parentElement;
		const readingList = readingContainer.querySelector(".list-group");
		const readingListItems = readingList.querySelectorAll(".row");
		return readingListItems[readingIndex];
	}

	const playButtonLink = readingListElement.querySelector("a"),
		dataReading = playButtonLink.getAttribute("data-reading");
	console.log("dataReading: ", dataReading);
	const jwt = dataReading.match(/"ey.+"/)[0]?.replace(/"/g, "");
	console.log("jwt: ", jwt);
	const text = dataReading.match(/<phoneme.+<\/phoneme>/)[0];
	console.log("text: ", text);

	const { $letters, type } = $getLetters(readingListElement);

	function $getLetters() {
		const rubyLetters = readingListElement.querySelector("ruby");
		const simpleLetters = readingListElement.querySelector(
			"div.d-inline-block.align-middle.p-2"
		);

		if (rubyLetters) {
			return {
				$letters: rubyLetters,
				type: "ruby",
			};
		} else if (simpleLetters) {
			return {
				$letters: simpleLetters,
				type: "simple",
			};
		}
		return undefined;
	}

	const letters =
		type == "ruby" ? parseRubyLetters($letters) : parseSimpleLetters($letters);
	console.log("letters: ", letters);

	function parseSimpleLetters($letters) {
		const letters = $letters.textContent.split("");
		const kanji = [],
			katakana = [],
			hiragana = [];

		letters.forEach((letter, index) => {
			const letterType = getLetterType(letter);
			if (letterType == "kanji") {
				kanji.push(letter);
			}
			if (letterType == "katakana") {
				katakana.push(letter);
			}
			if (letterType == "hiragana") {
				hiragana.push(letter);
			}
		});

		return {
			kanji,
			katakana,
			hiragana,
		};
	}

	function parseRubyLetters($letters) {
		const kanji = [],
			katakana = [],
			hiragana = [];
		let bracketIsOpen = false;

		$letters.childNodes.forEach(($letter) => {
			const letterType = getLetterType($letter.textContent);
			console.log($letter.textContent, letterType);

			switch (letterType) {
				case "kanji":
					kanji.push($letter.textContent);
					break;
				case "katakana":
					katakana.push($letter.textContent);
					break;
				case "hiragana":
					hiragana.push($letter.textContent);
					if (!bracketIsOpen) kanji.push($letter.textContent);
					break;
				default:
					bracketIsOpen = !bracketIsOpen;
					break;
			}
		});
		return {
			kanji,
			katakana,
			hiragana,
		};
	}

	function getLetterType(letter) {
		if (letter?.match(/[\u4e00-\u9faf]/)) {
			return "kanji";
		}
		if (letter?.match(/[\u30a0-\u30ff]/)) {
			return "katakana";
		}
		if (letter?.match(/[\u3040-\u309f]/)) {
			return "hiragana";
		}
		return "romaji";
	}

	function urlEncode(str) {
		const urlEncoded = encodeURIComponent(str) + "";
		const finalUrlEncoded = urlEncoded.replace(/%20/g, "+");
		console.log("urlEncoded: ", finalUrlEncoded);
		return finalUrlEncoded;
	}

	const url =
		"https://www.japandict.com/voice/read?text=" +
		urlEncode(text) +
		"outputFormat=ogg_vorbis&jwt=" +
		urlEncode(jwt) +
		"&vid=1";

	console.log("url: ", url);

	function playAudio(blob) {
		const audio = new Audio();
		audio.src = URL.createObjectURL(blob);
		audio.play();
	}

	fetch(url)
		.then((response) => response.blob())
		.then((blob) => playAudio(blob));
})();
