<?php
	
	// connect to db
	mysql_connect("localhost","root","root");
	mysql_select_db("demo_world");
	
	// require our class
	require_once("grid.php");
	
	if($_GET['type'] == "country") {
	
		$grid = new Grid("Country",array());
	
	} else if($_GET['type'] == "city") {
		
		// we have the country code now
		$countryCode = $_GET['country'];
		
		$grid = new Grid("City",array(
			
			"where" => "City.CountryCode = '$countryCode'",
			"joins" => array(
				"LEFT JOIN Country ON (Country.Code = City.CountryCode)"
			),
			"fields" => array(
				"CountryName" => "Country.Name"
			)
			
		));
		
		
	}
	
?>