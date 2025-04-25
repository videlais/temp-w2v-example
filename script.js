/**
 * Update the input form with the clicked random word.
 * @param {string} word 
 */
function updateInputForm(word) {
    // Update the input field with the clicked word
    $('#input1').val(word);
    // Trigger the click event on the submit button
    $('#submit').click();
}

/**
 * Add six random words to the HTML element with id "randomWords".
 */
function addRandomWords() {
    // Get six random words from the word vectors
    var randomWords = window.Word2VecUtils.getNRandomWords(6);

    // Display the random words in the HTML element with id "randomWords"
    var randomWordsHtml = '<ul>';

    // For every word, add a line item.
    // Each line item is a link that updates the input form with the word.
    for (var i = 0; i < randomWords.length; i++) {
        randomWordsHtml += `<li><a href="#" onclick="updateInputForm('${randomWords[i]}')">${randomWords[i]}</a></li>`;
    }

    // Close the unordered list.
    randomWordsHtml += '</ul>';

    // Set the HTML content of the element with id "randomWords" to the generated list
    $("#randomWords").html(randomWordsHtml);
}

/**
 * Main function to set up the page.
 * This function is called when the document is ready.
 */
$(document).ready(function() {
    // Clear the input fields
    $('#input1').val('');
    $('#diff1').val('');
    $('#diff2').val('');

    // Prevent pressing ENTER from reloading the page
    // This is done by preventing the default action of the form submission.
    $('.submissions').on('submit', function(event) {
        event.preventDefault();
    });

    let historicText = '';

    // Setup a click event for the random words
    $('#randomWordButton').on('click', () => {addRandomWords()});

    // Retrieve the historic-material.txt file
    $.get('historic-materials.txt', (data) => {
        // Loaded file is separated by spaces.
        historicText = data.split(' ');
    }
    ).fail(function() {
        console.error('Failed to load historic-material.txt');
        // Handle the error here, e.g., show an error message to the user
        // Update the HTML element #historic to indicate failure
        $("#historic").html("Failed to load historic material.");
    });

    const numberOfFileParts = 76; //Number of parts to load
    const fileParts = [];

    // Load the word vectors in parts
    for (let i = 0; i < numberOfFileParts; i++) {
        fileParts.push(`parts/word_vectors_${i}.json`);
    }

    // Load the JSON files containing word vectors in parts
    $.when(...fileParts.map(file => $.get(file))).done(function(...responses) {

        // For each response, merge the responses into a single object
        let mergedData = responses.reduce((acc, response) => {
            // Merge the arrays of objects into a single object
            return { ...acc, ...response[0] };
        }, {});

        // Pass the merged JSON data to the setup function.
        window.Word2VecUtils.setup(mergedData);

        // Hide the loading message
        $("#loading").hide();

        // Add six random words from the collection.
        addRandomWords();

        // Listen for clicking of submit button
        $('#submit').click(function() {
            var word1 = $('#input1').val();

            // Check if word1 is in the word vectors
            var vec = window.Word2VecUtils.getVec(word1);

            let result = [];

            // If the response is an Array, it is a vector.
            // If it is false, the word does not exist in the database.
            if(Array.isArray(vec)) {
                result = window.Word2VecUtils.getNClosestMatches(11, vec);
                //result = window.Word2VecUtils.findSimilarWords(11, word1);
                // Display the result in the HTML element with id "results"
                // For the array, present a table with the words and their distances
                var table = '<table><tr><th>Word</th></tr>';
                for (var i = 1; i < result.length; i++) {
                    table += '<tr><td>' + result[i][0] + '</td></tr>';
                }
                table += '</table>';

                // Display the table in the HTML element with id "results"
                $("#results").html(table);

                // Show the historic material
                // First, check if historicText is not empty
                if(historicText.length > 0) {
                    // Find every occurrence of the word in the historic word array
                    const indexes = historicText.reduce((acc, word, index) => {
                        if (word === word1) {
                            acc.push(index);
                        }
                        return acc;
                    }
                    , []);
                    
                    // Limit the array to 10 occurrences or less
                    if (indexes.length > 10) {
                        indexes.length = 10;
                    }

                    // For every occurrence of the word, add a line item.
                    // The line item should have the five words before and after the occurrence.
                    var historicWordsHtml = '<ul>';
                    for (var i = 0; i < indexes.length; i++) {
                        var start = Math.max(0, indexes[i] - 5);
                        var end = Math.min(historicText.length, indexes[i] + 6);
                        var words = historicText.slice(start, end);
                        // Add a <span> tag to highlight the word
                        words = words.map((word, index) => {
                            if (index === 5) {
                                return `<span style="color: green; font-weight: bold;">${word}</span>`;
                            }
                            return word;
                        });

                        // For every word in results found in words, add a <span> tag to highlight the word
                        for (var j = 0; j < result.length; j++) {
                            if (words.includes(result[j][0]) && result[j][0] !== word1) {
                                words[words.indexOf(result[j][0])] = `<span style="color: orange; font-weight: bold;">${result[j][0]}</span>`;
                            }
                        }

                        // Add the words to the list
                        // The word is highlighted in green and bold
                        historicWordsHtml += '<li>' + words.join(' ') + '</li>';
                    }
                    // Close the unordered list.
                    historicWordsHtml += '</ul>';
                    
                    // Display the historic words in the HTML element with id "historic"
                    $("#historic").html(historicWordsHtml);
                }

            } else {
                $("#results").html("Word not found in the database.");
            }
        });

        // Listen for submitDiff button
        $('#submitDiff').click(function() {
            var word1 = $('#diff1').val();
            var word2 = $('#diff2').val();

            // Check if word1 and word2 are in the word vectors
            var vec1 = window.Word2VecUtils.getVec(word1);
            var vec2 = window.Word2VecUtils.getVec(word2);

            // If both words exist, calculate the difference and display the result
            if (Array.isArray(vec1) && Array.isArray(vec2)) {
                var result = window.Word2VecUtils.diffN(12, word1, word2);
                // Display the result in the HTML element with id "results"
                // For the array, present a table with the words and their distances
                var table = '<table><tr><th>Word</th></tr>';
                for (var i = 3; i < result.length; i++) {
                    table += '<tr><td>' + result[i][0] + '</td></tr>';
                }
                table += '</table>';
                $("#resultsDiff").html(table);
            } else {
                $("#resultsDiff").html("One or both words not found in the database.");
            }
        });

            
    }).fail(function() {
        console.error('Failed to load word_vectors_part files');
        // Handle the error here, e.g., show an error message to the user
        // Update the HTML element #loading to indicate failure
        $("#loading").html("Failed to load word vectors.");
    });

});