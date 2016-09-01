Parallelax
===================
Leverage [async](https://www.npmjs.com/package/async) to execute multiple Blockspring functions in parallel. A more general version of this library can be accessed at https://api.blockspring.com/SaiWebApps/parallelax.

----------
Installation via NPM
-------------
```
npm install parallelax
```

----------
Usage
-------------
Let us say that the user wants to execute 2+ Blockspring APIs parallely because she wants to amalgamate specific information from each API into a single record/object in some database.

Now, say that the Blockspring APIs in question are:
* https://open.blockspring.com/SaiWebApps/stock-parser
* https://open.blockspring.com/SaiWebApps/synonyms-crawler

To execute these 2 APIs in parallel and get back all of their results in 1 go:
```
// API Key can optionally be specified as a constructor argument. Sign up for a Blockspring account to get an API key.
var blockList = require("parallelax");

// Add input API blocks to BlockList.
// First arg is API name, and second is inputs to the API.
blockList.addBlock("synonyms-crawler", { "word": "belie", "max_degrees_of_separation": 1 });
blockList.addBlock("stock-parser", { "symbols": "FB" });

// Execute in parallel, and handle outputs.
blockList.executeInParallel(function(allResults) {
  console.log(allResults);
});
```

The output of the above code will be organized as follows:
```
{
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
        ]
    },

    "stock-parser": {
        "stock_info": {
            "FB": {
                "YearLow": "85.72",
                "DividendShare": null,
                "PricePaid": null,
                "DaysLow": "125.10",
                "EPSEstimateNextQuarter": "1.24",
                "EarningsShare": "2.09",
                "TickerTrend": null,
                "DaysRange": "125.10 - 126.22",
                "YearHigh": "128.33",
                "EBITDA": "11.08B",
                "ErrorIndicationreturnedforsymbolchangedinvalid": null,
                "LastTradeDate": "8/31/2016",
                "Bid": "126.30",
                "PriceSales": "16.31",
                ...
            }
        }
    }
}
```

In other words, the output will be a JSON object, where the key is the Blockspring API name, and the value is that API's output for the supplied API inputs. If the user executes the same API multiple times, then the value corresponding to the API will be a list consisting of the outputs for each run/execution.

You can find another example in test/test.js.

----------
Use Case
-------------
One use case for this API is to create a JSON object with a word, its synonyms, and the first image from Google Images for that word, and then to save this object to a database. Without this library, we would otherwise have to invoke the necessary Blockspring APIs individually, in which case we would either have to:,

* Coordinate their execution ourselves so that we can save all of the info to the database in 1 go. (nasty & complicated in NodeJS)
* Or save bits and pieces to the database at a time, which would result in multiple writes. (expensive)

This library solves the aforementioned problem as our callback to executeInParallel can simply extract the necessary info, assemble the JSON object, and save it to the database.

----------
Dependencies
-------------
* https://github.com/caolan/async
* https://github.com/blockspring/blockspring.js

Check package.json.

----------
My Versioning Methodology
-------------
1.0.0
1 (Major Number) = Update upon making a breaking change.
0 (Minor Number) = Update after adding new features, fixing bugs, or making other "non-breaking" changes.
0 (Patch Number) = Update after changing documentation or tests.