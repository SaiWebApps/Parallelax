# Parallelax
NodeJS library that leverages NodeJS "async" API to execute multiple Blockspring functions in parallel.<br>
A more general version of this library can be accessed at https://api.blockspring.com/SaiWebApps/parallelax.

# Installation via NPM
```
npm install parallelax
```

# Usage
Let us say that the user wants to execute 2+ Blockspring APIs parallely because she wants to amalgamate specific
information from each API into a single record/object in some database.<br>

Now, say that the Blockspring APIs in question are:
* https://api.blockspring.com/pkpp1233/google-image-search-first-result
* https://api.blockspring.com/SaiWebApps/synonyms-crawler

To execute these 2 APIs in parallel and get back all of their results in 1 go:
```
// API Key can optionally be specified as a constructor argument. Sign up for a Blockspring account to get an API key.
var blockList = require("parallelax");

// Add input API blocks to BlockList.
// First arg is API name, and second is inputs to the API.
blockList.addBlock("synonyms-crawler", { "word": "belie", "max_degrees_of_separation": 1 });
blockList.addBlock("google-image-search-first-result", { "text_search": "Chris Rock" });

// Execute in parallel, and handle outputs.
blockList.executeInParallel(function(allResults) {
  console.log(allResults);
});
```

The output of the above code will be organized as follows:
```
{
    "google-image-search-first-result": {
        "image": "http://upload.wikimedia.org/wikipedia/commons/5/57/Chris_Rock_WE_2012_Shankbone.JPG"
    },
    "synonyms-crawler": {
        "0": [
            "belie"
        ],
        "1": [
            "pervert",
            "gloss over",
            "disguise",
            "miscolor",
            ...
        ],
        "2": [
            "revoke",
            "turn thumbs down",
            "kill",
            "wash one's hands of",
            ....

        ]
    }
}
```

In other words, the output will be a JSON object, where the key is the Blockspring API name, and the value will be that API's output
for the supplied API inputs.

You can find another example in test/test.js.

# Use Case
One use case for the amalgamated information above is to create a JSON object with a word, its synonyms, and the first image from Google
Images for that word, and then to save this object to a database. Without this library, we would otherwise have to invoke
the necessary Blockspring APIs individually, in which case we would either have to:,

* Coordinate their execution ourselves so that we can save all of the info to the database in 1 go. (nasty & complicated in NodeJS)
* Or save bits and pieces to the database at a time, which would result in multiple writes. (expensive)

This library solves the aforementioned problem as our callback to executeInParallel can simply extract the necessary info, assemble
the JSON object, and save it to the database.

# Dependencies
* https://github.com/caolan/async
* https://github.com/blockspring/blockspring.js

Check package.json.
