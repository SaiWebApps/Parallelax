var async = require("async");
var blockspring = require("blockspring");

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
        callback(null, results.params);
    };

    // If the BlockList storing this Block has an API key, use it.
    if (apiKey) {
        blockspring.runParsed(apiName, apiInputs, apiKey, handleAPIResults);
    }
    else {
        blockspring.runParsed(apiName, apiInputs, handleAPIResults);
    }
}

/**
 * @constructor for the BlockList class
 * @param apiKey = Blockspring user's API key, shared across API calls
 *
 * Initializes a BlockList reference. BlockList will store information
 * about a list of Blockspring functions and will coordinate their execution
 * (e.g., execute them in series/parallel).
 */
function BlockList(apiKey)
{
    this.executors = {};
    this.apiKey = (arguments.length == 1) ? apiKey : null;
}

/**
 * @param apiName = Blockspring API to execute
 * @param apiInputs = Inputs to target Blockspring API
 * 
 * Add information about a given Blockspring API to this BlockList.
 */
BlockList.prototype.addBlock = function(apiName, apiInputs) {
    var thisBlockList = this;

    thisBlockList.executors[apiName] = function(callback) {
        executeBlock(apiName, apiInputs, thisBlockList.apiKey, callback);
    };
};

/**
 * @param yourCallback = a function specifying how to use all of the APIs' results
 *
 * Execute all of the blocks/tasks in this BlockList in parallel, and pass on
 * the results to yourCallback. Note that the results passed to yourCallback will
 * be organized into a JSON object, where the key will be the API name, and the value
 * will be that API's execution results from Blockspring.
 */
BlockList.prototype.executeInParallel = function(yourCallback) {
    // 2nd argument specifies what should be done after all of the tasks in
    // executors have been executed. Note that it MUST take in 2 arguments -
    // error and apiResults.
    async.parallel(this.executors, function(error, apiResults) {
        yourCallback(apiResults);   // Now, handle all of the results. 
    });
};

module.exports = BlockList;
