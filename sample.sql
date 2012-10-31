# ************************************************************
# Sequel Pro SQL dump
# Version 3904
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.1.44)
# Database: cmi_test
# Generation Time: 2012-10-31 18:52:46 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table categories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `CategoryID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;

INSERT INTO `categories` (`CategoryID`, `Name`)
VALUES
	(6,'Blender'),
	(7,'Combustion'),
	(8,'Nuke'),
	(9,'~ FREE Tutorials ~'),
	(10,'Fusion'),
	(11,'Houdini'),
	(12,'Cinema 4D'),
	(13,'Photoshop'),
	(14,'Flame'),
	(16,'Shake'),
	(17,'Motion'),
	(20,'3D Matchmoving'),
	(21,'Speed Six'),
	(28,'Eat3D'),
	(29,'PYTHON'),
	(30,'Softimage'),
	(31,'ZBrush'),
	(32,'Adobe'),
	(33,'Composite'),
	(36,'Matte Painting Scenarios'),
	(37,'FREE ZONE'),
	(38,'3DS Max'),
	(39,'Endorphin');

/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tutorials
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tutorials`;

CREATE TABLE `tutorials` (
  `TutorialID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CategoryID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(150) NOT NULL,
  `ThumbnailLocation` varchar(300) DEFAULT NULL,
  `Price` double DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `DateCreated` datetime NOT NULL,
  `duration` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`TutorialID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `tutorials` WRITE;
/*!40000 ALTER TABLE `tutorials` DISABLE KEYS */;

INSERT INTO `tutorials` (`TutorialID`, `CategoryID`, `Title`, `ThumbnailLocation`, `Price`, `active`, `DateCreated`, `duration`)
VALUES
	(23,12,'C4D Destruction Tactics','237-Store.jpg',59.95,1,'2010-07-08 00:00:00','03.16.34'),
	(33,7,'Combustion 3D Compositing','33-Com_3dc.jpg',49.95,0,'2007-07-11 00:00:00',NULL),
	(34,7,'Combustion Sky Replacements','34-Com_SkyR.jpg',49.95,0,'2007-07-11 00:00:00',NULL),
	(35,19,'Maya Cage Modeling (Part 1)','35-MayaCage.jpg',29.95,0,'2007-07-11 00:00:00',NULL),
	(36,19,'ZBrush Displacement Modeling (Part 2)','36-ZbrushDisplace.jpg',29.95,0,'2007-07-11 00:00:00',NULL),
	(37,19,'ZBrush Texturing (Part 3)','37-ZBrush_Texture.jpg',29.95,0,'2007-07-11 00:00:00',NULL),
	(38,10,'Fusion 3D Compositing','38-F5_3dc.jpg',49.95,1,'2007-07-11 00:00:00','01.57.44'),
	(39,10,'Fusion Advanced Particle Tactics','39-F5_APT.jpg',49.95,1,'2007-07-11 00:00:00','04.06.19'),
	(40,10,'Fusion Basics','40-F5_Basics.jpg',49.95,1,'2007-07-11 00:00:00','02.47.50'),
	(41,10,'Fusion Common Particle Libraries','41-F5_comP.jpg',49.95,1,'2007-07-11 00:00:00',''),
	(42,10,'Fusion Crowd Replication','42-F5_crowd.jpg',49.95,1,'2007-07-11 00:00:00','02.00.13'),
	(43,10,'Fusion Image Replacements','43-F5_IR.jpg',49.95,1,'2007-07-11 00:00:00','02.13.52'),
	(44,10,'Fusion Advanced Keying','44-F5_Key.jpg',39.95,0,'2007-07-11 00:00:00',NULL),
	(45,10,'Fusion Sky Replacements','45-F5_SkyR.jpg',49.95,1,'2007-07-11 00:00:00','02.17.09'),
	(46,10,'Fusion Intro to 2D Particles','46-F5_lparticles.jpg',39.95,0,'2007-07-11 00:00:00',NULL),
	(47,11,'Houdini Procedural Cities','47-H_Cities.jpg',49.95,1,'2007-07-11 00:00:00','03.53.31'),
	(51,11,'Houdini L-System Essentials 1','51-H_Lsys1.jpg',49.95,1,'2007-07-12 00:00:00',''),
	(55,11,'Houdini L-System Essentials 2','55-H_lsys2.jpg',49.95,1,'2007-07-13 00:00:00',''),
	(56,16,'Shake Basics','56-SHK_1.jpg',15.95,1,'2007-07-13 00:00:00','01.24.49'),
	(57,16,'Shake Intermediate','57-SHK_2.jpg',15.95,1,'2007-07-13 00:00:00','01.30.53'),
	(58,16,'Shake Advanced','58-SHK_3.jpg',15.95,1,'2007-07-13 00:00:00',''),
	(59,8,'Nuke Advanced Keying','59-NUKE_KEY.jpg',39.95,0,'2007-07-13 00:00:00',NULL),
	(60,17,'Motion Advanced Keying Concepts','60-Mot_Key.jpg',29.95,0,'2007-07-13 00:00:00',NULL),
	(61,36,'Photoshop For 3D Compositing','61-PSD_3DC.jpg',29.95,1,'2007-07-16 00:00:00','01.36.27'),
	(62,14,'Flame Extened Length Training','62-Flame_Basics.jpg',99.95,1,'2007-07-16 00:00:00','05.57.37'),
	(63,9,'Fusion HP Style Tricks','63-Tut_hp_style_cmivfx.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(64,9,'Speedsix Launch Video','64-Tut_SpeedSix_launch.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(65,9,'NUKE Changing Seasons','65-Tut_Nuke_snow.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(66,9,'Creating Noise Spectrums in VEX','66-Tut_VEXNoiseSpecturms.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(67,9,'Fusion Rainbow Maker','67-Tut_RainbowMaker.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(68,9,'Light Wrapping In Fusion','68-Tut_LiteWrap.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(70,9,'Simulating Helium Neon Laser Holograms','70-Tut_Fu5Hologram.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(71,9,'Onion Skinning In Fusion','71-Tut_F5_OnionSkinning.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(72,9,'PFtrack 4 exports for Cinema 4D','72-Tut_c4d_pftrack4.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(74,9,'Set Driven Key And the Hud In Cinema 4D','74-Tut_C4D_HUD_DRIVEN_KEYS.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(75,9,'Cinema 4D Constraints','75-Tut_C4D_Automation_101.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(76,9,'NUKE 3d Compositing','76-Tut_3dComp_nuke.jpg',0,1,'2007-07-18 00:00:00',NULL),
	(77,20,'PFTrack 3D Matchmoving','77-PFTrack.jpg',49.95,1,'2007-07-19 00:00:00','01.41.07'),
	(78,9,'PFHoe Pro Video Manual','78-PFHoePro.jpg',0,1,'2007-07-19 00:00:00',NULL),
	(79,16,'Shake 3D Compositing','79-SHK_3dc.jpg',49.95,1,'2007-07-23 00:00:00','01.30.38'),
	(80,16,'Shake Image Replacements and Match Moves','80-SHK_IR.jpg',49.95,1,'2007-07-23 00:00:00','01.23.37'),
	(81,16,'Shake Advanced Keying And Compositing','81-SHK_KEy.jpg',39.95,1,'2007-07-23 00:00:00','00.58.35'),
	(82,16,'Shake Sky Replacements','82-SHK_SkyR.jpg',49.95,1,'2007-07-23 00:00:00','02.47.47'),
	(83,21,'SpeedSix: Aurora Luna and Smoke','83-S6_Aurora_Luna_Smoke.jpg',10.95,0,'2007-07-23 00:00:00',NULL),
	(84,21,'SpeedSix: Lightning Rain And Beam','84-S6_Lightning_Rain_Beam.jpg',10.95,0,'2007-07-23 00:00:00',NULL),
	(85,21,'SpeedSix: Puddle3D And&nbsp; Texture','85-S6_Puddle3D_Texture.jpg',10.95,0,'2007-07-23 00:00:00',NULL),
	(86,21,'SpeedSix: Snow And Ripple3D','86-S6_Snow_Ripple.jpg',10.95,0,'2007-07-23 00:00:00',NULL),
	(88,22,'Wings 3D','88-Wings3D.jpg',29.95,0,'2007-07-29 00:00:00',NULL),
	(89,10,'Fusion Big 5 Macros And Video','89-F5_big5Plugs.jpg',29.95,0,'2007-07-29 00:00:00',NULL),
	(92,12,'Ultimate Learning System Vol 1','92-C4D_ULS_vol1.jpg',59.95,1,'2007-08-16 00:00:00','02.23.07'),
	(93,12,'Ultimate Learning System Vol 2','93-C4D_ULS_vol2.jpg',59.95,1,'2007-08-16 00:00:00','02.12.21'),
	(94,12,'Ultimate Learning System Vol 3','94-C4D_ULS_vol3.jpg',59.95,1,'2007-08-16 00:00:00','02.47.55'),
	(100,9,'Scratch Gray Scale To Duotones','100-Scratch_Duotones.jpg',0,1,'2007-08-28 00:00:00',NULL),
	(101,11,'Houdini VEX Volume 1','101-H_vex1.jpg',49.95,1,'2007-08-30 00:00:00','02.37.50'),
	(136,26,'C4D Ultimate Learning System Sneak Peak','136-c4d_ULS_demo.jpg',0,0,'2007-09-03 00:00:00',NULL),
	(137,11,'Houdini VEX Volume 2','137-H_vex2.jpg',49.95,1,'2007-09-21 00:00:00','02.21.35'),
	(138,12,'Ultimate Learning System Vol 4','138-C4D_ULS_vol4.jpg',59.95,1,'2007-10-10 00:00:00','02.47.23'),
	(139,9,'Flame Particles Basics','139-Flame_ParticleBasics.jpg',0,1,'2007-10-11 00:00:00',NULL),
	(140,9,'Flame Managing CG Render Passes in Batch','140-Flame_CG_Passes.jpg',0,1,'2007-10-18 00:00:00',NULL),
	(144,12,'Ultimate Learning System Vol 5','144-C4D_ULS_vol5.jpg',59.95,1,'2007-12-12 00:00:00','03.09.18'),
	(147,9,'Flame Light Wrapping Technique','147-Flame_LiteWrap.jpg',0,1,'2008-01-23 00:00:00',NULL),
	(148,9,'Cinema 4D to Zbrush and back again','148-C4d_ZBRUSH.jpg',0,1,'2008-02-12 00:00:00',NULL),
	(149,10,'Fusion Roto and Keying','149-F5_masking.jpg',49.95,1,'2008-02-20 00:00:00',''),
	(150,9,'Flame, Furnace, Fixing HDV','150-Flame_Furnace_DeNoise.jpg',0,1,'2008-02-21 00:00:00',NULL),
	(152,11,'Houdini Fundamentals','152-H_fundamentals.jpg',49.95,1,'2008-03-07 00:00:00','02.26.35'),
	(153,11,'Houdini Intro to Procedural Modeling','153-H_procModeling.jpg',49.95,1,'2008-03-21 00:00:00',''),
	(155,9,'Speed Six Fire Demo','155-S6_fire_demo.jpg',0,1,'2008-04-28 00:00:00',NULL),
	(156,12,'Cinema 4D Cloth Systems','156-C4D_cloth_dynamics.jpg',49.95,1,'2008-05-02 00:00:00','04.31.17'),
	(157,10,'Fusion 3D Matte Paintings','157-F5_mattes.jpg',49.95,1,'2008-05-30 00:00:00','02.00.45'),
	(158,9,'Imagineer\'s Mocha Part1','158-Imagineer_general.jpg',0,1,'2008-07-20 00:00:00',NULL),
	(159,9,'Imagineer\'s Mocha Part2','159-Imagineer_general.jpg',0,1,'2008-07-20 00:00:00',NULL),
	(160,9,'Imagineer\'s Products Overview','160-Imagineer_general.jpg',0,1,'2008-07-20 00:00:00',NULL),
	(161,9,'Imagineer\'s Mocha to Nuke Workflow','161-Imagineer_general.jpg',0,1,'2008-07-20 00:00:00',NULL),
	(163,11,'Houdini Fluid Effects For TD\'s','163-houdini_fluids_iconBIG.jpg',49.95,1,'2008-07-27 00:00:00','03.46.45'),
	(167,28,'E3D Live Action and CG','167-e3d_live_action_thumb.jpg',14.95,0,'2008-08-07 00:00:00',NULL),
	(170,14,'Flame Matte Painting Extraction','170-FLMattethumb.jpg',49.95,1,'2008-08-20 00:00:00','03.00.06'),
	(171,21,'S6_Riddik_style','171-s6_riddick.jpg',0,1,'2008-08-24 00:00:00',NULL),
	(173,9,'C4D Modeling For Projections','173-Tut_c4d_modelingForProjections.jpg',0,1,'2008-09-08 00:00:00',NULL),
	(174,12,'Cinema 4D Matte Painting Extraction','174-c4d_icon_projections.jpg',59.95,1,'2008-09-09 00:00:00','04.19.55'),
	(177,10,'Fusion Expressions','177-fu_express_icon_store.jpg',24.95,1,'2008-10-06 00:00:00',''),
	(183,8,'Nuke: 3D Matte Paintings','183-nuke_3d_icon.jpg',49.95,1,'2008-12-06 00:00:00','02.31.01'),
	(185,29,'Intro To PYTHON Programming For CG','185-python_icon_large.jpg',49.95,1,'2008-12-23 00:00:00','03.21.02'),
	(186,9,'Planet Earth For Cinema 4D','186-Earth.jpg',0,1,'2008-12-30 00:00:00',NULL),
	(187,9,'Import OBJ FLuids to Fusion','187-Picture-1.jpg',0,1,'2009-01-21 00:00:00',NULL),
	(188,12,'Thinking Particles Intro Volume 1','188-Thumb.jpg',49.95,1,'2009-01-31 00:00:00',NULL),
	(189,12,'Thinking Particles Intro Volume 2','189-Thumb.jpg',49.95,1,'2009-01-31 00:00:00',NULL),
	(192,11,'Houdini Intro To Particle Animation','192-Thumb.jpg',49.95,1,'2009-02-14 00:00:00','03.46.33'),
	(193,14,'Flame Advanced Keying Concepts','193-Flash_Thumb.jpg',49.95,1,'2009-02-28 00:00:00','01.55.30'),
	(194,28,'E3D Live Action and CG 2','194-storeThumbnail.jpg',14.95,0,'2009-03-06 00:00:00',NULL),
	(196,9,'Houdini Folley and CHOPs','196-AudioChoppers.jpg',0,1,'2009-03-24 00:00:00',NULL),
	(197,30,'Softimage ICE For A Production Pipeline','197-StoreThumb.jpg',49.95,1,'2009-04-08 00:00:00','03.58.50'),
	(198,9,'Nuke Intermediate CG Pipelines','198-Large.jpg',0,1,'2009-04-26 00:00:00',NULL),
	(199,9,'F6_MoodRing_Shaders','199-thumb_moodRing.jpg',0,1,'2009-06-17 00:00:00',NULL),
	(200,9,'F6_SSS_Shading','200-thumbnail.jpg',0,1,'2009-06-18 00:00:00',NULL),
	(202,6,'Learn Blender FREE','202-LargeIcon.jpg',0,1,'2009-06-29 00:00:00',NULL),
	(203,11,'Houdini Shading and Rendering','203-StoreThumb.jpg',49.95,1,'2009-07-15 00:00:00','03.32.21'),
	(204,31,'Zbrush Beyond Digital Sculpting','204-icon_large.jpg',49.95,1,'2009-08-17 00:00:00','03.32.20'),
	(205,6,'Blender Unwrapping and Baking','205-beastStore.jpg',29.95,1,'2009-08-26 00:00:00','00.55.28'),
	(207,11,'Houdini Caustics','207-StoreBig.jpg',29.95,1,'2009-08-27 00:00:00',''),
	(208,14,'Substance Noise Combinations','208-flame_SN_thumb_big.jpg',19.95,1,'2009-09-29 00:00:00','00.43.15'),
	(210,11,'Houdini Intro to Subsurface Scattering','210-Store.jpg',29.95,1,'2009-10-19 00:00:00',''),
	(211,12,'C4D Surface Modeling Techniques','211-ShotOK_thumb.jpg',59.95,1,'2009-11-17 00:00:00','02.46.51'),
	(212,30,'Softimage ICE: Scalar Data','212-ICE_SCALAR_STORE.jpg',49.95,1,'2009-11-22 00:00:00','02.18.03'),
	(213,11,'Houdini Procedural Road Creation','213-NewMaster_Store.jpg',49.95,1,'2009-11-25 00:00:00','04.29.21'),
	(218,11,'Houdini Empowering Digital Assets with Python','218-Store.jpg',49.95,1,'2009-12-20 00:00:00','02.08.25'),
	(219,11,'Houdini Procedural Road Creation 2','219-Store.jpg',49.95,1,'2009-12-21 00:00:00','04.20.25'),
	(224,32,'Photo-Realistic Digital Painting','224-Store.jpg',29.95,1,'2010-02-02 00:00:00','01.07.43'),
	(225,10,'Fusion Object Removal Techniques','225-obbject_removal_Store_Icon.jpg',29.95,1,'2010-02-21 00:00:00','01.22.43'),
	(228,11,'Houdini Procedural Road Creation 3','228-Store.jpg',49.95,1,'2010-03-03 00:00:00','03.51.26'),
	(229,8,'Nuke Object Removal Techniques','229-Store_Icon.jpg',29.95,1,'2010-03-04 00:00:00','01.12.06'),
	(230,33,'Autodesk Composite (Toxik) Introduction','230-Store.jpg',59.95,1,'2010-03-24 00:00:00','04.02.41'),
	(231,8,'Nuke Tracking','231-3D_tracking_store.jpg',59.95,1,'2010-04-03 00:00:00','02.07.30'),
	(232,9,'VFX Guide to Digital Ink Effects','232-mink.jpg',0,1,'2010-04-18 00:00:00',NULL),
	(233,11,'Houdini XML Based Procedural Cities','233-Store.jpg',59.95,1,'2010-04-25 00:00:00','01.53.51'),
	(234,8,'Nuke Face Replacements','234-StoreThumb.jpg',59.95,1,'2010-05-06 00:00:00','02.19.26'),
	(235,9,'Houdini Sprite Rendering Patch','235-sprites.jpg',0,1,'2010-05-21 00:00:00',NULL),
	(236,12,'Ultimate Learning System Vol 6','236-Mo_Store.jpg',59.95,1,'2010-05-27 00:00:00','03.07.37'),
	(238,8,'Nuke Shading and Lighting FX','238-large_thumb.jpg',59.95,1,'2010-07-22 00:00:00','03.08.06'),
	(239,10,'Fusion Procedural Shading Networks','239-LargeThumb.jpg',59.95,1,'2010-07-28 00:00:00','02.49.48'),
	(242,20,'Complete Syntheyes Training','242-Thumb_Large.jpg',59.95,1,'2010-08-12 00:00:00','03.44.19'),
	(245,12,'BodyPaint UV Layout And Texture Painting','245-LargeTumb.jpg',59.95,1,'2010-08-16 00:00:00','03.55.29'),
	(246,12,'Pyrocluster Revealed','246-Thumb_Large.jpg',39.95,1,'2010-08-23 00:00:00','01.37.47'),
	(250,11,'Houdini Procedural Animation Techniques','250-jelly_thumb_large.jpg',59.95,1,'2010-09-14 00:00:00','02.57.31'),
	(251,12,'Cinema 4D XPresso Volume 1','251-thumb_Large.jpg',59.95,1,'2010-09-23 00:00:00','02.22.37'),
	(252,36,'Photoshop Matte Painting','252-thumb_large.jpg',59.95,1,'2010-10-04 00:00:00','03.14.45'),
	(253,11,'Houdini Building Generation','253-thumb-Large.jpg',59.95,1,'2010-10-11 00:00:00','02.57.41'),
	(259,36,'Vue Moving Matte Paintings','vue_Thumb_Large.jpg',59.95,1,'2010-11-08 15:08:23','05.05.59'),
	(261,37,'Mocha Planar Tracking','thumb_mocha.png',0,1,'2010-11-09 10:04:00',NULL),
	(262,37,'Mocha Workflow','thumb_mocha.png',0,1,'2010-11-09 10:16:24',NULL),
	(263,37,'Mocha Interface','thumb_mocha.png',0,1,'2010-11-09 10:20:40',NULL),
	(264,37,'Mocha Basic Tracking','thumb_mocha.png',0,1,'2010-11-09 10:22:59',NULL),
	(265,37,'Mocha Rotoscoping','thumb_mocha.png',0,1,'2010-11-09 10:24:53',NULL),
	(266,37,'Mocha Advanced Tracking','thumb_mocha.png',0,1,'2010-11-09 10:27:57',NULL),
	(267,37,'Nuke Color Management','thumb_NUKE.png',0,1,'2010-11-09 10:32:02',NULL),
	(268,37,'Nuke IBK Keyer','thumb_NUKE.png',0,1,'2010-11-09 10:34:29',NULL),
	(269,37,'Nuke Keylight Tutorial','thumb_NUKE.png',0,1,'2010-11-09 10:36:41',NULL),
	(270,37,'Nuke Basic Workflows Primatte Tutorial','thumb_NUKE.png',0,1,'2010-11-09 10:39:37',NULL),
	(271,8,'Nuke Advanced Keying and Channel Ops','1289836369_Thumb_NukeKey.png',59.95,1,'2010-11-15 09:50:14','02.07.40'),
	(272,31,' Softimage Advanced Modeling Techniques','1291663446_Softimage_Icon.png',59.95,1,'2010-12-06 12:48:56','06.08.47'),
	(273,10,'Fusion Basics 2011','1292604791_Thumb.png',59.95,1,'2010-12-15 13:25:26','03.20.59'),
	(274,28,'Eat3D Autodesk 3ds Max 2011','1294520423_thumb_large.jpg',39.95,1,'2011-01-08 12:00:51','03.47.53'),
	(275,10,'Fusion Tracking 2011','1295276575_IconThumbLarge.jpg',59.95,1,'2011-01-17 08:25:10','02.33.39'),
	(276,11,'Houdini Smoke And Dust','1295891537_Thumb.png',59.95,1,'2011-01-24 06:36:35','03.50.16'),
	(279,39,'Simulating Creatures in Endorphin','1296948853_Thumb_Large.png',59.95,1,'2011-02-05 17:10:56','04.05.09'),
	(1698,9,'Company Ident','169-station_ident.jpg',0,1,'2008-08-17 00:00:00',NULL);

/*!40000 ALTER TABLE `tutorials` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
