<?php
	// connect to db
	mysql_connect("localhost","root","root");
	mysql_select_db("cmi_test");
	
	// require our class
	require_once("grid.php");
	// load our grid with a table
	$grid = new Grid("orders");
	
	// for editing check for the save flag and call save
	if(isset($_POST['save'])) {
		//$grid->security = array("n_items");
		echo $grid->save();
	} else if(isset($_POST['add'])) {
		$grid->add();
	} else if(isset($_POST['delete'])) {
		$grid->delete();
	} else if(isset($_POST['select'])) {
		// select for column txn_id
		if($_POST['col'] == "txn_id") {
			$grid->where = "txn_id IS NOT NULL";
			$grid->limit = 5;
			$grid->makeSelect("txn_id","txn_id");
			echo json_encode($grid->data);
		}	
	} else {
		$grid->load();
		echo json_encode($grid->data);
	}	
?>