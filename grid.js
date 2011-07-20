/*

OpenJS Grid

Copyright (c) 2011 Sean Clark, http://square-bracket.com
http://youtube.com/optikalefxx
http://square-bracket.com/openjs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This is openGrid version 1.8

*/

$(function() {	
	
	/* to do
	
	subGrids
	
	*/
	
	
	// load / reload grid function
	$.fn.loadGrid = function(user_opts) {
		return this.each(function() {
			
			// setup DEFAULT options
			var opts = $.extend({
				order_by : "",			// sql order by
				sort : "DESC",			// sql sort by
				page:1,					// page to start on
				search:"",				// search term
				justSearched:false,		// used to allow searching to db without the filtering destorying fields that aren't on the grid
				nRowsShowing:5,			// how many rows to show
				resizable:true,			// is the grid resizable?
				resizableColumns:true,	// can the columns be resized?
				pager:true,				// show the pager?
				pagerLocation:"bottom",	// bottom|top|both
				saveLocation:"pager",	// pager|title|both
				refreshButton:false,	// show the refresh button
				dateRange:false,		// dateRange set to a column
				dateRangeFrom:"",		// dateRange start from
				dateRangeTo:"",			// dateRange start to
				stickyRows:true,		// can you dbl click to stick rows?		bug - cant edit a stuck row
				clickToSort:true,		// can you click to sort?
				inlineEditing:false,	// can you inline edit?
				showRowNumber:false,	// show row numbers on the left
				loadingMessage:"loading",// if blockUI is available, this is the message it will use
				maxLength :	false,		// weather to get max length data from the database or not
				width:"100%",			// width of the grid
				height:"auto",			// height of the grid
				maxHeight:500,			// max height of the grid
				fullScreen:false,		// full screenmode
				adding : false,			// adding on
				addButton:false,		// re route the add button
				linkTarget:"_blank",	// when making links, whats the target
				confirmBeforeSort:true, // weather to confirm sorting which will kill all unsaved changes
				deleting : false,		// deleting on
				deleteConfirm: false,	// set to a column name to use as a confirmation
				dateFormat:'yy-mm-dd',	// datepicker format - note requires jquery ui and datepicker
				pageSearchResults:true,	// weather to page search results or not
				columnOpts : null,		// options for each column (advanced stuff)
				rowClick : null,		// callback for clicking on a row
				rowAdd : null,			// callback as rows are being added to the grid NOT DONE
				cellAdd : null,			// callback as cells are being added to the grid NOT DONE
				beforeLoadStart:null,	// callback before loading starts
				loadStart:null,			// callback after load is done, but before all my stuff
				loadComplete:null,		// callback after load and after all my stuff
				saveSuccess:null,		// after succesfull save
				saveFail:null,			// after failed save
				deleteSuccess:null,		// after delete success
				deleteFail:null		// after delete fail
			},user_opts);
			
			// cache our man grid, this is the <table>
			var $grid = $(this);
			
			// wrap our grid in a div for individuality
			if(!$grid.parents(".gridWrapper").length) {
				var $gridContainer = $grid.wrap("<div class='gridContainer'>");
				$gridContainer.wrap("<div class='gridWrapper'>");
			}
			
			// extend your new options with the saved ones
			if($grid.data().page) {
				$.extend($grid.data(),user_opts);
			
			// if there are no saved options - use the default
			} else {
				$.each(opts,function(property,value) {
					// if we have a callback function, we can't store it in data
					// it will get executed right away
					if(typeof(value) != "function") {
						//$.data($grid,property,value);
						$grid.data(property,value);
					} else {
						// create pluginlett of custom callback
						$.fn[property] = value;
						//$.data($grid,property,true);
						$grid.data(property,true);
					}
				});
			}
			
			// set dimensions here
			$grid.parents(".gridContainer").width($grid.data().width);
			$grid.parents(".gridContainer").height($grid.data().height);
			$grid.parents(".gridWrapper").css("max-height",$grid.data().maxHeight);
			
			// if you got block ui, block with loading
			if($.blockUI) $grid.block({ message: $grid.data().loadingMessage });
			
			// move the header row outside of the table so it sticks
			var $headerRow = $grid.moveHeaderRow();
			
			
			// set any attributes as column options
			// this is so nice
			// make sure its not already been done
			if(!$grid.data().objectized) {
				$headerRow.find("th").each(function() {
					var $th = $(this);
					// if there are more than just the col attribute
					if($th[0].attributes.length > 1) {
						// loop through attributes
						$.each($($th[0].attributes), function(index) {
							var prop = $th[0].attributes[index].name;
							var val = $th[0].attributes[index].value;
							// is columnOpts set at all?
							if(!$grid.data().columnOpts) $grid.data("columnOpts",{});
							// are there already some options for this col?
							if(!$grid.data().columnOpts[$th.attr("col")]) $grid.data().columnOpts[$th.attr("col")] = {};
							// add this option
							$grid.data().columnOpts[$th.attr("col")][prop] = val;
						});	
					}
				});
				$grid.data("objectized",true);
			}
			
			// add the pager if its not there
			if($grid.data().pager) var $pager = $grid.createPager();
			
			// add the title bar if you should
			if($grid.attr("title") && !$grid.parents(".gridContainer").find(".gridTitle").length) {
				$grid.parents(".gridContainer").prepend("<div class='gridTitle'>"+$grid.attr("title")+"</div>");
				// add the add button if its on and the title bar is there
					if($grid.data().adding) {
						$grid.parents(".gridContainer").find(".gridTitle").append("<div class='gridButton gridAdd'><div>Add</div></div>");
						$grid.parents(".gridContainer").find(".gridAdd").click(function() {
							// find which fields are editable
							var cols = new Array(); 
							$.each($grid.data().columnOpts,function(col,opts) {
								if(opts.editable) cols.push(col);
							});	
							// ajax add the row
							$.post($grid.attr("action"),{
								"add":true,
								"cols":cols
							}, function(primaryKey) {
								// reload the grid but order by the primary key
								// that way our new row is on top
								$grid.loadGrid({
									order_by : primaryKey,
									sort : "DESC"
								});
							});
						});
						
					// add button if its being routed	
					} else if ($grid.data().addButton) {
						$grid.parents(".gridContainer").find(".gridTitle").append("<a href='"+$grid.data().addButton+"' class='gridButton gridAdd'><div>Add</div></a>");
					}
					
			}
			
			// go full screen?
			if($grid.data().fullScreen) {
				$grid.parents(".gridContainer").width("100%");
				$grid.parents(".gridContainer").find(".gridHeaderRow").width("100%");
				$grid.parents(".gridWrapper").css("max-height","none");
				var trHeight = parseInt($grid.find("tr:last").css("height"));
				var cellPadding = parseInt($grid.parents(".gridContainer").find(".gridHeaderRow th:first").css("padding-top"));
				$grid.css("margin-bottom",trHeight + cellPadding);
				$pager.addClass("fixed");
				
				$(window).resize(function() {
					$grid.equalizeColumns();
				});
			}
			
			// make the grid resizable...
			if($grid.data().resizable) $grid.makeResizable();	
			
			// add columns to data
			$grid.data("cols",$grid.getHeaderRow().find("th[col!='X'][col!='#'][col!='+']").attrJoin("col"));
			
			// method before load start
			if($grid.data().beforeLoadStart) $grid.beforeLoadStart();
			
			// get the data via ajax
			$grid.data("gridLoading",true);
			$.post($grid.attr("action"),$grid.data(), function(data, status, xhr) {
				
				// method load start
				if($grid.data().loadStart) $grid.loadStart();
				
				// set flag that loading is done
				$grid.data("gridLoading",false);
				
				// store total number of rows
				$grid.data("totalRows",data.nRows);
				$grid.data("firstRowShowing",data.start);
				$grid.data("lastRowShowing",data.end);
				$grid.data("rowData",{});
				
				// make sure the nRows box agrees
				//console.log($grid.find(".nRowsShowing"));
				//$grid.find(".nRowsShowing").val(data.nRows);
				
				// add colData (information about columns) to the columnOpts object
				if(data.colData) {
					$.each(data.colData,function(col,opts) {
						$.each(opts,function(opt,val) {
							if($grid.data().columnOpts[col]) {
								$grid.data().columnOpts[col][opt] = val;
							}	
						});
					});
				}
								
				// status updates
				// using the order by column name - get the name
				if($grid.data().pager) {
					var sortName = $grid.getHeaderRow().find("th[col="+data.order_by+"]").text();
					// prevent from showing rows beyond what is actually there
					if(data.end > data.nRows) data.end = data.nRows;
					$pager.find(".gridTotal").html("\
						"+data.start+" - "+data.end+" of <span class='nRows'>"+data.nRows+"</span> by "+sortName+" "+data.sort
					);
					// when you click nRows load the grid with all the rows
					$(".nRows").click(function() {
						$(this).parents(".gridContainer").find(".grid").loadGrid({
							nRowsShowing:$(this).html()
						});
					});
				}
				
				// start with fresh rows
				$grid.find("tr").remove();
				$grid.getHeaderRow().find("th[col='#'],th[col='X'],th[col='+']").remove();
				
				var $ths = $grid.getHeaderRow().find("th");
				if(data.rows && data.rows.toString() == "[object Object]") {
					// do we have a row click?
					var rowClick = opts.rowClick ? opts.rowClick : null;
					// add the new rows
					$.each(data.rows,function(primaryKey,row) {
						// primary key has an _ infront becuase of google chrome re ordering JSON objects
						//http://code.google.com/p/v8/issues/detail?id=164
						primaryKey = primaryKey.substr(1);
						
						// make sure the row ins't stuck up at the top
						if(!$grid.getHeaderRow().find("[primary_key="+primaryKey+"]").length) {
							var $newRow = $("<tr primary_key='"+primaryKey+"'>");
							// if we have a click - click this row
							if(rowClick) $newRow.click(rowClick);
							// loop through columnOpts (which are the columns you defined in the <table>
							$.each($grid.data().columnOpts,function(col,opts) {
								var cell = row[col];
								// money?
								if(opts.currency) {
									cell = formatMoney(cell,opts.currency);
								}
								// add this data to our columnOpts object for this col
								$grid.data().columnOpts[col].value = cell;
								
								// image replacment
								if(opts.type && opts.type == "image") {
									cell = "<img style='width:100%' src='"+cell+"'/>";
									var $thisTh = $grid.getHeaderRow().find("th[col="+col+"]");
									if(!$thisTh.attr("width")) $thisTh.attr("width",100);
								}
								
								// link replacement
								if(opts.link) {
									// add the link class if its there
									var link = "<a target='"+opts.linkTarget+"' href='"+opts.link+"'>"+cell+"</a>";
									// replace tokens
									link = link.replace("{COL}",col).replace("{VALUE}",cell).replace("{ROWID}",primaryKey);
									// replace cell back with our new link
									cell = link;
								}
								$newRow.append("<td col='"+col+"'>"+cell+"</td>");
							});
							$grid.append($newRow);
							
							// in a new object - store ALL data from the PHP return
							// this can't be in the columnOpts object becuase that needs to directly reflect
							// the main <table> call.
							$.each(row,function(col,val) {
								if(!$grid.data().rowData[col]) $grid.data().rowData[col] = [];
								$grid.data().rowData[col].push({value:val});
							});
						}
					})	
				} else {
					$grid.append("<tr><td colspan=100>No Rows</td></tr>");
				}
				
				// now that rows have been added - go through and replace link tokens that had to do with other columns
				$.each($grid.data().columnOpts,function(col,opts) {
					// only check those with links
					if(opts.link) {
						// look at each of their TDs
						$grid.getCol(col).getTdsFromTh().each(function() {
							var $aTag = $(this).find("a");
							// we wanna replace the href
							var link = $aTag.attr("href");
							// we wanna go back to the row and search all the TDs in this row
							var $tr = $(this).parents("tr");

							// this is a really stupid way of doing this but for some reason i can't match
							// groups globally... whatever this works.
							// start by getting all tokens to match there might be many in one link
							var searchCol = link.match(/\[([\w]+)\]/g);
							if(searchCol) {
								// go through each of those matches (which still have the [] stuipidly enough)
								$.each(searchCol,function(i,scol) {
									// we need to now strip that [] and get just the column name
									var res = scol.match(/\[([\w]+)\]/);
									var columnName = res[1];
									// using the column name - go into rowData and get the value
									// using rowData the column doesn't need to exist
									var rowIndex = $tr.prevAll().length;
									link = link.replace("["+columnName+"]",$grid.data().rowData[columnName][rowIndex].value);
									// replace it back
									$aTag.attr("href",link);
								});
							}	
						});
					}
				});									
				
				// if any width attributes are set, set them again
				// thats because they were deleted when the new rows came in
				$grid.getHeaderRow().find("th").each(function(i) {
					if(w=$(this).attr("width") ) {
						var w = parseInt($(this).attr("width"));
						$grid.find("tr:first td").eq(i).css("width",w)
					}
				});
				
				// setup inline editing - requires pager for save button
				if($grid.data().inlineEditing) $grid.setupInlineEditing();
				
				// add date picker if you can
				try{
					$(".datepicker").datepicker( {
						dateFormat: $grid.data().dateFormat
					});
				} catch(e) {}
				
				// only add these extra columns if we have some rows
				if($grid.data().totalRows > 0) {
					// setup row count
					if($grid.data().showRowNumber) $grid.createRowCount();
				
					// setup delete row
					if($grid.data().deleting) $grid.createDeleteColumn();
				} else {
					// don't show the save button if there are no rows
					$grid.parents(".gridContainer").find(".gridSave").fadeOut();
				}	
				
				// hide hidden rows
				$grid.hideHiddenCols();
				
				// equalizes the columns now that new rows exist
				// and since the headers are in a different table
				$grid.equalizeColumns();
				
				if($.blockUI) $grid.unblock();	
				
				// if there is a callback use that
				if($grid.data().loadComplete) $grid.loadComplete();
				
			},"json");
		});
	}
	
	// typing will filter the grid - hitting enter will submit to ajax
	// this sucks in firefox
	$(".gridSearch input[type=text]").live("keyup",function(e) {
		var $grid = $(this).parents(".gridContainer").find(".grid");
		// don't filter if you just searched
		if($grid.data().justSearched == false) {
			var search = $(this).val();
			var $grid = $(this).parents(".gridContainer").find(".grid");
			// make sure what you type goes into all instances of the box
			$grid.parents(".gridContainer").find(".gridSearch input").val(search);
			var $trs = $grid.find("tr");
			$trs.each(function() {
				// make sure to search editable values as well
				var editableVals = "";
				$(this).find("input").each(function() {
					editableVals += $(this).val().toLowerCase();
				});
				var haystack = $(this).text().toLowerCase() + editableVals;
				var needle = search.toLowerCase();
				if(haystack.lastIndexOf(needle) == -1) {
					$(this).fadeOut();
				} else {
					$(this).fadeIn();
				}
			});
		} else {
			// set this to false so that filtering will work again
			$grid.data("justSearched",false);
		}		
	// hitting enter will submit the search to ajax	
	}).live("keydown",function(e) {
		var $grid = $(this).parents(".gridContainer").find(".grid");
		// if we don't limit this to at least 3, you get some HUGEly long queries
		if(e.keyCode == "13" && ($(this).val().length > 2 || $(this).val().length == 0)) {
			$grid.data("justSearched",true);
			$grid.loadGrid({
				search:$(this).val(),
				page:1
			});
		}
	});
	
	// change the number of visible rows by hitting enter on the field
	$(".nRowsShowing").live("keydown",function(e) {
		// we want only numbers > 0 here
		if(e.keyCode == 13 && parseInt($(this).val()) > 0) {
			var $grid = $(this).parents(".gridContainer").find(".grid");
			$grid.loadGrid({
				nRowsShowing:$(this).val()
			});
			e.preventDefault();
		}
	}).live("keyup",function(e) {
		var $grid = $(this).parents(".gridContainer").find(".grid");
		// make sure what you type goes into all instances of the box
		$grid.parents(".gridContainer").find(".nRowsShowing").val($(this).val());
	});
	
	// clicking on headings will sort those columns	
	$(".gridHeaderRow th").live("click",function(e) {
		
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var cont = true;
		if($grid.find("tr.toBeSaved").length && $grid.data().confirmBeforeSort) {
			cont = confirm("You have unsaved changes on the grid, if you continue those changes will be lost. Continue?");
		}
		
		// don't do this if clicking on a col handle
		if(!$(e.target).hasClass("colHandle") && cont) {
			if($grid.data().clickToSort) {
				// determine the sort order
				var sort = $grid.data().sort == "DESC" ? "ASC" : "DESC";
				// store the sort and order into the data for use
				$grid.loadGrid({
					"sort":sort,
					"order_by":$(this).attr("col")
				});
			}	
		}
	})
	
	// only allow context clicking
	// this prevents selection
	$(".gridHeaderRow th").live("mousedown",function(e) {
		if(e.which != 3) return false;
	});
	
	// right click on headers
	$(".gridHeaderRow th").live("contextmenu",function(e) {
		var $th = $(this);
		var $grid = $(this).parents(".gridContainer").find(".grid");
		if( $(".gridContext").length > 0) $(".gridContext").remove();
		
		// see if this is a checkbox field
		var checkboxDisplay = $grid.data().columnOpts[$(this).attr("col")].editable == "checkbox" ? "block" : "none";
		
		var foundLetter=false, sum=null, avg=null, max=null, min=null, count=null;
		$(this).getTdsFromTh().each(function(i) {
			var val = $(this).find("input").length ? $(this).find("input").val() : $(this).text();
			// only allow all numbers/decimals
			if(val.search(/^[\d.\$Û£´£]*$/) == -1) foundLetter = true;
			// parseFloat for calculations
			var floatVal = parseFloat(val.replace(/[\$Û£´]/,''));
			sum += floatVal;
			if(!min) min = floatVal;	// assures that null isn't the smallest
			max = floatVal > max ? floatVal : max;
			min = floatVal < min ? floatVal : min;
			count = i;
		});
		
		sum = Math.round(sum*100)/100;
		avg = Math.round((max/count)*100)/100;
		var disp = foundLetter ? "none" : "block";
		if($grid.data().columnOpts[$th.attr("col")].currency) {
			var c = $grid.data().columnOpts[$th.attr("col")].currency;
			sum = formatMoney(sum,c);
			min = formatMoney(min,c);
			max = formatMoney(max,c);
			avg = formatMoney(avg,c);
		}
	
		var $context = $("\
			<div class='gridContext'>\
				<div class='closeContext'>x</div>\
				<div class='makeFluid'>Make Fluid</div>\
				<div class='colHide'>Remove</div>\
				<div class='colHighlite'>Highlite</div>\
				<div class='colDeHighlight'>Un-Highlite</div>\
				<hr style='display:"+disp+"'>\
				<div style='display:"+disp+"'>Sum: <span class='showSum'>"+sum+"</span></div>\
				<div style='display:"+disp+"'>Avg: <span class='showAvg'>"+avg+"</span></div>\
				<div style='display:"+disp+"'>Max: <span class='showMax'>"+max+"</span></div>\
				<div style='display:"+disp+"'>Min: <span class='showMin'>"+min+"</span></div>\
				<hr style='display:"+checkboxDisplay+"'>\
				<div style='display:"+checkboxDisplay+"' class='checkAll'>Check All</div>\
				<div style='display:"+checkboxDisplay+"' class='uncheckAll'>UnCheck All</div>\
			</div>\
		").css({
			left:e.clientX + 200 > $(window).width() ? e.clientX - 200 : e.clientX,
			top:e.clientY
		});
		// keep track of which th this was
		$context.attr("index",$(this).prevAll().length);
		// add the menu
		$(this).parents(".gridContainer").append($context);
		var $grid = $(this).parents(".gridContainer").find(".grid");
		$(".closeContext").click(function() {
			$grid.equalizeColumns();
		});
		return false;
	});
	
	$(".checkAll").live("click",function() {
		var index = $(this).parent().attr("index");
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var $th = $grid.getHeaderRow().find("th").eq(index);
		$th.getTdsFromTh().each(function() {
			$(this).find(":checkbox").attr("checked",true);
			// mark to be saved
			$(this).parents("tr").addClass("toBeSaved");
		});
		$grid.equalizeColumns();
	});
	
	$(".uncheckAll").live("click",function() {
		var index = $(this).parent().attr("index");
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var $th = $grid.getHeaderRow().find("th").eq(index);
		$th.getTdsFromTh().each(function() {
			$(this).find(":checkbox").attr("checked",false);
			// mark to be saved
			$(this).parents("tr").addClass("toBeSaved");
		});
		$grid.equalizeColumns();
	});
	
	// context option: will make the column fluid again
	$(".makeFluid").live("click",function() {
		var index = $(this).parent().attr("index");
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var $th = $grid.getHeaderRow().find("th").eq(index);
		var $td = $grid.find("tr:first td").eq(index);
		$th.removeAttr("width");
		$td.width("auto");
		$grid.equalizeColumns();
	});
	
	// hides a column
	$(".colHide").live("click",function() {
		var index = $(this).parent().attr("index");
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var $th = $grid.getHeaderRow().find("th").eq(index);
		$th.getTdsFromTh().each(function() {
			$(this).remove();
		});
		$th.remove();
		$grid.equalizeColumns();
	});
	
	// highlites an entire column
	$(".colHighlite").live("click",function() {
		var index = $(this).parent().attr("index");
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var $th = $grid.getHeaderRow().find("th").eq(index);
		$th.getTdsFromTh().each(function() {
			$(this).addClass("hilite");
		});
		$grid.equalizeColumns();
	});
	
	// unhighlits a column
	$(".colDeHighlight").live("click",function() {
		var index = $(this).parent().attr("index");
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var $th = $grid.getHeaderRow().find("th").eq(index);
		$th.getTdsFromTh().each(function() {
			$(this).removeClass("hilite");
		});
		$grid.equalizeColumns();
	});
	
	// clicking the title will remove the context menu
	$(".gridTitle").live("click",function() {
		if( $(".gridContext").length > 0) $(".gridContext").remove();
	});
	
	// double clicking on a row sticks it to the top
	$(".grid tr").live("dblclick",function() {
		var $grid = $(this).parents(".grid");
		if($grid.data().stickyRows) {
			$(this).addClass("stuckRow");
			$grid.getHeaderRow().append($(this));
			$grid.equalizeColumns();
		}	
	});
	
	// double click them to remove frozen rows
	$(".gridHeaderRow tr").live("dblclick",function() {
		// don't do dbl click on first row
		// :note(:first) didn't work *shrugs
		var $grid = $(this).parents(".gridContainer").find(".grid");
		var index = $(this).prevAll().length;
		if(index) {
			$(this).remove();
			$grid.loadGrid();
		}
	});
	
	// page forward
	$(".gridNext").live("click",function() {
		var $grid = $(this).parents(".gridContainer").find(".grid");
		// don't do it if the grid isn't done loading
		if(!$grid.data().gridLoading) {
			var lastRowShowing = parseInt($grid.data().lastRowShowing);
			var nRowsShowing = parseInt($grid.data().nRowsShowing);
			var totalRows = parseInt($grid.data().totalRows);
			if( lastRowShowing < totalRows) {
				$grid.loadGrid({
					page: parseInt($grid.data().page) + 1
				});
			}
		}	
	});
	
	// page backward
	$(".gridBack").live("click",function() {
		var $grid = $(this).parents(".gridContainer").find(".grid");
		// don't do it if the grid isn't done loading or your on page 1
		if(!$grid.data().gridLoading && $grid.data().page > 1) {
			$grid.loadGrid({
				page: parseInt($grid.data().page) - 1
			});
		}
	});
	
	// grid refresh
	$(".gridRefresh").live("click",function() {
		var $grid = $(this).parents(".gridContainer").find(".grid");
		$grid.loadGrid();
	});
	
	/*! kill selections */
	$(".gridWrapper").live("mousedown",function(e) {
		var $grid = $(this).find(".grid");
		if(!$grid.data().inlineEditing) {
			return false;
		}
	});
	
	// disable more selections
	$(".gridButton, .gridHandle").live("mousedown",function(e) {
		return false;
	});
	
	$(window).resize(function() {
		//$(".grid").equalizeColumns();
	});
	
	$.fn.exportAsJson = function() {
		var $grid = $(this);
		return $grid.data().rowData;
	}
	
	// hide hidden cols
	$.fn.hideHiddenCols = function() {
		var $grid = $(this);
		$.each($grid.data().columnOpts, function(i,opts) {
			if(opts.display && opts.display == "hidden") {
				$grid.hideCol(opts.col);
			}
		});
	}
	
	// called on a grid - will hide the given col
	$.fn.hideCol = function(col) {
		var $grid = $(this);
		var $th = $grid.getHeaderRow().find("th[col="+col+"]");
		$th.hide();
		$th.getTdsFromTh().hide();
	}
	
	// sets up cells for inline editing
	$.fn.setupInlineEditing = function() {
		var $grid = $(this);
		
		// move the save button to the title if the pager doesn't exist
		if(!$grid.data().pager) {
			$grid.data("saveLocation","title");
		}
		
		// save button location
		// create the button text
		var saveBtnText = "<div class='gridButton gridSave'><div>Save</div></div>"; 
		// remvoe all of them
		$grid.parents(".gridContainer").find(".gridSave").remove();
		// place it
		switch($grid.data().saveLocation) {
			case "title":
				$grid.parents(".gridContainer").find(".gridTitle").append(saveBtnText);
				break;
			case "both":
				$grid.getPager().append(saveBtnText);
				$grid.parents(".gridContainer").find(".gridTitle").append(saveBtnText);
				break;
			default:
				$grid.getPager().append(saveBtnText);
				break;	
		}
		
		// we need the save button for this
		var $saveBtn = $grid.parents(".gridContainer").find(".gridSave");
		
		// don't add the listener if the save button is already there
		if($saveBtn.css("display") == "none") {
			$saveBtn.fadeIn().click(function() {
				// spit out object of all stuff to save
				var rows = new Array();
				$grid.find("tr.toBeSaved").each(function() {
					// each cell to save
					var nvpArray = new Array();	// use this array so we can join by comma later
					$(this).find(".editableInput").each(function() {
						var col = $(this).parent().attr("col");
						// to get value of checkbox we have to check the dom property 'checked'
						if($(this)[0].type == "checkbox") {
							var val = $(this)[0].checked ? 1 : 0;
						// all other values can use .val()
						} else {
							var val = $(this).val();
						}

						val = val.toString().replace(/"/g,'\\"');
						val = val.toString().replace(/\r|\n/g,'\\n');
						nvpArray.push('"'+col+'":"'+val+'"');
					});
					var rowId = $(this).attr("primary_key");
					var internalPart = "{"+nvpArray.join(",")+"}";
					rows.push('"'+rowId+'":'+internalPart);
				});
				
				// wrap all rows joined by comma in an object
				var jsonPost = "{"+rows.join(",")+"}";

				// dont do it if its empty
				if(jsonPost != "{}") {
					// send this string to php
					
					console.log(jsonPost);
					
					// passing it the save flag so we can catch it in our ajax file
					if($.blockUI) $grid.block({ message: $grid.data().loadingMessage });
					$.post($grid.attr("action"),{"save":1,"json":jsonPost},function(error) {
						// no return means no errors!
						if(!error) {
							// blink and change the save text
							$saveBtn.html("Saved!").fadeOut("fast",function() {
								$saveBtn.fadeIn("fast",function() {
									$saveBtn.html("Save");
									// method on save success
									if($grid.data().saveSuccess) $grid.saveSuccess();
								});
							});
							$grid.loadGrid();
						} else {
							// tell you to stop and re do it, you have a sql error
							$saveBtn.text("ERROR! refresh");
							alert(error);
							// method on save success
							if($grid.data().saveFail) $grid.saveFail();
						}
					});
				}	
			});
		}
		
		// go through options and find editable columns
		$grid.getHeaderRow().find("th").each(function() {
			var $th = $(this);
			var col = $th.attr("col");

			if( $grid.data().columnOpts[col] && $grid.data().columnOpts[col].editable) {
				var editType = $grid.data().columnOpts[col].editable;
				// text box
				if(editType == "text" || editType == "inline" || editType == "date" || editType == "textarea") {
					$th.getTdsFromTh().each(function() {
						var $td = $(this);
						// dont setup a cell that is already editable
						if(!$td.hasClass("editableCell")) {
							$td.addClass("editableCell");
							var width = width ? 0 : $td.width();	// quick way of saying, use the first width
							// check if maxlength is to be used
							var maxlength = "";
							if($grid.data().columnOpts[col].maxLength) {
								maxlength = "maxlength='"+$grid.data().columnOpts[col].maxLength+"'";
							}
							if($td.text() == "null") $td.text("");
							var xtraClass = editType=="date" ? "datepicker" : "";
							// handle textarea
							if(editType == "textarea") {
								var $input = $('<textarea '+maxlength+' class="editableInput '+xtraClass+'"></textarea>');
							} else {
								var $input = $('<input '+maxlength+' class="editableInput '+xtraClass+'" type="text" />');
							}	
							$input.val($td.text());
							// add a class to identify which rows were edited
							$input.focus(function() {
								$(this).parents("tr").addClass("toBeSaved");
							});
							// replace the html with the new input box
							$td.html($input);
							// make sure its the same width as before
							$td.width(width);
						}	
					});

				// passthru
				} else if (editType == "passthru") {
					$th.getTdsFromTh().each(function() {
						var $td = $(this);
						// dont setup a cell that is already editable
						if(!$td.hasClass("editableCell")) {
							$td.addClass("editableCell");
							if($td.text() == "null") $td.text("");
							var $input = $("<input type='hidden' class='editableInput' value='"+$td.text()+"'/>");
							$input.focus(function() {
								$(this).parents("tr").addClass("toBeSaved");
							});
							// append the hidden data
							$td.append($input);
						}	
					});
				// select box
				} else if (editType == "select") {
					// get select data
					$.post($grid.attr("action"),{"select":1,col:col},function(options) {
						// loop through cells
						$th.getTdsFromTh().each(function() {
							var $td = $(this);
							// create the select box
							var $select = $("<select class='editableInput'></select>");
							//  insert null select if there is no value
							if(nullText = $grid.data().columnOpts[col].nulltext) {
								$select.append("<option value=''>"+nullText+"</option>");
							}	
							// insert the rest of the options
							$.each(options,function(val,disp) {
								if($td.text() == val) {
									$select.append("<option selected value='"+val+"'>"+disp+"</option>");
								} else {
									$select.append("<option value='"+val+"'>"+disp+"</option>");
								}
							});
							// focusing will tell use this has been edited
							$select.focus(function() {
								$(this).parents("tr").addClass("toBeSaved");
							});
							$(this).addClass("editableCell").html($select);
						});
						$grid.equalizeColumns();
					},"json");
				} else if (editType == "checkbox") {
					// for every td
					$th.getTdsFromTh().each(function() {
						$(this).addClass("editableCell");
						// if there is a value, check that guy
						var v = parseInt($(this).text());
						if(v) {
							var $cb = $("<input class='editableInput' type='checkbox' checked value='"+v+"'/>");
						} else {
							var $cb = $("<input class='editableInput' type='checkbox' value='"+v+"'/>");
						}
						// clicking will tell use this has been edited
						$cb.click(function() {
							$(this).parents("tr").addClass("toBeSaved");
						});
						$(this).html($cb);
					});
				}
			}	
		});
	}

	
	// creates row count after rows exist
	$.fn.createRowCount = function() {
		var $grid = $(this);
		// mimic the header stucture
		$grid.getHeaderRow().find("tr:first").prepend("\
			<th style='width:20px' col='#'>\
				<div class='colResizer' style='width:20px'>#\
					<div class='colHandle'></div>\
				</div>\
			</th>\
		");
		// count some rows and add them in
		$grid.find("tr").each(function(i) {
			var rowNum = i + parseInt($grid.data().firstRowShowing);
			$(this).prepend("<td col='#'>"+rowNum+"</td>");
		});
		$grid.equalizeColumns();
	}
	
	// creates delet Column
	$.fn.createDeleteColumn = function() {
		var $grid = $(this);
		// mimic the header stucture
		$grid.getHeaderRow().find("tr:first").append("\
			<th col='X' style='width:20px'>\
				<div class='colResizer' style='width:20px'>X\
					<div class='colHandle'></div>\
				</div>\
			</th>\
		");
		// count some rows and add them in
		$grid.find("tr").each(function(i) {
			var $tr = $(this);
			$del = $("<div class='gridButton gridDelete'><div>Delete</div></div>");
			$del.click(function() {
				// if we need to confirm the delete
				if($grid.data().deleteConfirm) {
					// row index so we can get this data
					var rowIndex = $tr.prevAll().length;
					// the value is gonna be in the rowData object
					// if its not set - use blank
					var whatToSay = $grid.data().rowData[$grid.data().deleteConfirm] ? $grid.data().rowData[$grid.data().deleteConfirm][rowIndex].value : "";
					if(confirm("Are you sure you want to delete "+whatToSay+" ?")) {
						$.post($grid.attr("action"),{
							"delete":true,
							"primary_key":$(this).parents("tr").attr("primary_key")
						}, function(success) {
							if(success) {
								$grid.loadGrid();
								// method on delete success
								if($grid.data().deleteSuccess) $grid.deleteSuccess();
							} else {
								// method on delete fail
								if($grid.data().deleteFail) $grid.deleteFail();
								alert("Error: Delete Failed");
							}
						});
					}	
				} else {
					$.post($grid.attr("action"),{
						"delete":true,
						"primary_key":$(this).parents("tr").attr("primary_key")
					}, function() {
						$grid.loadGrid();
					});
				}
				
			});	
			$(this).append($("<td col='X' style='width:20px'></td>").append($del));
		});
		$grid.equalizeColumns();
	}
	
	
	// called on grid, given a col attr it will return that TH
	$.fn.getCol = function(col) {
		return $(this).getHeaderRow().find("th[col="+col+"]");
	}
	
	// called on a TH it will return all of the TDs in that column
	$.fn.getTdsFromTh = function() {
		var $grid = $(this).parents(".gridContainer").find(".grid");
		return $grid.find("td[col="+$(this).attr("col")+"]");
	};
	
	// equalizes the header rows with the first row
	$.fn.equalizeColumns = function() {
		var $grid = $(this);
		
		
		return this.each(function() {
			
			// remove the context menu if it exists
			if( $(".gridContext").length > 0) $(".gridContext").remove();
			
			// cache it
			var $header = $grid.getHeaderRow();
			
			// if there is a scrollbar account for it
			if(($grid.height() > $grid.parents(".gridWrapper").height())) {
				$header.find(".scrollTh").remove();
				var $newTh = $("<th></th>").addClass("scrollTh").css({
					padding:0,
					margin:0,
					width:15
				});
				$header.find("tr:first").append($newTh);
			} else if ($grid.parents(".gridWrapper").height() > $grid.height()) {
				$(".scrollTh").remove();
			}	
			
			// size the first row to the headers
			$grid.find("tr:first td:visible").each(function(i) {
				var $colResizer = $header.find(".colResizer").eq(i);
				var pLeft = parseInt($colResizer.parents("th").css("padding-left"));
				var pRight = parseInt($colResizer.parents("th").css("padding-left"));
				
				$colResizer.width($(this).width());
			})
			
		});	
	}
	
	/* function is too slow ff 3.6
	// figures out if a column is empty or not given a th
	$.fn.isEmptyColumn = function() {
		return false;
		$str = "";
		$(this).getTdsFromTh().each(function() {
			var editVal = $(this).find("input").length ? $(this).find("input").val() : "";
			$str += $(this).text() + editVal;
		});
		if($str) return false;
		else return true;
	};
	*/
	
	// method to move the header
	$.fn.moveHeaderRow = function() {
		var $grid = $(this);
		if(!$grid.getHeaderRow().length) {
			$firstTr = $grid.find("tr:first").clone();
			$grid.parents(".gridContainer").prepend($("<table class='gridHeaderRow'>").append($firstTr));
			
			$firstTr.find("th").each(function(i,item) {
				var $th = $(this);
				var text = $th.text();
				$th.html("");
				
				// create inner th elements
				var lastTh = $grid.getHeaderRow().find("th").length -1;
				
				var $colHandle = $("<div class='colHandle'></div>");
					$colHandle.height($th.outerHeight());
				var $colResizer = $("<div class='colResizer'></div>").html(text).append($colHandle);
				
				// if resizalbe columns is set
				if($grid.data().resizableColumns) {
					// add drag (mousedown and mousemove) listeners
					$colHandle.mousedown(function(e) {
						
						var startX = e.clientX;
						$(document).bind("mousemove.grid",function(e) {
							// get the inner div
							var $div = $th.find("div.colResizer");
							// calculate the width based on mouse position
							var width = $div.width() + (e.clientX - startX);
							// we need to resize the TD as well - so using the index, grab it
							var currentIndex = $th.prevAll().length;
							// set the width of the div
							$div.width(width);
							// set the width of the td
							$grid.find("tr:first td").eq(currentIndex).width(width);
							// reset our start var
							startX = e.clientX;
							// equalize all the others
							$grid.equalizeColumns();
							// store this guys width
							$th.attr("width",width);
						});
						$(document).mouseup(function() {
							$(document).unbind("mousemove.grid");
						});
					});
				}

				// now set the th to auto
				$th.width("auto");
				
				// add the resizer
				$th.append($colResizer);
				
				// fix some sizing
				var ptop = -1 * parseInt($th.css("padding-top"));
				$colHandle.css({
					"top":ptop,
					"right":-1 * $colHandle.outerWidth() / 1.9
				});
								
			});
			
			$grid.getHeaderRow().find(".colhandle:last").remove();
			
		}	
		return $grid.getHeaderRow();
	}
	
	
	// method to create the pager if it doesn't exist
	$.fn.createPager = function() {
		var $grid = $(this);
		var $pager = $grid.getPager();
		// only do it if the nResults is > than nRows
		
		if(!$pager.length) {
		
			// if we want a date range
			var dateRange = "";
			if($grid.data().dateRange) {
				dateRange = "\
					<div class='dateRange'>\
						<input type='text' class='dateRangeFrom datepicker' value='"+$grid.data().dateRangeFrom+"'/> -\
						<input type='text' class='dateRangeTo datepicker' value='"+$grid.data().dateRangeTo+"'/>\
					</div>\
					<div class='gridButton dateGo'><div>Go</div></div>\
				";
			}
			
			var refreshButton = "";
			if($grid.data().refreshButton) {
				refreshButton = "<div class='gridButton gridRefresh'><div>Refresh</div></div>";
			}
			
			// add paging div
			$pager = $("\
				<div class='gridPager'>\
					"+refreshButton+"\
					<div class='gridSearch'>\
						<input type='text' placeholder='search' value=''/>\
					</div>\
					<div class='gridLimit'>\
						<input type='text' value='"+$grid.data().nRowsShowing+"' style='width:20px' class='nRowsShowing'/>\
					</div>\
					<div class='gridButton gridBack'><div>Back</div></div>\
					<div class='gridButton gridNext'><div>Next</div></div>\
					<div class='gridTotal'></div>\
					"+dateRange+"\
					<div class='gridButton gridSave'><div>Save</div></div>\
				</div>\
			");
			
			// add the pager
			switch($grid.data().pagerLocation) {
				case "bottom":
					$grid.parents(".gridContainer").append($pager);
					break;
				case "top":
					$grid.parents(".gridContainer").prepend($pager.addClass("pagerTop"));
					break;
				case "both":
					$grid.parents(".gridContainer").prepend($pager.clone());
					$grid.parents(".gridContainer").append($pager);
					break;
				default:
					break;
			}
			
			// add events for datepicker if needed
			if($grid.data().dateRange) {
				$(".dateGo").click(function() {
					$grid.loadGrid({
						dateRangeFrom:$(this).parents(".gridContainer").find(".dateRangeFrom").val(),
						dateRangeTo:$(this).parents(".gridContainer").find(".dateRangeTo").val()
					});
				});
				// make sure all copies have the same data
				$(".dateRangeFrom").change(function() {
					$(this).parents(".gridContainer").find(".dateRangeFrom").val($(this).val());
				});
				$(".dateRangeTo").change(function() {
					$(this).parents(".gridContainer").find(".dateRangeTo").val($(this).val());
				});
			}
			
		}
		return $grid.getPager();
	}
	
	// quick helper function to get the header row from the grid
	$.fn.getHeaderRow = function() {
		return $(this).parent().prev(".gridHeaderRow");
	}
	
	// quick helper function to get the pager from the grid
	$.fn.getPager = function() {
		return $(this).parents(".gridContainer").find(".gridPager");
	}
	
	// will make the grid resizble
	$.fn.makeResizable = function() {
		var $grid = $(this);
		var $container = $grid.parents(".gridContainer");
		var $wrapper = $grid.parents(".gridWrapper");
		var $handle = $("<div class='gridHandle'></div>");
		$handle.mousedown(function(e) {
			// as soon as the mouse goes down - record our x and y
			var startX = e.clientX;		
			var startY = e.clientY;
			// bind with  namespace so we can remove only ours
			$(document).bind("mousemove.resize",function(e) {
				// resize container and wrapper based on x and y distance change
				$container.width($container.width() + (e.clientX - startX));
				$wrapper.height($wrapper.height() + (e.clientY - startY));
				$wrapper.css("max-height",$wrapper.css("max-height") + (e.clientY - startY));
				// reset so we dont' get exponential distances
				startX = e.clientX;
				startY = e.clientY;
				// equalize each time
				$grid.equalizeColumns();
			});
			// when your done, remove our move listener
			$(document).mouseup(function() {
				$(document).unbind("mousemove.resize");
			});
		});
		// add the handle to the dom$grid.parents(".gridContainer").width("100%");
		$grid.parents(".gridContainer").append($handle);
	}
	
	
	// will get all the matched elements and join them with a comma by the attribute
	// UTILITY
	$.fn.attrJoin = function(attr) {
		return $(this).map(function() { 
			return $(this).attr(attr); 
		}).get().join(",");
	}
	
});


// format money
function formatMoney(amount,symbol) {
	var i = parseFloat(amount);
	if(isNaN(i)) { i = 0.00; }
	var minus = '';
	if(i < 0) { minus = '-'; }
	i = Math.abs(i);
	i = parseInt((i + .005) * 100);
	i = i / 100;
	s = new String(i);
	if(s.indexOf('.') < 0) { s += '.00'; }
	if(s.indexOf('.') == (s.length - 2)) { s += '0'; }
	s = minus + s;
	return symbol+addCommas(s);
}

function addCommas(amount) {
	var delimiter = ","; // replace comma if desired
	var a = amount.split('.',2)
	var d = a[1];
	var i = parseInt(a[0]);
	if(isNaN(i)) { return ''; }
	var minus = '';
	if(i < 0) { minus = '-'; }
	i = Math.abs(i);
	var n = new String(i);
	var a = [];
	while(n.length > 3)
	{
		var nn = n.substr(n.length-3);
		a.unshift(nn);
		n = n.substr(0,n.length-3);
	}
	if(n.length > 0) { a.unshift(n); }
	n = a.join(delimiter);
	if(d.length < 1) { amount = n; }
	else { amount = n + '.' + d; }
	amount = minus + amount;
	return amount;
}