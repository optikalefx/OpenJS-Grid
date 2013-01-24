<?php

/*

OpenJS Grid
This is openGrid version 2.0

*/


Class Grid {
	
	var $data;
	var $joins;
	var $fields;
	var $where;
	var $table;
	var $groupBy;
	var $having;
	var $limit;
	var $order_by;
	var $sort;
	var $security;
	var $set;
	var $sql;
	
	function __construct($table, $options) {
		$this->table = $table;
		
		// save
		if( isset($options['save']) && isset($_POST['save']) && $options['save'] == "true") {
			echo $this->save();
		
		// delete
		} else if( isset($options['delete']) && isset($_POST['delete']) && $options['delete'] == "true") {
			echo $this->delete();
			
		// delete
		} else if( isset($options['select']) && isset($_POST['select']) && $options['select'] == "true") {
			$this->select = true;
		
		// select boxes
		} else if(isset($options['select']) && isset($_POST['select'])) {
			
			$this->joins = array();
			$this->where = "";
			$this->fields = array();
			
			$call = $options['select'];
			if(is_array($call)) {
				call_user_func($call,$this);
			} else {
				$call($this);
			}
			

		// load
		} else {
			
			if(isset($options['where'])) $this->where = $options['where'];
			if(isset($options['fields'])) $this->fields = $options['fields'];
			if(isset($options['joins'])) $this->joins = $options['joins'];
			if(isset($options['groupBy'])) $this->groupBy = $options['groupBy'];
			if(isset($options['having'])) $this->having = $options['having'];

			$this->load()->render();
		}
		
	}
	
	function save() {
		$saveArray = $this->getSaveArray();
		
		// we need a primary key for editing
		$primaryKey = $this->getPrimaryKey();

		// die here if a primary is not found
		if(empty($primaryKey)) die("Primary Key for table {$this->table} Not set! For inline editing you must have a primary key on your table.");
		
		// go through each row and perform an update
		foreach($saveArray as $rowId=>$row) {
			$setArray = array();
			foreach($row as $key=>$value) {
				// don't update this row if you have security set
				// idea from youtube user jfuruskog
				if(!is_array($this->security) || in_array($key,$this->security)) {
					// dont save fields that weren't saveable. i.e. joined fields
					if(in_array($key,$_POST['saveable'])) {
						$key =  mysql_real_escape_string($key);
						$value =  mysql_real_escape_string($value);
						$setArray[] = "`$key`='$value'";
					}
				}	
			}
			
			$sql = "UPDATE {$this->table} SET ".implode(",",$setArray)." WHERE `$primaryKey` = '$rowId'";
			
			$res = mysql_query($sql);

			// die with messages if fail
			$this->dieOnError($sql);
		}
		return (bool) $res;
	}
	
	// use this to write your own custom save function for the data
	function getSaveArray() {
		return $_POST['json'];
	}
	
	// adds a new row based on the editable fields
	function add() {
		
		// if didn't pass a set param, just add a new row
		if(empty($this->set)) {
			mysql_query("INSERT INTO {$this->table} VALUES ()");
		
		// if you passed a set param then use that in the insert
		} else {
			mysql_query("INSERT INTO {$this->table} SET {$this->set}");
		}
		
		// we return the primary key so that we can order by it in the jS
		echo $this->getPrimaryKey();
	}
	
	function delete() {
		$post = $this->_safeMysql();
		$primaryKey = $this->getPrimaryKey();
		return mysql_query("DELETE FROM {$this->table} WHERE `$primaryKey` = '$post[id]'");
	}
	
	function select($selects) {
		foreach($selects as $s) {
			echo function_exists($s);
		}
		
	}
	
	// will build an id, value array to be used to make a select box
	function makeSelect($value,$display) {
		// build sql if they are there
		$where = $this->where ? "WHERE {$this->where}":"";
		$order_by = $this->order_by ? "ORDER BY {$this->order_by}":"";
		$sort = $this->sort ? "{$this->sort}":"";
		$limit = $this->limit ? "LIMIT {$this->limit}":"";
		$table = $this->table;
		
		// bring all the joins togther if sent
		if(is_array($this->joins)) {
			$joins = implode(" ",$this->joins);
		} else {
			$joins = "";
		}
		
		// we only are selecting 2 columns, the one to use as the ID and the one for the display
		$colsArray = array($value,$display);
		$newColsArray = array();
		$usedCols = array();

		// loop through each complex field
		if($this->fields && is_array($this->fields)) {
			foreach($this->fields as $as=>$field) {
				// find which column this is to replace (replace in terms of the column for its complex counterpart)
				foreach($colsArray as $col) {
					// replace your alias with the complex field
					if($col == $as) {
						// field from OTHER table
						$newColsArray[] = "$field as `$as`";
						// mark as used
						$usedCols[] = $col;
					} else {
						// field from THIS table that aren't in the fields array
						if(!isset($this->fields[$col]) && !in_array($col,$usedCols)) {
							$newColsArray[] = "`$table`.`$col`";
							$usedCols[] = $col;
						}	
					}
				}
			}
		} else {
			// add safe tics
			foreach($colsArray as $key=>$col) {
				$newColsArray[] = "`$table`.`$col`";
			}
		}
		
		// put it back
		$colsArray = $newColsArray;
		
		// get group and having
		$groupBy = $this->groupBy ? "GROUP BY ".$this->groupBy : "";
		$having = $this->having ? "HAVING ".$this->having : "";
		
		// bring it all together again
		$cols = implode(",",$colsArray);
		
		// setup the sql - bring it all together
		$sql = "
			SELECT $cols
			FROM `$table`
			$joins
			$where
			$groupBy
			$having
			$order_by $sort
			$limit
		";
		
		// run sql, build id/value json
		$rows = $this->_queryMulti($sql);
		$this->dieOnError($sql);
		
		// setup rows to feed back to JS
		foreach($rows as $row) {
			$data[$row[$value]] = $row[$display];
		}

		// set our data so we can get it later
		$this->data = $data;
		
		return $data;

	}
	
	// loads data into the grid
	function load() {
		$post = $this->_safeMysql();
		
		// setup variables from properties
		$joins = $this->joins;
		$fields = $this->fields;
		$where = $this->where;
		$table = $this->table;
		
		// we need to break this up for use
		$colsArray = explode(",",$post['cols']);
		
		// get an array of saveable fields
		$saveable = $colsArray;
		// bug #1# @eric.tuvesson@gmail.com
		if(is_array($fields)) {
			foreach($fields as $field=>$detail) {
				foreach($saveable as $k=>$f) {
					if( $f == $field ) {
						unset($saveable[$k]);
					}
				}
			}
		}

		
		// were gonna use this one because this allows us to order by a column that we didnt' pass
		$order_by = isset($post['orderBy']) ? $post['orderBy'] : $colsArray[0];
		
		// save variables for easier use throughout the code
		$sort = isset($post['sort']) ? $post['sort'] : "asc";
		$nRowsShowing = isset($post['nRowsShowing']) ? $post['nRowsShowing'] : 10;
		$page = isset($post['page']) ? $post['page'] : 1;
		
		
		$startRow = ($page - 1) * $nRowsShowing;
		
		// bring all the joins togther if sent
		if((bool)$joins && is_array($joins)) {
			$joins = implode(" ",$joins);
		} else {
			$joins = "";
		}

		// if there are specific fields to add
		// replace the specefied alias with its complex field
		$colsArrayForWhere = array();
		$newColsArray = array();
		$usedCols = array();
		
		$groupFunctions = array(
			"AVG",
			"BIT_AND",
			"BIT_OR",
			"BIT_XOR",
			"COUNT",
			"GROUP_CONCAT",
			"ROUND",
			"MAX",
			"MIN",
			"STD",
			"STDDEV_POP",
			"STDDEV_SAMP",
			"STDDEV",
			"SUM",
			"VAR_POP",
			"VAR_SAMP",
			"VARIANCE"
		);
		
		if($fields && is_array($fields)) {
			foreach($fields as $as=>$field) {
				// find which column this is to replace
				foreach($colsArray as $col) {
					// replace your alias with the complex field
					if($col == $as && !in_array($col,$usedCols)) {
						// field from OTHER table
						$newColsArray[] = "$field as `$as`";
						// we can't search by group functions
						preg_match('/^\w+/i',$field,$needle);
						if(!in_array(strtoupper($needle[0]),$groupFunctions)) {
							$colsArrayForWhere[] = $field;
						}	
						// mark as used
						$usedCols[] = $col;
					} else {
						// field from THIS non joined table that aren't in the fields array
						if(!isset($fields[$col]) && !in_array($col,$usedCols)) {
							$newColsArray[] = "`$table`.`$col`";
							$colsArrayForWhere[] = "`$table`.`$col`";
							$usedCols[] = $col;
						
						// add fields that aren't in the <table> but you want passed anyway
						} else if(!in_array($as,$usedCols)){
							// were just using field & as because you should have back ticked and chosen your table in your call
							$newColsArray[] = "$field as `$as`";
							// we can't search by group functions
							preg_match('/^\w+/i',$field,$needle);
							if(isset($needle[0])) {
								if(!in_array(strtoupper($needle[0]),$groupFunctions)) {
									$colsArrayForWhere[] = $field;
								}
							}	
							$usedCols[] = $as;
						}
					}
				}
			}
		} else {
			// add safe tics
			foreach($colsArray as $key=>$col) {
				$newColsArray[] = "`$table`.`$col`";
				$colsArrayForWhere[] = "`$table`.`$col`";
			}
		}
		
		// put it back
		$colsArray = $newColsArray;
		
		// get primary key
		$primaryKey = $this->getPrimaryKey();
		
		// if primary key isn't in the list. add it.
		if($primaryKey && !in_array($primaryKey,$usedCols)) {
			$colsArray[] = $table.".".$primaryKey;
		}
		
		// with the cols array, if requested
		$colData = array();
		if(isset($post['maxLength']) && $post['maxLength'] == "true") {
			foreach($colsArray as $col) {
				// if there is no as (we can't determine length on aliased fields)
				if(stripos($col," as ") === false) {
					$col = str_replace("`","",$col);
					list($aTable,$field) = explode(".",$col);
					if(!$aTable) $aTable = $this->table;
					$colDataSql = mysql_query("SHOW columns FROM $aTable WHERE Field = '$field'");
					while($row = mysql_fetch_assoc($colDataSql)) {
						$type = $row['Type'];
					}
					preg_match('/\(([^\)]+)/',$type,$matches);
					$colData[$field] = array("maxLength"=>$matches[1]);	
				}
			}
		}
		
		// shrink to comma list
		$post['cols'] = implode(",",$colsArray);
		
		
		// add dateRange to where
		if(!empty($post['dateRangeFrom']) || !empty($post['dateRangeTo'])) {

			// if one or the other is empty - use today otherwise parse into mysql date the date that was passed
			$dateFrom = empty($post['dateRangeFrom']) ? date('Y-m-d H:i:s') : date('Y-m-d H:i:s',strtotime($post['dateRangeFrom']));
			$dateTo = empty($post['dateRangeTo']) ? date('Y-m-d H:i:s') : date('Y-m-d H:i:s',strtotime($post['dateRangeTo']));
			
			// if they are = we want just this day (otherwise it would be blank)
			if($dateFrom == $dateTo) {
				$dateWhere = "DATE($table.$post[dateRange]) = DATE('$dateFrom')";
			// we actually want a range	
			} else {
				$dateWhere = "`$table`.`$post[dateRange]` BETWEEN '$dateFrom' AND '$dateTo'";
			}
			
			// add this to the global where statement
			if(empty($where)) {
				$where = $dateWhere;
			} else {
				$where = "($dateWhere) && $where";
			}

		}
		

		// specific where setup for searching
		if(isset($post['search']) && $post['search']) {
			// if there is a search term, add the custom where first, then the search
			$where = !$where ? " WHERE " : " WHERE ($where) && ";
			// if you are searching, at a like to all the columns
			$where .= "(".implode(" LIKE '%$post[search]%' || ",$colsArrayForWhere) . " LIKE '%$post[search]%')";
		} else {
			// add the where keyword if there is no search term
			if($where) {
				$where = "WHERE $where";
			}
		}
		
		// get group and having
		$groupBy = $this->groupBy ? "GROUP BY ".$this->groupBy : "";
		$having = $this->having ? "HAVING ".$this->having : "";
		
		if($startRow < 0) $startRow = 1;
		
		// we need this seperate so we can not have a limit at all
		$limit = "LIMIT $startRow,$nRowsShowing";
		
		// if were searching, see if we want all results or not
		if(isset($_POST['pager']) && $_POST['pager'] == "false" || (!empty($_POST['search']) && isset($_POST['pageSearchResults']))) {
			$limit = "";
		}
		
		

		// setup the sql - bring it all together
		$order = strpos($order_by,".") === false ? "`$order_by`" : $order_by;
		$sql = "
			SELECT $post[cols]
			FROM `$table`
			$joins
			$where
			$groupBy
			$having
			ORDER BY $order $sort
			$limit
		";
		
		$this->sql = $sql;

		// execute the sql, get back a multi dimensial array
		$rows = $this->_queryMulti($sql);
		
		// die with messages if fail
		$this->dieOnError($sql);

		
		// form an array of the data to send back
		$data = array();
		$data['rows'] = array();
		foreach($rows as $i=>$row) {
			foreach($row as $col=>$cell) {
				// use primary key if possible, other wise use index
				$key = $primaryKey ? $row[$primaryKey] : $i;

				// primary key has an _ infront becuase of google chrome re ordering JSON objects
				//http://code.google.com/p/v8/issues/detail?id=164
				$data['rows']["_".$key][$col] = utf8_encode($cell);
			}
		}
		
		// if were searching and we dont want all the results - dont run a 2nd query
		if(isset($_POST['pager']) && $_POST['pager'] == "false" || (!empty($_POST['search']) && isset($_POST['pageSearchResults']))) {
			$data['nRows'] = count($rows);
			$startRow = 0;
			$nRowsShowing = $data['nRows'];
		} else {
			if(!$this->limit) {
				// use the same query for counting less the limit
				$sql2 = preg_replace('/LIMIT[\s\d,]+$/','',$sql);
			
				// find the total results to send back
				$res = mysql_query($sql2);
				$data['nRows'] = mysql_num_rows($res);
			} else {
				$data['nRows'] = $this->limit;
			}
		}
		
		$data['order_by'] = $order_by;
		$data['sort'] = $sort;
		$data['page'] = $page;
		$data['start'] = $startRow + 1;
		$data['end'] = $startRow + $nRowsShowing;
		$data['colData'] = $colData;	
		$data['saveable'] = $saveable;
		$this->data = $data;
		
		return $this;
	}
	
	// renders the json data out
	function render($data=NULL) {
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
		header('Content-type: application/json');
		if($data) $this->data = $data;
		echo json_encode($this->data);
	}
	
	// incomplete
	// will allow this whole thing to run off an entire custom query
	// as in not just setting props
	function loadWithSql($sql) {
		$sql = preg_replace('/[ORDER BY|order by]+[\s]+[^\n\r]+/','',$sql);
		$sql = preg_replace('/[LIMIT|limit]+[\s\d,]+$/','',$sql);
		echo $sql;
		
	}
	
	// using the current table will get the primary key column name
	// does not work for combined primary keys
	function getPrimaryKey($table=NULL) {
		if(!$table) $table = $this->table;
		$primaryKey = mysql_query("SHOW KEYS FROM `$table` WHERE Key_name = 'PRIMARY'");
		$primaryKey = mysql_fetch_assoc($primaryKey);
		return $primaryKey['Column_name'];
	}
	
	// if there is a mysql error it will die with that error
	function dieOnError($sql) {
		if($e=mysql_error()) {
			//var_dump($sql);
			die($e);
		}
	}
	
	// runs a query, always returns a multi dimensional array of results
	function _queryMulti($sql) {
		$array = array();
		$res = mysql_query($sql);
		if((bool)$res) {
			// if there is only 1 field, just return and array with that field as each value
			if(mysql_num_fields($res) > 1) {
				while($row = mysql_fetch_assoc($res)) $array[] = $row;
			} else if(mysql_num_fields($res) == 1) {
				while($row = mysql_fetch_assoc($res)) {
					foreach($row as $item) $array[] = $item;
				}	
			}	
			$error = mysql_error();
			if($error) echo $error;
		}
		return $array;
	}
	
	// safeify post
	function _safeMysql($post=NULL) {
		if(!isset($post)) $post = $_POST;
		$postReturn = array();
		foreach($post as $key=>$value) {
			if(!is_array($value)) {
				$postReturn[$key] = mysql_real_escape_string(urldecode($value)); 
			} else if(is_array($value)) {
				$postReturn[$key] = $value;
			}	
		}
		return $postReturn;
	}
}


?>