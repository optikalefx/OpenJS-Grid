<html>
	<head>
		<link rel="stylesheet" type="text/css" href="grid.css">
		<link rel="stylesheet" type="text/css" href="ui-darkness/jquery-ui-1.8.10.custom.css">
		<style type="text/css">
			body {
				background:#333;
			}
		</style>	
		<script src="jquery.js"></script>
		<script src="blockui.js"></script>
		<script src="grid.js"></script>
		<script src="ui.js"></script>
		<script>
			$(function() {
				// grid with row numbers and inline editing
				
				$(".grid.all").loadGrid({
					nRowsShowing:10,
					inlineEditing:true,
					stickyRows:false,
					order_by : "purchase_date",
					maxLength:true,
					adding:true,
					deleting:true,
					showRowNumbers:true,
					confirmDelete:"txn_i",
					dateRange:"purchase_date",
					pagerLocation:"both",
					width:1000
				});
				
				// default grid
				$(".grid.default").loadGrid({
					adding : true,
					loadComplete : function() {
						var $grid = $(this);
						var json = $grid.exportAsJson();
					},
					width:1000
				});

			});
			
		</script>
	</head>
	<body>
		
		<table class="grid default" action="ajax.php" title="Default">
			<tr>	
				<th col="purchase_date">Date</th>
				<th col="order_total">Total</th>
				<th col="txn_id">Txn</th>
				<th col="n_items" width="50">N Items</th>
				<th col="discount_code">Discount Code</th>
				<th col="order_type">Order Type</th>
			</tr>
		</table>
		
		<br><br><br>		

		<table class="grid all" action="ajax.php" title="All the stops (inline editing & row numbers)">
			<tr>
				<th col="active"			 	editable="checkbox" width="50">Active</th>
				<th col="purchase_date" 		editable="date">Date</th>
				<th col="order_total" 			currency="$">Total</th>
				<th col="txn_id" 				editable="select" 	width="170"	nulltext="none selected" >Txn</th>
				<th col="n_items" 				editable="text" 	width="50">N Items</th>
				<th col="discount_code" 		editable="textarea">Discount Code</th>
				<th col="order_type" link="http://www.google.com/search?q={VALUE}[n_items]">Order Type</th>
			</tr>
		</table>
		
		
	</body>
</html>
