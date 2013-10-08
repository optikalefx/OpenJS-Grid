// Root Version SC.05.27.12
///////////////////////////////////////////////////////////////////////////////
// RootJS is basically a way to write much easier OOP code
// Root.DOM is a helper object to inherit from, so you get a bunch of really cool
// dom stuff, like events, objects tied to elements, and a jQuery plugin arch
///////////////////////////////////////////////////////////////////////////////
(function($, window, document, undefined) {
	"use strict";
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////		Root
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	window.Root = {
		_construct : function() {},	// construct method
		_init : function() {},		// method called on every instantiation
		proto : function () {       // shortcut to parent object
			return Object.getPrototypeOf(this);
		},
		
		// borrowed and modifed from jQuery source. They do it the best.
		// we use our own check methods though
		extend : function() {
			var options, name, src, copy, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = true;
		
			// Handle case when target is a string or something (possible in deep copy)
			if ( typeof target !== "object" && typeof target != "function" ) {
				target = {};
			}
		
			for ( ; i < length; i++ ) {
				// Only deal with non-null/undefined values
				if ( (options = arguments[ i ]) != null ) {
					// Extend the base object
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];
						
						// Prevent never-ending loop
						if ( target === copy ) {
							continue;
						}
		
						// Recurse if we're merging plain objects or arrays
						if ( deep && copy && ( this.isPlainObject(copy) )) {
							if(src && Array.isArray(src)) {
								clone = src && Array.isArray(src) ? src : [];
							} else {
								clone = src && this.isPlainObject(src) ? src : {};
							}
		
							// Never move original objects, clone them
							target[ name ] = this.extend( deep, clone, copy );
		
						// Don't bring in undefined values
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}
		
			// Return the modified object
			return target;
		},
		// tests if object is a plain object
		isPlainObject : function(obj) {
			// typeof null == 'object' haha
			if(obj !== null && typeof obj === "object") {
				// yea!
				return this.proto.call(obj).hasOwnProperty("hasOwnProperty");
			} else {
				return false;
			}
		},
		// wrapper for set and get
		// takes the property you wanna set, and calls the method on 'this'
		// optional placeholder to init with
		setter : function(prop,method,placeHolder) {
			var placeHolder = placeHolder;
			Object.defineProperty(this,prop,{
				get : function() {return placeHolder},
				set : function(val) {
					placeHolder = val;
					this[method](val);
				}
			});
		},
		// convience method
		define : function() {
			return this.inherit.apply(this,arguments);
		},
		// object inheritance method
		// takes an object to extend the class with, &| a dom element to use
		inherit: function(values, el) {

			// create a copy of the parent and copy over new values
			// normally Object.create() takes a 2nd param to extend properties. But when you use that,
			// you can't use use an easy JSON structure, you have to define enumerable, writable, and configurable and value
			// FOR EVERY PROPERTY.  So.. we just do it ourselves with this.extend
			var	parent = this, instance;
			
			if(typeof el != "undefined") values.el = el;
			
			// handle arrays
			if(Array.isArray(values)) {
				instance = values;
				this.extend(instance, parent);
			} else {
				instance = Object.create(parent);
				// now do a deep copy
				this.extend(instance, values);
			}
			
			// if the parent element has a constructor, call it on the instances
			if(parent.hasOwnProperty("_construct")) { parent._construct.apply(instance); }
			
			// if i have an _init function, call me
			if(instance.hasOwnProperty("_init")) { instance._init(); }
			
			// return the new instance
			return instance;
			
		},
		jQueryPlugin : function(name) {
		
			 // pull the name out of the first argument
			var args = Array.prototype.slice.call(arguments);
			args.splice(0,1);

			// this does our Grid = Root.inherit(stuff)
			// so this is just like the main definition of the main object
			var Obj = this.inherit.apply(this,args);
			
			// create the jQuery Plugin
	    	$.fn[name] = function(user_opts) {
				
				var args = Array.prototype.slice.call(arguments),
					$ret = $(),
					el;

				for(var i=0;i<this.length;i++) {
					el = this[i];
										
					if(typeof el.instance == "undefined") {
						if(!user_opts) user_opts = {};
						// store the instance on the element
						// THIS LINE HAS BEEN ALTERED FOR OPENJSGRID
						el.instance = Obj.inherit({opts : user_opts}, el);
					}
					
					// passing a string calls a method
					if(typeof user_opts === "string") {
						var method = user_opts, property = user_opts;
						
						// call the method, passing it all params (except first 1)
						if(typeof el.instance[method] == "function") {
							args.splice(0,1); // first arg is the method name, we dont need this
							return el.instance[method].apply(el.instance,args);
						} else {
							
							// if there was just a property, get it
							if(args.length == 1) {
								return el.instance[property];
							
							// if there was a property and a value, set it
							} else if (args.length == 2) {
								el.instance[property] = args[1];
								return args[1];
							}
						}
					// passed an object in
					} else {
						this.extend(el.instance, user_opts);
					}
					
					// push our new elements onto the jquery collection
					// THIS LINE HAS BEEN ALTERED FOR OPENJSGRID
					// normally you would just return the el. but in this case, we change the el
					$ret.push(el.instance.el);
				}
				
				return $ret;
				
				//return $ret;
			}	
		}
	};
	
	// jquery helper
	$.fn._on = function(type,sel,method,scope) {
		if(!scope) {
			scope = method;
			method = sel;
			sel = undefined;
		}
		var fn = function(e) { method.call(scope, e, this); }
		sel ? $(this).on(type,sel, fn) : $(this).on(type,fn);
		return this;
	}
	
	
	
	
	
})(jQuery,this,document)
