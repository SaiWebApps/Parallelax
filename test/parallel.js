var blockList = require("../lib/blockList.js");

// Specify which APIs should be executed, and provide those APIs' inputs.
var inputAPIs = ["synonyms-crawler", "english-dictionary", "google-image-search"];
blockList.addBlock(inputAPIs[0], { 
    "word": "belie", 
    "max_degrees_of_separation": 1 
});
blockList.addBlock(inputAPIs[1], {"word": "chthonic"});
blockList.addBlock(inputAPIs[2], {"text_search": "belie"});

/**
 * @results - JSON object, where the key is the API name, and the value is that API's results
 * @return true if we have all APIs' results, false otherwise
 */
function validateUniqueAPIParallelExec(results)
{
    var equals = function(array1, array2) {
        return array1.length === array2.length && array1.every(function(elem, index) {
            return elem === array2[index];
        });
    };

    // Be sure to sort both input and output APIs - since we are executing these
    // APIs in parallel, they will not necessarily execute in a fixed order, so
    // we want to only compare the 2 lists' contents, not their ordering.
    // If this were a serial execution, then we would compare their ordering as well.
    var outputAPIs = Object.keys(results);
    inputAPIs.sort();
    outputAPIs.sort();

    console.log("TEST 1: BASIC VALIDATION OF PARALLEL EXECUTION");
    if (equals(inputAPIs, outputAPIs)) {
        console.log("Success");
        return true;
    }
    console.log("Failure");
    console.log("Input APIs: " + inputAPIs);
    console.log("Output APIs: " + outputAPIs);
    return false;
}

// First, execute all of these tasks in parallel, and verify that we have
// results for all of these (unique) APIs.
blockList.parallel(function(results) {
    // Testing basic functionality
    if (!validateUniqueAPIParallelExec(results)) {
        return;
    }

    var GoogleImageSearchAPI = "google-image-search-first-result";

    // Now, verify that the the same API can be executed multiple times in
    // parallel with a different set of inputs.
    var synonyms = results["synonyms-crawler"][0]["1"];
    blockList.clear(); // Clear all of the old blocks.

    console.log("\nTest 2: PARALLELY EXECUTE SAME API MULTIPLE TIMES");
    if (!results) {
        console.log("Failure - Did not get any results from the SynonymsCrawler API.");
        return;
    }

    // For each synonym of "belie" (contained in @synonyms), add a block to
    // retrieve the first corresponding image from Google Image Search.
    for (var i = 0; i < synonyms.length; i++) {
        blockList.addBlock(GoogleImageSearchAPI, {
            "text-search": synonyms[i]
        });
    }

    blockList.parallel(function(nestedResults) {
        if (GoogleImageSearchAPI in nestedResults && 
                nestedResults[GoogleImageSearchAPI].length === synonyms.length) {
            console.log("Success");
            return;
        }
        console.log("Failure");
        console.log("Actual: " + nestedResults[GoogleImageSearchAPI]);
        console.log("Expected: " +  synonyms.length);
    });
});

