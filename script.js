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

    // Setup a click event for the random words
    $('#randomWordButton').on('click', () => {addRandomWords()});

    // Load the JSON file containing word vectors
    $.getJSON('word_vectors.json', function(data) {
        // Pass the JSON data to the setup function.
        window.Word2VecUtils.setup(data);

        // Hide the loading message
        $("#loading").hide();

        // Add six random words from the collection.
        addRandomWords();

        // Listen for clicking of submit button
        $('#submit').click(function() {
            var word1 = $('#input1').val();

            // Check if word1 is in the word vectors
            var vec = window.Word2VecUtils.getVec(word1);

            // If the response is an Array, it is a vector.
            // If it is false, the word does not exist in the database.
            if(Array.isArray(vec)) {
                var result = window.Word2VecUtils.getNClosestMatches(11, vec);
                // Display the result in the HTML element with id "results"
                // For the array, present a table with the words and their distances
                var table = '<table><tr><th>Word</th></tr>';
                for (var i = 1; i < result.length; i++) {
                    table += '<tr><td>' + result[i][0] + '</td></tr>';
                }
                table += '</table>';
                $("#results").html(table);
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
        console.error('Failed to load word_vectors.json');
        // Handle the error here, e.g., show an error message to the user
        // Update the HTML element #loading to indicate failure
        $("#loading").html("Failed to load word vectors.");
    });
});