/**
 * Libraries/dependencies
 */
var async = require("async");
var blockspring = require("blockspring");

/* 
 * Executors was originally a JSON object, where the key was the API name, and
 * the value was the list of API inputs. But that structure would prevent us from
 * parallely executing the same API for different inputs since each key must be
 * unique within a JSON object.
 */
var executors = [];
var apiKey = null;

/**
 * @param apiName = Name of Blockspring API to execute
 * @param apiInputs = Inputs to aforementioned API
 * @param apiKey = Optional; user-specific API key
 * @param callback = provided by async js library; maps API output to API in aggregate structure
 *
 * Execute an API on Blockspring, and store results in an aggregate structure.
 */
function executeBlock(apiName, apiInputs, apiKey, callback)
{
    var handleAPIResults = function(results) {
        callback(null, {
            "apiName": apiName,
            "results": results.params
        });
    };

    // If the BlockList storing this Block has an API key, use it.
    if (apiKey) {
        blockspring.runParsed(apiName, apiInputs, apiKey, handleAPIResults);
    }
    else {
        blockspring.runParsed(apiName, apiInputs, handleAPIResults);
    }
}

exports.setAPIKey = function(key) {
    apiKey = key;
};

/**
 * @param apiName = Blockspring API to execute
 * @param apiInputs = Inputs to target Blockspring API
 * 
 * Add information about a given Blockspring API to this BlockList.
 */
exports.addBlock = function(apiName, apiInputs) {
    executors.push(function(callback) {
        executeBlock(apiName, apiInputs, apiKey, callback);
    });
};

/**
 * @param allApiResults - a list of JSON objects with 2 keys; one key is
 * the API name, and the other is that API's results
 *
 * Transform @allApiResults into a JSON object, where the key is the API name,
 * and the value is the list of that API's outputs, and return this object.
 */
function rearrange(allApiResults)
{
    var rearranged = {};

    for (var i = 0; i < allApiResults.length; i++) {
        var elem = allApiResults[i];
        var apiName = elem["apiName"];
        var apiResults = elem["results"];

        // If @apiName does not exist yet in @rearranged, then
        // associate it with an empty list.
        if (!(apiName in rearranged)) {
            rearranged[apiName] = [];
        }
        // At this point, there is a list mapped to @apiName in @rearranged,
        // so we can simply add @apiResults to that list.
        rearranged[apiName].push(apiResults);
    }

    return rearranged;
}

/**
 * @param yourCallback = a function specifying how to use all of the APIs' results
 *
 * Execute all of the blocks/tasks in this BlockList in parallel, and pass on
 * the results to yourCallback. Note that the results passed to yourCallback will
 * be organized into a JSON object, where the key will be the API name, and the value
 * will be a list containing that API's execution results from Blockspring.
 */
exports.parallel = function(yourCallback) {
    // 2nd argument specifies what should be done after all of the tasks in
    // executors have been executed. Note that it MUST take in 2 arguments -
    // error and apiResults.
    async.parallel(executors, function(error, apiResults) {
        var rearrangedApiResults = rearrange(apiResults);
        yourCallback(rearrangedApiResults);   // Now, handle all of the results. 
    });
};

/**
 * Remove all blocks that are currently in this BlockList.
 */
exports.clear = function() {
    executors = [];
};
