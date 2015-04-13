var BlockList = require("./blockList.js");
var blockList = new BlockList();

// Specify which APIs should be executed, and provide those APIs' inputs.
var inputAPIs = ["synonyms-crawler", "english-dictionary", "google-image-search"];
blockList.addBlock(inputAPIs[0], { 
    "word": "belie", 
    "max_degrees_of_separation": 1 
});
blockList.addBlock(inputAPIs[1], {"word": "chthonic"});
blockList.addBlock(inputAPIs[2], {"text_search": "Wall Street"});

// Execute them in parallel, and verify that all of them have been executed.
blockList.executeInParallel(function(results) {
    var equals = function(array1, array2) {
        return array1.length === array2.length && array1.every(function(elem, index) {
            return elem === array2[index];
        });
    };

    var outputAPIs = Object.keys(results);
    if (!equals(inputAPIs, outputAPIs)) {
        console.log("Failure");
        console.log("Input APIs: " + inputAPIs);
        console.log("Output APIs: " + outputAPIs);
    }
    else {
        console.log("Success");
    }
});

