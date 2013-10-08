// Open JS Grid Version 2
// Requires RootJS

var grids = [];
(function($) {

	/* TODO
		textarea type
		per row editing
		adding
		multigrids
		row-highlight
		
		added columns should not take a function for value, should use the cellTypes array
		
	*/
	
	
	/*
		So you guys know, RootJS is a thing I've been working on for a while, it makes writing OOP code super easy
		Root.jQueryPlugin uses that to make any RootJS object a jquery plugin.  What that means is that when you define
		and object like I have below, You get the following functionality.
		$(selector).plugin()
		$(selector).plugin({object of options})
		$(selector).plugin("method")
		$(selector).plugin("method","param1","param2")
		$(selector).plugin("property")
		$(selector).plugin("property","value")
	*/
	window.Grid = Root.jQueryPlugin("grid",{
		
		// default settable options
		opts : {
			title : "",					// title attribute on this table
			action : "",				// action url on this table		
			nRowsShowing : 10,			// number of rows to show on load
			minAllowedColWidth : 50,	// when auto sizing columns, they can't be less than this size
			minWidthForDynamicCols : 20,// dynamic cols, like row number and checkboxes have a smaller min width
			class : "",					// classes on this table
			showPager : true,
			deleting : false,
			deleteConfirm: true,
			checkboxes : false,
			rowNumbers : false,
			editing : false,
			width : "100%",
			rowHeight : null,			// this is null to start because if you dont use it, it doesn't loop through stylesheets
			page : 1
		},
		
		// public properties
		cols : "",		// comma list of columns to get data for
		columns : {},
		pager : null,
		toSave : [],
		
		// cell types
		// you can add your own here as well
		cellTypes : {
			"text": function(value, columnOpts, grid) {
				if(grid.opts.editing) {
					return {
						cellClass: "editable input",
						cellValue: "<input type='text' value='"+value+"'/>"
					}
				}
			},
			"date": function(value, columnOpts, grid) {
				if(grid.opts.editing) {
					return {
						cellClass: "editable input",
						cellValue: "<input class='datepicker' type='text' value='"+value+"'/>"
					}
				}
			},
			"checkbox": function(value, columnOpts, grid) {
				if(grid.opts.editing) {
					var checked = value == 1  ? "checked" : "";
					return {
						cellClass: "editable center",
						cellValue: "<input type='checkbox' "+checked+" value='"+value+"'/>"
					}
				}
			},
			"image": function(value, columnOpts, grid) {
				return {
					cellClass: "center",
					cellValue: "<img src='"+value+"'/>"
				}
			},
			"money": function(value, columnOpts, grid) {
				return {
					cellClass: "",
					cellValue: "$"+value
				}
			},
			"select" : function(value, columnOpts, grid) {
				var select = grid.selects[columnOpts.col],
					options = "";
				for(i in select) {
					if(value == i) {
						options += "<option selected value='"+i+"'>"+select[i]+"</option>";
					} else {
						options += "<option value='"+i+"'>"+select[i]+"</option>";
					}
				}
				
				return {
					cellClass: "editable input select",
					cellValue: "<select>"+options+"</select>"
				}
			}
		},
		
		// internal properties
		sbWidth : 0,
		start : 0,
		end : 0,
		totalRows : 0,
		aColumnHeight :0,
		gridHeight : 0,
		$columns : null,
		$cols : null,
		firstLoad : true,
		_stopColumnDrag : false,
		
		// *********************************************************************************
		// *********************************************************************************
		// ** PRIVATE METHODS
		// *********************************************************************************
		// *********************************************************************************

		_construct : function() {
			
			// NOTE: anything done in here will only ever be done when the grid is first created
			var $table = $(this.el);
			
			// wrap the table with a div called columns. Jquery wrap doesnt work
			var $columns = $("<div class='columns'></div>");
			
			// wrap the columns with a div called gridWrapper. Jquery wrap doesnt work
			// this will be our main html element
			var $wrapper = $("<div class='gridWrapper'><span class='gridLoading'>Loading</span></div>");
			$wrapper.insertAfter($table)
					.append($columns)
					.width(this.opts.width);
			
			// add classes from opts
			if(this.opts.class) {
				$wrapper.addClass(this.opts.class);
			}
			
			// its cheaper to alter the stylesheet via JS instead of each cell after load
			if(this.opts.rowHeight) {
				var ss = document.styleSheets;
				for(var i=0;i<ss.length;i++) {
					if(ss[i].title == "openJsGrid") {
						for(var j=0;j<ss[i].rules.length;j++) {
							var r = ss[i].rules[j];
							if(r.selectorText == "div.gridWrapper .columns .cell") {
								r.style.height = this.opts.rowHeight + "px";
							}
							// and this doesn't really need to be here could be in JS
							// this probably should read the padding so it knows what to add
							if(r.selectorText == "div.gridWrapper .columns .cell:nth-child(2)") {
								r.style.marginTop = this.opts.rowHeight + 15 + "px";
							}
						}
					}
				}
			}
			
			// reset our elemeng to the new wrapper, and restore the instance on the DOM
			this.el = $wrapper[0];
			this.el.instance = this;
			
			// lets add our grid resizer block
			$wrapper.append("<div class='gridResizer'></div>");
			
			var self = this,
				$grid = $(this.el),
				table = $table[0],
				$ths = $table.find("th");
			
			// so we can access all grids from the outside
			window.grids.push(this);
			
			// lets take the attributes from the table element and store them
			this._attrsToProps(table,this.opts);
			
			// take the columns you want and store them in a comma sep list (easy to send to ajax)
			this.cols = $table.find("th").map(function() {return $(this).attr("col")}).get().join(",");
			
			// define this object on THIS instance
			this.columns = {};
			
			// loop through THs and store properties in an object
			for(var i=0;i<=$ths.length;i++) {
				if($ths.eq(i).length) {
					var $col = $ths.eq(i),
						col = $col[0],
						colName = col.getAttribute("col");
					this.columns[colName] = {header : $col.text()};
					this._attrsToProps(col,this.columns[colName]);
				}
			}
			
			// we dont need no damn tables
			$table.remove();
			
			// store some stuff we need
			this.sbWidth = this._calculateScrollbarWidth();
			
			// add the touch class if we have a touch devince
			!!('ontouchstart' in window) && $grid.addClass("touch");

			// call the load when the object is built
			this.load();
			
			
			//////////// EVENTS
			
			
			// save event
			if(this.opts.editing) {
				$grid._on("click",".gridSave:not(.disabled)", self.saveRow, self);
				$grid.on("click",".gridSave.disabled", function(){ return false });
        	
				// as you type, keep the object up to date
        		$grid._on("keyup",".cell :input", self.markForSaving, self);
        		
        		// datepicker choose (datepicker is optional)
        		$grid._on("change",".cell :input.datepicker", self.markForSaving, self);
        		
        		// datepicker choose (datepicker is optional)
        		$grid._on("change",".cell select", self.markForSaving, self);
        	}
        	
        	// add custom cell types if needed
        	if(this.opts.cellTypes) {
        		this.extend(this.cellTypes,this.opts.cellTypes);
        	}
        	
        	// as you type, keep the object up to date
        	$grid._on("click",".cell", self._handleCellClick, self);
			
			// checkbox saving
			$grid._on("click",".cell :checkbox", self.markForSaving, self);
			
			// as you type, keep the object up to date
        	$grid._on("click",".headerCell", self.sort, self);
        	
        	// row hover
        	//$grid._on("mouseover",".cell[data-row]",self.rowHover,self);
        	//$grid._on("mouseout" ,".cell[data-row]",self.rowHoverOut,self);
        	
        	// grid resizer
        	$grid._on("mousedown",".gridResizer", self._gridResize, self);
        	
        	// col resizers
        	var rs = ".headerCell .resizer";
        	$grid._on("mousedown", rs, self._columnResize, self).on("click",rs, function(e) {
        		// stop the header cell from being clicked
        		e.stopPropagation();
        	});
        	
        	// delete button
        	if(this.opts.deleting) {
        		$grid._on("click","button.gridDeleteRow", self.deleteRow, self);
        	}
		},
		
		
		/*******
			
			I think this function is finally done.  No matter what your table padding, border,
			cell padding, cell border, whatever, scrollbars or not. The math should always make it perfect
			honestly, many days went into this math, and i'm quite proud of it. The whole grid comes down to this
			function, and it being fast. Trying to optimize this as much as possible
		
		*******/
		_equalize : function(amt) {
			var $grid = $(this.el),										// our grid
				$columns = this.$columns,								// single columns container
				$cols = this.$cols,										// collection of each column
				nCols = $cols.length,									// how many columns
				totalNCols = nCols,
				gridHeight = this.gridHeight,							// height of the grid
				sbWidth = this.sbWidth,									// scrollbar width
				minAllowedColWidth = this.opts.minAllowedColWidth,		// minium allowed width for columns		
				needsScrollbar = this.aColumnHeight > gridHeight,		// if 1 column height is > grid height, we need to account for scrollbar
				sbWidth = needsScrollbar ? sbWidth : 0,					// use sbwidth or 0 if we needed a scroll bar
				columns = this.columns,									// our columns object
				colName, col, i, name, customWidth, colwidth;			// extra vars
			
				var originalWidth = $grid.width();						// current width of the grid
				this.fullWidth = originalWidth - sbWidth;	 			// adjust width to scrollbar so we know how much space to fill
				var playWidth = this.fullWidth;							// playWidth is how much space minus set widths do we have
				
			// adjust number of columns and full width to reflect manually set widths
			for(colName in columns) {
				col = columns[colName];
				if("width" in col) {
					if(playWidth - parseInt(col.width) > minAllowedColWidth) { 
						// adjust width for custom width cells
						playWidth -= parseInt(col.width);
						// no longer count this cell
						nCols--;
					}
				}
			}

			for(i=0, l = $cols.length; i<l; i++) {
				col = $cols[i];
				name = col.getAttribute("col");
				
				// bool if we have a customWidth or not
				customWidth = "width" in this.columns[name];
				
				// test pct here
				
				// if we have a custom width, use that, otherwise, figure it out based on fullWidth / nCols
				colWidth = customWidth ? parseInt(columns[name].width) : playWidth / nCols;
				
				// meh
				if(i == l-1) colWidth -= 1;
				
				// apply the width to that column
				col.style.width = colWidth + "px";
					
			}
			
		},
		
		// resize event for each column
		_columnResize : function(e,el) {
			var self = this,
				$grid = $(self.el),
				customWidth, minSpace, i, l, maxWidth, minWidth,
				startX = e.clientX,
    			$cell = $(el).parent(),
    			cell = $cell[0],
    			colName = cell.getAttribute("col"),
    			colOpts = this.columns[colName];

    		// prevent selections
	    	$grid.addClass("resizing");
    		
    		// store this so we dont have to access the dom anymore
    		colOpts.width = $cell.width();
    		
    		// figure out the max this column can go
    		$cols = this.$cols;
    		minSpace = 0;
    		for(i=0, l = $cols.length; i<l; i++) {
				col = $cols[i];
				name = col.getAttribute("col");
				// ingore the column were about to resize
				if(name != colName) {
					customWidth = "width" in this.columns[name];
					// continue adding up the space the other columns take up
					minSpace += customWidth ? parseInt(this.columns[name].width) : parseInt(this.opts.minAllowedColWidth);
				}	
			}
			
			// determine min and max width for this column
			maxWidth = this.fullWidth - minSpace;
			minWidth = ("dynamic" in colOpts) ? this.opts.minWidthForDynamicCols : this.opts.minAllowedColWidth;

    		// COLUMN RESIZING
    		$(document).bind("mouseup.grid",function() {
    			$(document).unbind("mousemove.grid");
    			$grid.removeClass("resizing");
    			self._equalize();
    		});
    		
    		$cols = this.$cols, l = this.$cols.length;
    		$(document).bind("mousemove.grid",function(e) {
    			// width to be
    			var amt = (e.clientX - startX);
    			// make sure we're within our rights
				if(colOpts.width + amt < maxWidth && colOpts.width + amt > minWidth) {
					// change the width
					colOpts.width += amt;
					// adjust the header cell width so it can affect the others
					startX = e.clientX;
					// adjust the rest, except the header cell
					self._equalize();
				}
    		});
		},
		
		// resize method for the entire grid
		_gridResize: function(e,el) {
			// starting pos
    		var self = this,
    			startX = e.clientX;
    			$grid = $(self.el);
    		
    		// turn off selection while resizing
    		$grid.addClass("resizing");
    		
    		$(document).bind("mouseup.grid",function() {
    			$(document).unbind("mousemove.grid");
    			$grid.removeClass("resizing");
    			self._equalize();
    		});
    		
    		$(document).bind("mousemove.grid",function(e) {
    			$grid.width( $grid.width() + (e.clientX - startX) );
				// adjust the header cell width so it can affect the others
				startX = e.clientX;
				// if the width is tiny, add the small class
				if($grid.width() < 600) {
					 $grid.addClass("small");
					 self.pager.slider.update();
				} else if($grid.hasClass("small")) {
					$grid.removeClass("small");
					self.pager.slider.update();
				}
				// adjust the rest, except the header cell
				self._equalize();
    		});
		},
		
		// often will be the case that browsers have different scrollbars
		// this trick calculates that size
		_calculateScrollbarWidth : function() {
			var div = $('<div><div style="height:100px;"></div></div>').css({
				width:50,
				height:50,
				overflow:"hidden",
				position:"absolute",
				top:-200,
				left:-200
			});
			$('body').append(div); 
			var w1 = $('div', div).innerWidth(); 
			div.css('overflow-y', 'auto'); 
			var w2 = $('div', div).innerWidth(); 
			$(div).remove(); 
			var scrollbarWidth = (w1 - w2);
			return scrollbarWidth;
		},
	
	
		_attrsToProps : function(el,obj) {
			// takes all the attributes on some dom element and stores them 
			// as properties onto some other object
			// im making this a method, cuz we will need to do this again for THs
			var attrs = el.attributes;
			for(var i=0, l=attrs.length; i<l;  i++ ) {
				obj[attrs[i].name] = attrs[i].value;
			}
			return obj;
		},
		
		// after load is done, we do these things
		_afterLoad : function() {
			var self = this,
				$grid = $(this.el);
			
			// call to create the pager
			if(!this.pager) {
				this.pager = Pager.inherit({grid : this});
			} else {
				this.pager.update();
			}
			
			/////////////////////////
			// ADD CHECKBOX COLUMN
			////////////////////////
			if(this.opts.checkboxes) {
				// add the column with a width
				var $checkboxCol = this.addColumn("Checks", {
					width: 35, 
					insertAt: 0, 
					header : "&nbsp;",
					cellClass : "center"
				}, function(i) {
					return "<input class='rowCheck' type='checkbox'/>";
				})
			}
			
			/////////////////////////
			// ADD ROW NUMBER COLUMN
			////////////////////////
			if(this.opts.rowNumbers && !Array.isArray(this.rows)) {
				// add the column with a width
				var $newCol = this.addColumn("rowNumbers", {
					width: 35, 
					insertAt: 0, 
					header : "&nbsp;",
					cellClass : "center"
				}, function(i) {
					return i + self.start;
				})
			}
			
			/////////////////////////
			// ADD DATEPICKER STUFF
			////////////////////////
			if($.datepicker && $(".datepicker").length) {
				$(".datepicker").datepicker({dateFormat: "yy-mm-dd"});
			}
			
			/////////////////////////
			// ADD DELETE BUTTON COLUMN
			////////////////////////
			if(this.opts.deleting && !Array.isArray(this.rows)) {
				
				// add the column with a width
				var $deleteCol = this.addColumn("Delete", {width: 65, cellClass : "center"}, function() {
					return self._render("deleteButton")();
				})
			}
			
			/////////////////////////
			// ADD SORTABLE BAR THING
			////////////////////////
			var $sortBar = $(this.el).find(".headerCell[col='"+this.opts.orderBy+"']").find(".sortbar").show();
			if(this.opts.sort == "desc") $sortBar.addClass("desc");
			
			/////////////////////////
			// SET THE BLANK CELL HEIGHT TO MATCH
			////////////////////////
			var headerHeight = $grid.find(".headerCell:first").height();
			$grid.find(".blankCell").css({
				height: headerHeight
			});
			
			// what happens after ajax, stays after ajax.
			this._cacheSize();
			this._equalize();
			
			// were done loading, close the notification
			self.loadingDialog.close();
			
			if($grid.width() < 600) {
				 $grid.addClass("small");
				 self.pager.slider.update();
			} else if($grid.hasClass("small")) {
				$grid.removeClass("small");
				self.pager.slider.update();
			}
			
			// mark first load
			this.firstLoad = false;

		},
		
		// stores up the current size and variables for equalize
		// only call this to recache
		// dont call this if the grid is gonna reload, itll get called anyway
		_cacheSize : function() {
			var $grid = $(this.el);
			this.$columns = $grid.children(".columns");
			this.$cols = this.$columns.children(".col");
			this.aColumnHeight = this.$columns.children(".col:first").height();
			this.gridHeight = $grid.height();
			
		},
		
		// because there is no true concept of a row,
		// we need to run this call both rowClick and cellClick
		_handleCellClick : function(e,el) {
			var id = el.getAttribute("data-row"),
				rowData= this.rows["_"+id];
			// row check
			if($(e.target).hasClass("rowCheck")) {
				$(this.el).trigger("rowCheck", [$(e.target),rowData]);
			}
			// trigger cell click
			$(this.el).trigger("cellClick", [$(el),rowData]);
			// trigger row click
			$rows = this.getRow(id);
			// this isn't sending the array?
			$(this.el).trigger("rowClick", [$rows,rowData]);
		},
		
		// template render
		_render : function (template) {
			var self = this;
	        return function (data) {
	        	//  Caches the template so that it may be manipulated.
	        	// allows {!{ syntax for use with other template engines
	        	var temple, regex = /{!?{([\w\.]+)}}/g;
	        	
	            // use template as string if its not defined
	            if(typeof self._templates[template] == "undefined") {
	            	temple = template;
	            
	            // use pre defined template
	            } else {
		            temple = self._templates[template];
		        }
		        
	            // template replacement
	            temple = temple.replace(regex, function(match, $1) { return data[$1] });
	            //  Get rid of any remaining, unused variables before returning.
	            return temple.replace(regex, '');
	        };
	    },
	    
		// html templates
		_templates : {
			deleteButton : "<button class='gridDeleteRow btn btn-mini'>X</button>",
			cell : "<div class='cell {{cl}} grid-row-{{id}}' data-row='{{id}}' data-col='{{col}}'>{{val}}</div>",
			columnHeader : ""+
				"<div class='cell headerCell' col='{{col}}'>\
					<span>{{header}}</span>\
					<div class='resizer'></div>\
					<div class='sortbar'>&#9662;</div>\
				</div>\
				<!--<div class='cell blankCell' col='{{col}}'>Blank</div>-->\
			",
			confirm : ""+
				"<div class='dialog gridConfirm'>\
					<span>{{msg}}</span>\
					<div class='buttons'>\
						<button class='btn confirmOk'>OK</button>\
						<button class='btn cancel'>Cancel</button>\
					</div>\
				</div>\
			",
			alert : ""+
				"<div class='dialog gridAlert {{type}}'>\
					<span class='label label-{{type}}'>{{title}}</span>\
					<span class='body'>{{msg}}</span>\
					<div class='buttons'>\
						<button class='btn cancel'>OK</button>\
					</div>\
				</div>\
			",
			notify : ""+
				"<div class='dialog gridNotify'>\
					<span class='body'>{{msg}}</span>\
				</div>\
			",
			pager : ""+
				"<div class='pagination left'>\
				  <ul>\
				  	<li class='disabled'>\
				  		<a href='#' class='pager_showing'>showing \
				  			<span class='pager_lower_limit'>{{start}}</span> - \
				  			<span class='pager_upper_limit'>{{end}}</span>\
				  		</a></li>\
				    <li class='gridPrev'><a href='#'>Prev</a></li>\
				    <li class='gridNext'><a href='#'>Next</a></li>\
				    <li class='slider'><span class='sliderSpan'>\
				    	<div class='slider'>\
				    		<div class='sliderTrack'></div>\
				    		<div class='sliderThumb'></div>\
				    	</div>\
				    </span>\
				    <li class='currentPage'><input type='text' value='{{page}}'/></li>\
				    <li class='search icon'><input type='text' value='{{search}}'/></li>\
				  </ul>\
				</div>\
				<div class='right'>\
					<a class='disabled gridSave btn btn-primary' href='#'>Save</a>\
				</div>\
			"
		},
		
		// *********************************************************************************
		// *********************************************************************************
		// ** PUBLIC METHODS
		// *********************************************************************************
		// *********************************************************************************
		
		// IDEA - ONLY EVER KEEP 30 ROWS ON THE DOM, REMOVE TOP AND BOTTOM ROWS AND STORE IN MEMORY
		// ONLY CREATE 30 ROWS AT A TIME, NEVER MORE. FILTERING IS ALREADY DONE ON MEMORY, BUT WOULD NEED
		// TO ADD BACK ROWS THAT ARE IN MEMORY AND NOT IN THE DOM, SHOULD BE EASY.
		
		// public methods
		load : function(opts) {
			var self = this, packet, promise, rowHtml = "", colHtml = "", 
				col = 0, key = 0, pKey, rowCol = 0, cellValue, checked = 0,
				cellClass = "", type;
	
			// if we are reloading with options pass them in
			// if(opts) this.grid(opts);
			if(opts) this.opts = this.extend(this.opts,opts);
			
			// register loadStart callback
			$(this.el).trigger("loadStart");
			
			// we have some more data than in this.opts that we wanna send to ajax
			packet = $.extend({
				cols : this.cols
			},this.opts);
			
			// cache the el because self.el changes some where?
			var el = self.el
			var cellTypes = self.cellTypes;
			
			// show loading box
			this.loadingDialog = this.notify("Loading");

			/////////////////////////
			// LOAD SELECT BOXES
			////////////////////////
			var selCol, colName, selectCols = [], selectPromise = $.Deferred();
			for(colName in this.columns) {
				selCol = this.columns[colName];
				if(typeof selCol.type != "undefined" && selCol.type == "select") {
					selectCols.push(colName);
				}
			}
			// get all the drop downs, store the promise in case we wanna check this
			if(selectCols.length && !self.selects) {
				selectPromise = $.post(this.opts.action,{select : true, cols : selectCols},function(data) {
					// by saving the data, we dont ever have to do this ajax call again til page reload
					self.selects = data;
					return true;
				});
			} else {
				selectPromise.resolve();
			}

			
			promise = $.post(this.opts.action,packet,function(data) {
				self.el = el;	// fixes some problem i dont know :(
				self.cellTypes = cellTypes;
				var $grid = $(self.el),
					$columns = $grid.find(".columns");
				
				// store some data we got back
				self.totalRows = data.nRows;
				self.start = data.start;
				self.end = Math.min(data.end,data.nRows);
				self.saveable = data.saveable;

				self.opts.orderBy = data.order_by;
				self.opts.sort = data.sort;
				
				// were gonna build the table in a string, then append it
				// this is 1000000x times faster than dom manipulation
				self.rows = data.rows;
				
				// when our ajax is done, move on.
				selectPromise.done(function() {
					
					// it will be an object if it has data
					if(!Array.isArray(data.rows)) {
					
						// build the table in column form, instead of row form
						for(col in self.columns) {
							
							// options on the column
							colOpts = self.columns[col];
							
							// opening col div
							colHtml += "<div class='col _"+(colOpts.type || '')+"' col='"+col+"'>";
							
							// blank cells mess things up
							if(colOpts.header == "") colOpts.header = "&nbsp;"
							
							// add header cell with resizer, sortable bar and blank cell
							// this is only the header and not the whole column because we want the ability
							// to keep adding strings to the return for speed
							colHtml +=  self._render("columnHeader")(colOpts);
							
							for(key in data.rows) {
								pkey = key.substr(1);
								row = data.rows[key];
								for(rowCol in row) {
									if(rowCol === col) {
										
										// main value
										cellValue = row[col],
										cellClass = "";
										
										// setup some types
										if(typeof self.cellTypes[colOpts.type] == "function") {
								
											typeOpts = self.cellTypes[colOpts.type](cellValue,colOpts,self);
											
											// protect a no return
											if(typeof typeOpts == "undefined") typeOpts = {cellValue : cellValue,cellClass: ""};
				
											cellValue = typeOpts.cellValue;
											cellClass = typeOpts.cellClass;
										}
		
										
										// empty cells kinda mess with things
										if(cellValue == "") cellValue = "&nbsp;";
											
										// add linking
										// this is not a type because you can link anything by adding href
										if(colOpts.href) {
											// make some tokens for use in the href
											var linkTokens = {value : cellValue}
											// add all the column values, column.Title i.e.
											for(var aCol in row) linkTokens["columns."+aCol] = row[aCol];
											// render the href with the tokens
											var href = self._render(colOpts.href)(linkTokens);
											// wrap the cell value in an a tag with the rendered href 
											cellValue = "<a href='"+href+"'>"+cellValue+"</a>";
										}
										
										// create the cell from template
										colHtml += self._render("cell")({
											cl : cellClass,
											id : pkey,
											col : col, 
											val : cellValue
										});
									}
								}
							}
			
							colHtml += "</div>";
						}
					} else {
						colHtml = "No Rows";
					}
					
					// hide our loading
					$grid.find(".gridLoading").hide();
					
					// place all the content
					$columns.html(colHtml);
									
					// do things after ajax
					self._afterLoad();
					
					// register loadComplate Callback
					$(self.el).trigger("loadComplete",self);
				
				});

			},"json");
			
			return promise;
		},
		
		// [none | success | warning | important | info | inverse]
		// helper dialog alert function
		alert : function(type, title, msg) {
			return Dialog.inherit({
				tmpl : "alert",
				type: type, 
				title: title,
				msg : msg,
				grid: this
			}).show();
		},
		
		// helper dialog notify method
		notify : function(msg, ms) {
			var self = this;
			// our opts
			var opts = {msg:msg, grid:this};
			// if we wanted a timer
			if(ms) opts.autoFadeTimer = ms;
			// create and show
			return Dialog.inherit(opts).show();
		},
		
		
		// shortcut error function
		error : function(msg) {
			return this.alert("important", "Error!", msg);
		},
		
		// a confrim dialog box
		confirm : function(msg, callback) {
			var $grid = $(this.el);
			var dialog = Dialog.inherit({
				tmpl : "confirm",
				msg : msg,
				grid : this
			}).show();
			
			// add our confirm ok
			dialog.$dialog.one("click",".confirmOk",callback);
			
			return dialog;
		},
		
		// debouncing the typing
		_filter : function(e,el) {
			var self = this,
				$el = $(el);
			// store on pager
			this.pager.query = $el.val();
			// start typing timer
			clearTimeout(this.debounce);
			this.debounce = setTimeout(function() {
				self.filter( $el.val() )
			},150);
		},
		
		// finds matches in the dom as fast as i know how
		// do intelligent searches with column:
		// right click a column header and choose "search on" which would fill out the search filter
		filter : function(val) {
			var $grid = $(this.el),
				$all = $grid.find("[data-row]"),
				$cols = $grid.find(".col");
				
			if(val) {
				var matches = [],
					val = val.toLowerCase();
				for(id in this.rows) {
					var row = this.rows[id],
						id = id.substring(1);
					for(key in row) {
						var string = row[key].toLowerCase();
						if(~string.indexOf(val) && !~matches.indexOf(id)) matches.push(id);
					}
				}
				
				$all.hide();
				$all.removeClass("topMargin");

				if(matches.length) {
					$(".cell.temp").remove();
					for(i=0;i<matches.length;i++) {
						// test with jsperf
						$grid.find(".grid-row-"+matches[i]).show();
					}
					// because the css for nth-child(2) isn't math accurate anymore with hidden rows
					// we need to find the nth-child(2) ourselves for search results. But we keep the css when all are showing
					// since thats the most  used case
					$cols.find(".cell:visible:eq(1)").addClass("topMargin");
				} else {
					$cols.append("<div class='cell temp'>&nbsp;</div>");
				}
			} else {
				$all.show();
				$all.removeClass("topMargin");
			}
			// we need to recache the scroll height account for scrollbars
			
			//this.scrollHeight = $grid.find(".columns")[0].scrollHeight;
			this.aColumnHeight = $grid.children(".columns").children(".col:first").height();
			this._equalize();
		},
		
		// adds a column with options to the grid
		// runs a function on the value so you can pass in as it builds
		// opts : {width, insertAt, cellClass}
		addColumn : function(col, opts, fn) {
			
			// if it already exists delete it
			if(this.colExists(col)) {
				$(this.el).find(".col[col='"+col+"']").remove();
			}
			
			// create the new column from template
			var newCol = "<div class='col dynamic' col='"+col+"'>",
				$newCol,pkey;
			
			// column header stuff
			var header = opts.header || col;
			newCol += this._render("columnHeader")({col : col, header : header});
			
			// if the value fn wasn't passed, use blank
			if(typeof fn != "function") fn = function(i) { return "&nbsp;" }

			// add in rows;
			var i = 0;
			for(key in this.rows) {
				pkey = key.substr(1);
				newCol += this._render("cell")({
					cl : opts.cellClass || "",
					id : pkey,
					col : col,
					val : fn(i, this.rows[key])
				});
				i++;
				
			}
			// cap off our col
			newCol += "</div>";
			 
			// DOMit
			$newCol = $(newCol);
			
			// add to the DOM
			this._insertCol($newCol,opts.insertAt);
			
			// note that this is dynamically added
			opts.dynamic = true;
			
			// if we passed in options, add those to the columns object
			this.columns[col] = opts;
			
			// resize with our new column
			this._cacheSize();
			this._equalize();
			
			// return new col
			return $newCol;

		},
		
		/*
		addRow : function() {
			var $grid = $(this.el),
				$cols = $grid.find(".col"),
				i = 0,
				col = null,
				$col = null,
				$cell = null;
			
			for(i=0; i<$cols.length; i++) {
				col = $cols[i],
				colName = col.getAttribute("col"),
				$col = $(col),
				$cell = $col.find(".cell:eq(2)");
				
				//var $new = $(this._render("cell")({
				//	cl : "level2",
				//	id : 0,
				//	col : colName, 
				//	val : "&nbsp;"
				//}));
				
				
				//$new.insertAfter($cell);
				
			}
			
			
			
			// insert new div in first col
			//var $cell = $grid.find(".col:first").find(".cell.level2");
			//$cell
			//.css("overflow","none")
			//.html("<div class='level2Grid'></div");
			
		},*/
		
		// insets a column at an index
		_insertCol : function($col,i) {
			// beginning
			if(i === 0 || i == "start") {
				$(this.el).find(".columns").prepend($col);
			// end
			} else if(!i || i == "end") {
				$(this.el).find(".columns").append($col);     
			// somewhere
			} else if(typeof i == "number"){
				$(this.el).find(".columns > .col:nth-child(" + ++i + ")").before($col);
			} else {
				if(typeof this.columns[i] != "undefined") {
					var k = 0, j;
					// find the index of this column
					for(j in this.columns) { k++; if(j === i) break };
					// insert at that column
					this._insertCol($col,k);
				} else {
					console.log("Trying to inserter after column ["+i+"], not found, inserting at end");
					this._insertCol($col);
				}
			}
		},
		
		// bool if a column exists or not
		colExists : function(col) {
			return !(typeof this.columns[col] == "undefined");
		},
		
		/*
		cellClick : function($cell) {
			var $tr = $cell.closest("tr"),
				tr = $tr[0],
				id = tr.getAttribute("data-row"),
			rowData= this.rows["_"+id];
			$(this.el).trigger("cellClick", $cell);
		},
		
		rowClick : function($cells) {
			$(this.el).trigger("rowClick", $cells);
		},
		*/
		
		// returns a jQuery object of cells from the passed column
		getCells : function(col) {
			if(typeof col == "string") {
				return $(this.el).find("[col='"+col+"'].cell:not(.headerCell)");
			} else {
				return col.find(".cell:not(.headerCell)");
			}
		},
		
		// gets all the cells from a given row id
		getRow : function(id) {
			return $(this.el).find(".grid-row-"+id);
		},
		
		getRowData: function(id) {
			return this.rows["_"+id];
		},
		
		// when you hover a row
		rowHover : function(e,el) {
			var id = el.getAttribute("data-row");
			$(this.getRow(id)).addClass("row-hover");
		},
		
		// row mouse out
		rowHoverOut : function(e,el) {
			var id = el.getAttribute("data-row");
			$(this.getRow(id)).removeClass("row-hover");
		},
		
		deleteRow : function(e,el) {
			e.preventDefault();
			var self = this,
				$cell = $(el).closest(".cell"),
				id = $cell[0].getAttribute("data-row");
			
			this.confirm("Are you sure you want to delete?", function() {
				$.post(self.opts.action, {delete:true,id:id}, function(success) {
					if(success) {
						// function for timeout
						var fadeRow = function() {
							$(self.el).find(".grid-row-"+id).remove();
							
							// don't pop this up unless they pass it in
							if(self.opts.deleteConfirm) {
								self.alert("info", "Deleted!", "Row "+id+" has been deleted");
							}
						}
						// fade this row out
						$(self.el).find(".grid-row-"+id).fadeOut(500);
						// after the fade, remove the row, dont do this in the callback, it will call many times
						setTimeout(fadeRow,500);
						
						var rowData = self.rows["_"+id];
						$(self.el).trigger("rowDelete",[self.getRow(id), rowData]);
						
					} else {
						self.error("Failed to delete");
					}
				});
			});
		},
		
		// save
		saveRow : function(e,el) {
			e.preventDefault();
			var self = this, i, rows = {};
			
			// get the rows we need from the rows object
			var pkeys = [];
			for(i=0; i< this.toSave.length; i++) {
				var pkey = this.toSave[i]
				rows[pkey] = this.rows["_"+pkey];
				pkeys.push(pkey);
			}

			// post save
			$.post(this.opts.action,{ 
				save : true, 
				json : rows,
				saveable : self.saveable
			}, function(res) {
				if(res == 1) {
					self.alert("info","Saved!",i + " Row(s) saved");
					$(self.el).trigger("save",rows[pkey],res);
				} else {
					self.error(res);
					$(self.el).trigger("saveFail",rows[pkey],res);
				}	
							
			});
		},
		
		sort : function(e,el) {

			// hide all sortbars
			$(this.el).find(".sortbar").hide();
			
			// toggle sort and store value
			var $sortbar = $(el).find(".sortbar"),
				col = el.getAttribute("col"),
				sort = $sortbar.show().toggleClass("desc").hasClass("desc") ? "desc" : "asc";
			
			// get possible columns to sort on
			var sortable = this.cols.split(",");
			// dont sort on columns that are dynamic
			if($.inArray(col,sortable) != -1) {
			
				// load the grid with new sorting
				this.load({ sort : sort, orderBy : col });
			};
		},
		
		// updates the row (should be called as you type)
		markForSaving : function(e,el) {
			
			// make sure the save is visible
			$(this.el).find(".gridSave").removeClass("disabled");
			
			// get our row col and val
			var div = $(el).closest(".cell")[0],
				col = div.getAttribute("data-col"),
				row = div.getAttribute("data-row")
				val = el.value;
			
			// checkboxes dont need value, they need checked
			if($(el).is(":checkbox")) val = ~~el.checked;
			
			// set the value on the object
			this.rows["_"+row][col] = val;

			// add the row if its not there
			if(!~this.toSave.indexOf(row)) this.toSave.push(row);
		}
	});
	
	var Dialog = Root.inherit({
		type : "notify",
		tmpl : "notify",
		title : "",
		msg : "",
		grid : null,
		autoFadeTimer : false,
		blur : true,
		$dialog : null,
		_timer : 200, // match the css fade
		_construct : function() {
			// our grid el
			var $grid = $(this.grid.el), self = this;
			// render the type to our templates
			this.$dialog = $(this.grid._render(this.tmpl)(this));
			// if our dialog has a button, add an event
			this.$dialog.find(".cancel,.confirmOk").one("click",function(e) {
				e.preventDefault();
				self.close();
			});
			// add to our grid
			$grid.append(this.$dialog);
		},
		show : function() {
			// our grid el
			var $grid = $(this.grid.el), self = this;
			// blur the bg if needed
			if(this.blur) $grid.find(".columns").addClass("blur");
			// show this guy
			setTimeout(function() {
				self.$dialog.addClass("show");
			},50);
			// setup for auto fade timer
			if(this.autoFadeTimer) {
				setTimeout(function() {
					self.close();
				},this.autoFadeTimer);
			}
			// return
			return this;
		},
		close : function() {
			var self = this, $grid = $(this.grid.el);
			// fade out
			this.$dialog.removeClass("show");
			// blur out
			if(this.blur) $grid.find(".columns").removeClass("blur");
			// kill the element after x time
			setTimeout(function() {
				// remove the element
				self.$dialog.remove();
			},this._timer);
			// return 
			return this;
		}
	});
	
	var Slider = Root.inherit({
		thumb : null,
		pager : null,
		min : 0,
		max : 100,
		val : 0,
		startX : 0,
		_construct : function() {
			this.onMove = $(this.pager.grid.el).hasClass("touch") ? "touchmove" : "mousemove";
			this.onStart = $(this.pager.grid.el).hasClass("touch") ? "touchstart" : "mousedown";
			this.onEnd = $(this.pager.grid.el).hasClass("touch") ? "touchend" : "mouseup";
			// mouse down start
			$(this.pager.el)._on(this.onStart, ".sliderThumb",this.start, this);
		},
		// since the pager is reconstructed each time, we need to update the DOM elements for slider
		update : function() {
			this.thumb = $(this.pager.el).find(".sliderThumb");
			this.setVal(this.pager.currentPage);
			this.max = this.pager.totalPages;
		},
		start : function(e,el) {
			
			// setup start
			this.startX = e.clientX || e.originalEvent.touches[0].clientX;
			
			// mouse move to slide
    		$(this.pager.el)._on(this.onMove+".slider",this.slide,this);
    		$(document)._on(this.onEnd+".slider",this.stop,this);	
		},
		stop : function() {
			// remove the mousemove
			$(this.pager.el).off(this.onMove+".slider");
			// remove the mousup
			$(document).off(this.onEnd+".slider");
			// go to page when stopped
			this.pager.goto(this.val);
		},
		setVal : function(val) {
			var $thumb = $(this.thumb),
				$track = $thumb.prev(),
				trackLength = $track.width() - $thumb.width();
			
			// intify val
			this.val = parseInt(val);
			// calculate pos
			var pos = (this.val * trackLength) / this.max;
			// dont let it go below 0
			if(pos < 0) pos = 0;
			// set the thumb
			$thumb.css("margin-left",pos);
		},
		slide : function (e,el) {
			var self = this;
			if(~["slider","sliderThumb","sliderSpan","sliderTrack"].indexOf(e.target.className)) {
				
				// touch fix
				e.clientX = e.clientX || e.originalEvent.touches[0].clientX;

    			// current left and new left
    			var $thumb = $(self.thumb),
    				mleft = parseFloat($thumb.css("margin-left")),
    				end = $thumb.prev().width() - $thumb.width();
    				pos = mleft + (e.clientX - this.startX);
				
				// protect upper edge
				if(pos >= end) {
					pos = end;
					self.val = this.max
				
				// protect the lower edge
				} else if(pos <= 0) {
					pos = 1;
					self.val = this.min;
				
				// all other cases
				} else {
					val = ~~((pos / end) * self.max);
					self.val = val || 1; // can't go to 0
				}
				
				
								
				// set the thumb
				$(self.thumb).css("margin-left",pos);
    			
    			// reset start x
    			this.startX = e.clientX;
    			
    			// input the val
    			$(this.pager.el).find(".currentPage input").val( self.val );
			}
		}
	})
	
	// the pager object
	var Pager = Root.inherit({
		el : null,
		grid : null,
		currentPage : 1,
		totalPages : 1,
		slider : null,
		query : "",
		_construct : function() {
			
			// call initial
			this.update();
			
		},
		
		update : function() {
			var self = this,
				grid = this.grid,
				$grid = $(grid.el),
				nRows = grid.totalRows,
				showing = grid.opts.nRowsShowing,
				nPages = Math.ceil(nRows / showing),
				page = parseInt(grid.opts.page),
				$pager = null;
			
			// store some vars
			this.currentPage = page;
			this.totalPages = nPages;
			
			// setup
			// for now, we do have to render the pager, just not show it
			var pagerHtml = grid._render("pager")({
				start : grid.start,
				end : Math.min(grid.end,nRows),
				nRows : nRows,
				nPages : nPages,
				page : page,
				nextPage : page + 1,
				secondToLastPage : nPages - 1,
				lastPage : nPages,
				search : this.query
			});

			// make it the first time
			if(!this.el) {
				// create the element
				$pager = $("<div class='gridPager fc'>"+pagerHtml+"</div>");
				$grid.append($pager);
				
				// set the element
				this.el = $pager[0];
				
				// setup slider
				var nRows = this.grid.totalRows,
					showing = this.grid.opts.nRowsShowing,
					nPages = Math.ceil(nRows / showing);
					
				this.slider = Slider.inherit({
					pager : this,
					thumb : $(this.el).find(".sliderThumb"),
					min : 1,
					max : nPages
				});
				
				// page events
				$pager._on('click','.gridNext', self.next, self);
				$pager._on('click','.gridPrev', self.prev, self);
				$pager._on('keyup','.currentPage input', self.pageEnter, self);
				$pager.on('click','.goto', function(e) {
					e.preventDefault();
					var page = $(this).attr("href").substr(1);
					self.goto.call(self,page);
				});
				
				// handle search icon thing
				$pager.on('blur','.search :input', function() {
					if($(this).val()) $(this).parent().removeClass("icon");
				})
				$pager.on('focus','.search :input', function() {
					$(this).parent().addClass("icon");
				});
				$pager.on('click','.search', function() {
					$(this).find(":input").focus();
				});
				// search back to the db
				$pager._on('keyup','.search :input',self.search, self);
				
				// live typing action is on grid not pager
				$pager._on('keyup','.search :input',self.grid._filter,self.grid);
				
			} else {
				// common var
				$pager = $(this.el);
				
				// replace our templated HTML
				$pager.html(pagerHtml);
				
				// check the search icon, if there is text we need it not be there
				if(this.query) {
					$pager.find(".search.icon").removeClass("icon");
				}
			}
			
			// start fresh
			$pager.find(".gridPrev, .gridNext").removeClass("disabled");
			
			// if the previous page is gonna be 1, disabled the button
			if(this.currentPage - 1 <= 0) {
				$pager.find(".gridPrev").addClass("disabled");
			}
			
			// if the previous page is gonna be 1, disabled the button
			if(this.currentPage + 1 > nPages) {
				$pager.find(".gridNext").addClass("disabled");
			}
			
			// update slider
			var self = this;
			this.slider.update();
			
			// do we need the pager part of the pager
			if(!grid.opts.editing) {
				$grid.find(".gridSave").hide();
			}
			
			// do we need the pager part of the pager
			if(!grid.opts.showPager) {
				$pager.find("div.pagination.left").hide();
			}
						
		},
		
		search : function(e,el) {
			if(e.keyCode == 13) {
				// search grid
				this.grid.load({ 	
					search : $(el).val(),
					page : 1
				});
				// remove the glass
				$(el).parent().removeClass("icon");
				// false
				return false;
			}
		},
		
		// hitting enter to go to a page
		pageEnter : function(e, el) {
			e.preventDefault();
			if(e.keyCode === 13) {
				this.goto( $(el).val() )
			}
		},	
		
		// pager go next
		next : function(e, el) {
			// because we want to chain, we prevenDefault instead of return false;
			e.preventDefault();
			if(!$(el).hasClass("disabled")) {
				// load the grid with one page forward
				this.grid.load({ page : ++this.currentPage });
			}
			// chain
			return this;
		},
		
		// pager go prev
		prev : function(e,el) {
			// because we want to chain, we prevenDefault instead of return false;
			e.preventDefault();
			if(!$(el).hasClass("disabled")) {
				// load the grid one page back
				this.grid.load({ page : --this.currentPage });
			}
			// chain
			return this;
		},
		
		// pager go
		goto : function(page) {
			// don't allow a page to be higher than total pages
			if(page > this.totalPages) page = this.totalPages;
			// if page is <1 make it 1
			if(page < 1) page = 1;
			// do load
			this.grid.load({ page : page });
			// set the sider
			this.slider.setVal(page);
			// chain
			return this;
		}
	});
	
})(jQuery);


String.prototype.has = function(search) {
	return (this.indexOf(search) !== -1);
}
