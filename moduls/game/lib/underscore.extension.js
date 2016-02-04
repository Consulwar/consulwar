// Import from actual version of underscore

var cb = function(value, context, argCount) {
	if (value == null) return _.identity;
	if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	if (_.isObject(value)) return _.matcher(value);
	return _.property(value);
};

var optimizeCb = function(func, context, argCount) {
	if (context === void 0) return func;
	switch (argCount == null ? 3 : argCount) {
		case 1: return function(value) {
			return func.call(context, value);
		};
		case 3: return function(value, index, collection) {
			return func.call(context, value, index, collection);
		};
		case 4: return function(accumulator, value, index, collection) {
			return func.call(context, accumulator, value, index, collection);
		};
	}
	return function() {
		return func.apply(context, arguments);
	};
};

var createAssigner = function(keysFunc, defaults) {
	return function(obj) {
		var length = arguments.length;
		if (defaults) obj = Object(obj);
		if (length < 2 || obj == null) return obj;
		for (var index = 1; index < length; index++) {
			var source = arguments[index],
					keys = keysFunc(source),
					l = keys.length;
			for (var i = 0; i < l; i++) {
				var key = keys[i];
				if (!defaults || obj[key] === void 0) obj[key] = source[key];
			}
		}
		return obj;
	};
};

_.isMatch = function(object, attrs) {
	var keys = _.keys(attrs), length = keys.length;
	if (object == null) return !length;
	var obj = Object(object);
	for (var i = 0; i < length; i++) {
		var key = keys[i];
		if (attrs[key] !== obj[key] || !(key in obj)) return false;
	}
	return true;
};

_.matcher = _.matches = function(attrs) {
	attrs = _.extendOwn({}, attrs);
	return function(obj) {
		return _.isMatch(obj, attrs);
	};
};

_.extendOwn = _.assign = createAssigner(_.keys);



_.mapObject = function(obj, iteratee, context) {
	iteratee = cb(iteratee, context);
	var keys = _.keys(obj)
		, length = keys.length
		, results = {};

	for (var index = 0; index < length; index++) {
		var currentKey = keys[index];
		results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	}
	return results;
};