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
  * tstemplatereversi.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class TSTemplateReversi extends Table
{
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array( 
            //    "my_first_global_variable" => 10,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ) );        
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "tstemplatereversi";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( ',', $values );
        self::DbQuery( $sql );
        // self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

		$sql = "INSERT INTO board (board_x,board_y,board_player) VALUES ";
		$sql_values = array();
		list( $whiteplayer_id, $blackplayer_id ) = array_keys( $players );
		for( $x=1; $x<=8; $x++ )
		{
			for( $y=1; $y<=8; $y++ )
			{
				// Initial positions of white player
				if( ($x==4 && $y==4) || ($x==5 && $y==5) )
					$token_value = "'$whiteplayer_id'";
				// Initial positions of black player
				else if( ($x==4 && $y==5) || ($x==5 && $y==4) )
					$token_value = "'$blackplayer_id'";
				// Not a starting position
				else
					$token_value = "NULL";
				$sql_values[] = "('$x','$y',$token_value)";
			}
		}
		$sql .= implode( ',', $sql_values );
		self::DbQuery( $sql );

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );

		$sql = "SELECT board_x x, board_y y, board_player player
				FROM board WHERE board_player IS NOT NULL";
		$result['board'] = self::getObjectListFromDB( $sql );

        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

	// Get the complete board with a double associative array
	function getBoard()
	{
		$sql = "SELECT board_x x, board_y y, board_player player FROM board";
		return self::getDoubleKeyCollectionFromDB( $sql, true );
	}

	// Get the list of possible moves (x => y => true)
	function getPossibleMoves( $player_id )
	{
		$result = array();

		$board = self::getBoard();

		for( $x=1; $x<=8; $x++ )
		{
			for( $y=1; $y<=8; $y++ )
			{
				$returned = self::getTurnedOverDiscs( $x, $y, $player_id, $board );
				if( count( $returned ) == 0 )
				{
					// No discs returned => not a possible move
				}
				else
				{
					// Okay => set this coordinate to "true"
					if( ! isset( $result[$x] ) )
						$result[$x] = array();

					$result[$x][$y] = true;
				}
			}
		}

		return $result;
	}

	// Get the list of returned disc when "player" we play at this place ("x", "y"),
	//  or a void array if no disc is returned (invalid move)
	function getTurnedOverDiscs( $x, $y, $player, $board )
	{
		$turnedOverDiscs = array();

		if( $board[ $x ][ $y ] === null ) // If there is already a disc on this place, this can't be a valid move
		{
			// For each directions...
			$directions = array(
				array( -1,-1 ), array( -1,0 ), array( -1, 1 ), array( 0, -1),
				array( 0,1 ), array( 1,-1), array( 1,0 ), array( 1, 1 )
			);

			foreach( $directions as $direction )
			{
				// Starting from the square we want to place a disc...
				$current_x = $x;
				$current_y = $y;
				$bContinue = true;
				$mayBeTurnedOver = array();

				while( $bContinue )
				{
					// Go to the next square in this direction
					$current_x += $direction[0];
					$current_y += $direction[1];

					if( $current_x<1 || $current_x>8 || $current_y<1 || $current_y>8 )
						$bContinue = false; // Out of the board => stop here for this direction
					else if( $board[ $current_x ][ $current_y ] === null )
						$bContinue = false; // An empty square => stop here for this direction
					else if( $board[ $current_x ][ $current_y ] != $player )
					{
						// There is a disc from our opponent on this square
						// => add it to the list of the "may be turned over", and continue on this direction
						$mayBeTurnedOver[] = array( 'x' => $current_x, 'y' => $current_y );
					}
					else if( $board[ $current_x ][ $current_y ] == $player )
					{
						// This is one of our disc

						if( count( $mayBeTurnedOver ) == 0 )
						{
							// There is no disc to be turned over between our 2 discs => stop here for this direction
							$bContinue = false;
						}
						else
						{
							// We found some disc to be turned over between our 2 discs
							// => add them to the result and stop here for this direction
							$turnedOverDiscs = array_merge( $turnedOverDiscs, $mayBeTurnedOver );
							$bContinue = false;
						}
					}
				}
			}
		}

		return $turnedOverDiscs;
	}



//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

	function playDisc( int $x, int $y )
	{
		// Check that this player is active and that this action is possible at this moment
		self::checkAction( 'playDisc' );

		// Now, check if this is a possible move
		$board = self::getBoard();
		$player_id = self::getActivePlayerId();
		$turnedOverDiscs = self::getTurnedOverDiscs( $x, $y, $player_id, $board );

		if( count( $turnedOverDiscs ) <= 0 )
			throw new BgaSystemException( "Impossible move" );

		// This move is possible!

		// Let's place a disc at x,y and return all "$returned" discs to the active player
		$sql = "UPDATE board SET board_player='$player_id'
				WHERE ( board_x, board_y) IN ( ";
		foreach( $turnedOverDiscs as $turnedOver )
			$sql .= "('".$turnedOver['x']."','".$turnedOver['y']."'),";
		$sql .= "('$x','$y') ) ";

		self::DbQuery( $sql );

		// Update scores according to the number of disc on board
		$sql = "UPDATE player
				SET player_score = (
				SELECT COUNT( board_x ) FROM board WHERE board_player=player_id
				)";
		self::DbQuery( $sql );

		// Then, go to the next state
		$this->gamestate->nextState( 'playDisc' );
	}

//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

	function argPlayerTurn()
	{
		$possibleMoves = self::getPossibleMoves( self::getActivePlayerId() );
		return array(
			'possibleMoves' => $possibleMoves
		);
	}

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

	// Game state actions
	function stNextPlayer()
	{
		// Active next player
		$player_id = self::activeNextPlayer();

		// Check if both player has at least 1 discs, and if there are free squares to play
		$sql = "SELECT board_player, COUNT( board_x ) FROM board
				GROUP BY board_player";
		$player_to_discs = self::getCollectionFromDb( $sql, true );

		if( ! isset( $player_to_discs[ null ] ) )
		{
			// Index 0 has not been set => there's no more free place on the board !
			// => end of the game
			$this->gamestate->nextState( 'endGame' );
			return ;
		}
		else if( ! isset( $player_to_discs[ $player_id ] ) )
		{
			// Active player has no more disc on the board => he looses immediately
			$this->gamestate->nextState( 'endGame' );
			return ;
		}
		
		// Can this player play?

		$possibleMoves = self::getPossibleMoves( $player_id );
		if( count( $possibleMoves ) == 0 )
		{
			// This player can't play
			// Can his opponent play ?
			$opponent_id = self::getUniqueValueFromDb( "SELECT player_id FROM player WHERE player_id!='$player_id' " );
			if( count( self::getPossibleMoves( $opponent_id ) ) == 0 )
			{
				// Nobody can move => end of the game
				$this->gamestate->nextState( 'endGame' );
			}
			else
			{            
				// => pass his turn
				$this->gamestate->nextState( 'cantPlay' );
			}
		}
		else
		{
			// This player can play. Give him some extra time
			self::giveExtraTime( $player_id );
			$this->gamestate->nextState( 'nextTurn' );
		}
	}

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
