// Arrays of words lists
var allWords = [];
var wordsByLetter = [];
var wordsCharged = false;

// Dynamic localize
var searchResults = '';
var clear = '';
var forWord = '';
navigator.mozL10n.ready ( function () {
    var _ = navigator.mozL10n.get;
    searchResults = _('searchResults');
    forWord = _('for');
    clear = _('clear');
});

document.addEventListener('DOMContentLoaded', function() {
    // Enable/disable search button
    var beginSearch = document.getElementById('beginSearch');
    var containSearch = document.getElementById('containSearch');
    var endSearch = document.getElementById('endSearch');
    beginSearch.onkeyup = enableOrDisableSearchWordsListButton;
    beginSearch.oninput = enableOrDisableSearchWordsListButton;
    containSearch.onkeyup = enableOrDisableSearchWordsListButton;
    containSearch.oninput = enableOrDisableSearchWordsListButton;
    endSearch.onkeyup = enableOrDisableSearchWordsListButton;
    endSearch.oninput = enableOrDisableSearchWordsListButton;
    
	
	if (window.innerWidth >= 900) {
		chargeWordsList();
	}
    
    // Charge words list
    document.getElementById('tab3').onclick = function () {
        changeTab(3);
        
        chargeWordsList();
    };
	
});

function chargeWordsList() {
	// Words list is charged if not has been charged yet
    if (!wordsCharged) {
		wordsCharged = true;
		// Load headers
		loadHeaders();

		// First letter is opened
		focusLetter('A');
	}
}

// Load HTML Headers of all letters
function loadHeaders() {
    var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    
    var wordsList = '';
    var currentLetter;
    for (var i = 0; i < letters.length; i++) {
        currentLetter = letters[i];
        wordsList += '<header ><a id="hLet' + currentLetter + '" href="#hLet' + currentLetter
                + '" onclick="return focusLetter(\''
                + currentLetter + '\');">'
                + currentLetter + '</a></header>';
        wordsList += '<ul class="letterHidden" id="let' + currentLetter + '"></ul>';
    }
    
    document.getElementById('wordsList').innerHTML = wordsList;
}


// get words that begin by the specified letter, words are loaded by letter because
// loading all words uses too much RAM
function getWordsOfLetter(letter) {
    if (!allWords || allWords.length === 0) {
        loadAllWords(writeHTMLWordsOfLetter, [letter]);
    } else {
        writeHTMLWordsOfLetter(letter);
    }
}

// Compare two letters in downcase and without tildes
function sameLetter(first, second) {
    first = first.toLowerCase();
    second = second.toLowerCase();
    
    // Tildes are removed
    first = first.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
    second = second.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
    
    return first === second;
}

/**
 * 
 * @param {function} callback Callback funciton
 * @param {array} args Arguments of callback
 * @returns false
 */
function loadAllWords(callback, args) {
	var reqWordsList = new XMLHttpRequest();
	reqWordsList.open('GET', './resources/words_UTF8.txt', true);
	reqWordsList.setRequestHeader('Content-Type', 'text/plain');
	reqWordsList.responseType = 'text';
	reqWordsList.onreadystatechange = function (aEvt) {
		if (reqWordsList.readyState === 4) {
			if (reqWordsList.status === 200 || (reqWordsList.status === 0 && reqWordsList.responseText)) {
				// Event is removed because response is already set
				reqWordsList.onreadystatechange = null;

				// Each line contains a word, and they are saved as array 
				allWords = reqWordsList.responseText.split('\n');
				
				var letter = 'A';
				var wordsNumber = 0;
				var index = 0;
				allWords.forEach(function(word) {
					var currentLetter = word.charAt(0).toUpperCase();
					if (sameLetter(currentLetter, letter)) {
						wordsNumber++;
					} else {
						wordsByLetter[index] = wordsNumber;
						wordsNumber = 1;
						letter = currentLetter;
						index++;
					}
				});
				wordsByLetter[index] = wordsNumber;
				
				callback.apply(window, args);
			} else {
				console.log("Error loading resource\n");
			}
		}
	};
	reqWordsList.send();
	
	
	return false;
}

// Write HTML with words
function writeHTMLWordsOfLetter(letter) {
    var progress = document.createElement('span');
    progress.id = 'progressWordsList';
    document.getElementById('main3Content').insertBefore(progress, document.getElementById('wordsList'));
    
    // Put content in words list section
    var letterDOM = document.getElementById('let' + letter);
    letterDOM.innerHTML = '<li></li>';
    var listDOM = letterDOM.querySelector('li');
	
	// Increase height to better link focus
	var wordsListDOM = document.getElementById('wordsList');
	var gap = document.createElement('div');
    gap.id = 'gap';
    gap.style.height = window.innerHeight + 'px';
	wordsListDOM.appendChild(gap);
	
	var offset = 0;
	var pageSize = 200;
	var prevOffset = 0;
	var prevInverse = undefined;
	var newScroll = false;
	var newInverse = true;
    
    var worker = new Worker('js/workerHTMLWordsList.js');
    worker.onmessage = function(e) {
        if (e.data.written > 0) {
			var wordsList = e.data.wordsList;
			var toReplace = e.data.toRemove;
			prevOffset = offset;
			prevInverse = e.data.inverse;
			offset = e.data.offset;

			if (e.data.inverse) {
				listDOM.innerHTML = wordsList + listDOM.innerHTML;
			} else {
				listDOM.innerHTML += wordsList;
			}
			if (toReplace) {
				var wordHeight = listDOM.querySelector('a').clientHeight;
				listDOM.innerHTML = listDOM.innerHTML.replace(toReplace, '');
				if (e.data.inverse) {
					wordsListDOM.scrollTop += e.data.written * wordHeight;
				} else {
					wordsListDOM.scrollTop -= e.data.written * wordHeight;
				}
			}
		}
		
		setTimeout(function() {
			newScroll = true;
			newInverse = true;
		}, 500);

		if (letterDOM.className !== 'letterShown') {
			letterDOM.className = 'letterShown';
			window.location = window.location.pathname + '#hLet' + letter;
			window.location.href = window.location.pathname + '#panel3';

			// Spinner is removed
			var spinner = document.getElementById('progressWordsList');
			if (spinner) {
				spinner.parentNode.removeChild(spinner);
			}

			setTimeout(function() {
				if (gap) {
					gap.parentElement.removeChild(gap);
				}
			}, 1000);
		}
    };
    worker.postMessage({allWords: allWords, wordsByLetter: wordsByLetter,
		letter: letter, offset: offset, pageSize: pageSize, inverse: false});
		
	
	// Lazy load of words while scrolling
	wordsListDOM.onscroll = function() {
		// only if any letter is open
		if (document.querySelector('.letterShown')) {
			var scrolled = wordsListDOM.scrollTop;
			// total height = height of letterShown
			var totalHeight = document.querySelector('.letterShown').scrollHeight;

			var inverse = false;
			var scroll = false;
			// when scroll is near of the bottom
			if (totalHeight - scrolled <= (window.innerHeight * 2)) {
				inverse = false;
				scroll = true;
			}
			// when scroll is near of the top
			if (scrolled <= (window.innerHeight * 2) && prevOffset > pageSize) {
				inverse = true;
				scroll = true;
			}

			if (scroll && (newScroll || (inverse !== prevInverse && newInverse)))  {
				newInverse = false;
				if (inverse !== prevInverse) {
					if (inverse) {
						offset = prevOffset - pageSize;
					} else {
						offset = prevOffset + pageSize;
					}
				}

				newScroll = false;
				worker.postMessage({allWords: allWords, wordsByLetter: wordsByLetter,
						letter: letter, offset: offset, pageSize: pageSize, inverse: inverse});
			}
		}
	};
}

// Go to letter link and return to panel3 link to avoid loosing tab3 selection.
// In addition the shown letter is hidden and the new letter is shown
function focusLetter(letter) {
    document.getElementById('searchedPanel').className = 'hidden';
    
    var old = document.querySelector('.letterShown');
    if (old) {
        old.className = 'letterHidden';
        old.removeChild(old.firstChild);
    }
	// only charge if the clicked letter is different to shown letter
	if (old !== document.getElementById('let' + letter)) {
		getWordsOfLetter(letter);
	}
    
    return false;
}

// Put word in search field and fire click event in search button
function searchInRae(word) {
    document.getElementById('inputSearch').value = word;
    document.getElementById('searchButton').disabled = false;
    document.getElementById('searchButton').click();
	searchTyping();
    changeTab(1);
    return true;
}

function enableOrDisableSearchWordsListButton() {
    var beginSearch = document.getElementById('beginSearch');
    var containSearch = document.getElementById('containSearch');
    var endSearch = document.getElementById('endSearch');
    var searchButton = document.getElementById('searchInWordsListButton');
    if (searchButton.disabled && (beginSearch.value.length > 0
            || containSearch.value.length > 0 || endSearch.value.length > 0)) {
        searchButton.disabled = false;
    }
    if (!searchButton.disabled && (beginSearch.value.length === 0
            && containSearch.value.length === 0 && endSearch.value.length === 0)) {
        searchButton.disabled = true;
    }
}

function showOrHideSearchBars() {
    var searchIconLink = document.getElementById('searchIconLink');
	var form = document.getElementById('searchInWordsListForm');
    if (form.className.indexOf('searchFormHidden') > 0) {
        form.className = 'formSearchInWordsList searchFormShown';
		searchIconLink.className = 'searchIconRemarked';
		document.getElementById('scrollWordsList').className = 'lettersNotVisible';
    } else {
        form.className = 'formSearchInWordsList searchFormHidden';
		searchIconLink.className = '';
		document.getElementById('scrollWordsList').className = '';
    }
    enableOrDisableSearchWordsListButton();
    
    // Not go to link
    return false;
}

// Go to A letter (cleaning search) and hide search form
function clearSearchInWordsList() {
    // Clean search
    document.getElementById('searchedPanel').className = 'hidden';
    document.getElementById('searchedPanel').innerHTML = '';
	document.getElementById('wordsList').className = '';
    document.getElementById('scrollWordsList').className = '';
	document.getElementById('beginSearch').value = '';
    document.getElementById('containSearch').value = '';
    document.getElementById('endSearch').value = '';
	showOrHideSearchBars();
}

function searchInWordsList() {
    var progress = document.createElement('span');
    progress.id = 'progressWordsList';
    progress.style.position = 'fixed';
    document.getElementById('main3Content').insertBefore(progress, document.getElementById('searchInWordsListForm'));
	
	var beginSearch = document.getElementById('beginSearch');
    var containSearch = document.getElementById('containSearch');
    var endSearch = document.getElementById('endSearch');
	beginSearch.blur();
	containSearch.blur();
	endSearch.blur();
    
    var begin = beginSearch.value;
	var searchInBegin = begin.length > 0;
    var contain = containSearch.value.split(' ');
	var searchInContain = contain.length > 0 && contain[0].length > 0;
    var end = endSearch.value;
	var searchInEnd = end.length > 0;
	
    var panel = document.getElementById('searchedPanel');
	
	var worker = new Worker('js/workerSearchWordsList.js');
    worker.onmessage = function(e) {
        var wordsList = e.data.wordsList;
        
        if (e.data.end) {
            document.getElementById('searchResultsHeaderKeys').innerHTML += '<span> (' + e.data.count + ')</span>';
			// add the rest of HTML when transitions are finished
            setTimeout(function() {
                panel.innerHTML += wordsList;
				
				// Spinner is removed
				var spinner = document.getElementById('progressWordsList');
				if (spinner) {
					spinner.parentNode.removeChild(spinner);
				}
            }, 500);
        } else {
            panel.innerHTML += wordsList;
        }
		
		if (panel.className !== 'searchedPanel') {
			panel.className = 'searchedPanel';
		}
    };
    worker.postMessage({allWords: allWords, begin: begin, contain: contain, end: end});
    
    // Format words
    var wordsList = '<h1 id="searchResultsHeader" data-l10n-id="searchResults">' + searchResults
			+ '</h1><h2 id="searchResultsHeaderKeys">'
            + ' ' + (searchInBegin ? begin + '-' : '') + (searchInContain ? contain.join(' ') : '')
			+ (searchInEnd ? '-' + end : '') + '</h2>';
	wordsList += '<button class="danger" role="button" type="reset" data-l10n-id="clear" '
					+ 'onclick="clearSearchInWordsList();">' + clear + '</button><br/>';

	panel.innerHTML += wordsList;
    
    // Hide form and wordsList panel
    showOrHideSearchBars();
	document.getElementById('wordsList').className = 'hidden';
    document.getElementById('scrollWordsList').className = 'hidden';
	
	// return false in order not to validate form
	return false;
}
