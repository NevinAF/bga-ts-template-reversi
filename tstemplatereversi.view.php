<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TSTemplateReversi implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * tstemplatereversi.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in tstemplatereversi_tstemplatereversi.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
require_once( APP_BASE_PATH."view/common/game.view.php" );
  
class view_tstemplatereversi_tstemplatereversi extends game_view
{
    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "tstemplatereversi";
    }
    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );

        /*********** Place your code below:  ************/

		// States that we should start inserting at the 'square' block
		// tstemplatereversi_tstemplatereversi should be replaced with your game name: tstemplatereversi_tstemplatereversi
		$this->page->begin_block( "tstemplatereversi_tstemplatereversi", "square" );

		$hor_scale = 64.8; // Constant for square width
		$ver_scale = 64.4; // Constant for square height
		for( $x=1; $x<=8; $x++ ) // Loop the 8 columns..
		{
			for( $y=1; $y<=8; $y++ ) // Loop the 8 rows..
			{
				// Inserts the code found at the square block based on the variables.
				$this->page->insert_block( "square", array(
					'X' => $x,
					'Y' => $y,
					'LEFT' => round( ($x-1)*$hor_scale+10 ),
					'TOP' => round( ($y-1)*$ver_scale+7 )
				) );
			}
		}

        /*********** Do not change anything below this line  ************/
  	}
}
