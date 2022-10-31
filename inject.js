// injects a js file into the website
// called from bookmarklet

(function inject() {
	const scriptURL =
		"https://github.com/AlexW00/bookmarklets/blob/main/captureScroll.js";
	const script = document.createElement("script");
	script.src = scriptURL;
	document.body.appendChild(script);
})();
