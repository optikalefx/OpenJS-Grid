# Open JS Grid

![ojg icon](http://square-bracket.com/images/img/openjsgrid.png)

## Overview

**Open JS Grid**, The easiest data table / grid available for js and php developers.  I used all of my knowledge of OOP Javascript, jQuery, mySQL and PHP to do all the work for you, as well as comment the hell out of everything.

**For all the documentation and examples, see <http://square-bracket.com/openjs>**


##### Current Version 2.1
 - Column resizing is fixed
 - touch enabled partially working
 - slider is bigger when using touch
 - class touch is givent to the grid when its touch enabled
 - the 'dynamic' property is given to columns that are dynamically created
 - new minWidthForDynamicCols added for dynamic columns
 - minWidth is now utilized in css

### Getting Started

#### HTML Setup

	<table action="ajax.php">
     	<tr>
     		<th col="Username">Username</th>
     		<th col="FirstName">First Name</th>
     		<th col="Lastname">Last Name</th>
     		<th col="Email">Email</th>
		</tr>
	</table>
	
#### JS Setup

	<script>
      $(function() {
        $(".users").grid();
      });
    </script>


#### PHP Setup

	<?php
      require_once("grid.php");
      $grid = new Grid("users", array(
        "save"=>true,
        "delete"=>true
      ));
    ?>

#### The philosophy

Basically, the whole idea here is that in backend coding, you have to make a ton of table displays for customers or clients.  OpenJS Grid provides a super easy / powerful way to give customers access to data.  I do all the database work for you, so you don't have to figure out searching and sorting, as well as give you cool stuff like events and cell types so you can customize to fit your need. And now with Stylus and Bootstrap, you can easily restyle the grid to your liking.

Once more, I believe data grids should still be written as HTML tables, with very little javascript config.  So that's why the setup is an HTML table. You can also specificy column options as attributes on the `<th>` elements. That's so you can have dynamic grids, and less javascript config.

#### The Features 2.1

- Sorting
- Live Filtering
- Searching (database)
- Paging
- Editing
	- textbox, dropdown, checkbox
- Deleting
- Row numbering
- Row checkboxes
- Hyperlinking
	- use data from that cell, or any cell, even if its not on the grid
- Events 
	- loadComplete, cellClick, rowClick, rowCheck
- CSS written in Stylus
- Completely OOP
	- Grid, Pager, Slider, Dialog
- Custom Dialogs for each grid
	- notify, alert, error, confirm
- Custom cell types
	- input, money, drop down, checkbox, image, even your own
- Dynamically add your own columns
- Column resizing and full grid resizing
- Allow for complex mysql joins, having, groups and limits
- I think that's all?

#### The Future 3.0?

- Per row editing
- textarea type
- multi level grids
- millions of rows support
- row adding
- row highlights (its too slow right now with it)

#### Who am I?

I'm Sean Clark.  I run a training [youtube](http://youtube.com/optikalefxx) channel for advanced coding. That coincides with [Square Bracket](http://square-bracket.com) which is where I make demos and other training videos.

I have a [blog](http://sean-optikalefx.blogspot.com/>) about developer things.